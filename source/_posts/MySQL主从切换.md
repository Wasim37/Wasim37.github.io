---
title: MySQL主从切换
tags:
  - mysql
categories:
  - 运维部署
date: 2016-10-14 22:22:00
toc: false
---

生产环境中，架构很多为一主多从。比如一个主数据库M，两个从数据库S1，S2同时指向主数据库M。

当主服务器M因为意外情况宕机，需要将其中的一个从数据库服务器（假设选择S1）切换成主数据库服务器，同时修改另一个从数据库（S2）的配置，使其指向新的主数据库（S1）。

此外还需要通知应用修改主数据库的IP地址，如果可能，将出现故障的主数据库(M)修复或者重置成新的从数据库。
通常我们还有其他的方案来实现高可用，比如MHA，MySQL Cluster，MMM，这些暂不讨论。

### 操作步骤

<font style="color:red">1、首先要确保所有的从数据库都已经执行了relay log中的全部更新，在每个从库上，执行stop slave io_thread，停止IO线程，然后检查show processlist的输出，直到看到状态是Slave has read all relay log; waiting for the slave I/O thread to update it，表示更新都执行完毕</font>

S1(从库1操作)：
```bash
mysql> stop slave io_thread;
Query OK, 0 rows affected (0.06 sec)

mysql> show processlist\G
*************************** 1. row ***************************
     Id: 3
   User: system user
   Host: 
     db: NULL
Command: Connect
   Time: 2601
  State: Slave has read all relay log; waiting for the slave I/O thread to update it
   Info: NULL
*************************** 2. row ***************************
     Id: 4
   User: root
   Host: localhost
     db: NULL
Command: Query
   Time: 0
  State: NULL
   Info: show processlist
rows in set (0.00 sec)

mysql>
```

<!-- more -->

S2(从库2操作)：
```bash
mysql> stop slave io_thread; 
Query OK, 0 rows affected (0.00 sec)

mysql> show processlist\G
*************************** 1. row ***************************
     Id: 4
   User: system user
   Host: 
     db: NULL
Command: Connect
   Time: 2721
  State: Slave has read all relay log; waiting for the slave I/O thread to update it
   Info: NULL
*************************** 2. row ***************************
     Id: 5
   User: root
   Host: localhost
     db: NULL
Command: Query
   Time: 0
  State: NULL
   Info: show processlist
rows in set (0.00 sec)

mysql>
```

<font style="color:red">2、在从库S1上，执行stop slave停止从服务，然后执行reset master以重置成主数据库，并且进行授权账号，让S2（从库2）有权限进行连接</font>

S1（从库1操作）：

```bash
mysql> stop slave;
Query OK, 0 rows affected (0.01 sec)

mysql> reset master;
Query OK, 0 rows affected (0.06 sec)

mysql> grant replication slave on *.* to 'repl'@'192.168.0.100' identified by '123456';
Query OK, 0 rows affected (0.00 sec)

mysql>
```

<font style="color:red">3、在S2（从库2）上，执行stop slave停止从服务，然后执行change master to master_host='S1'以重新设置主数据库，然后再执行start slave启动复制：</font>

S2（从库2操作）：

```bash
mysql> stop slave;
Query OK, 0 rows affected (0.01 sec)

mysql> change master to master_host='192.168.0.20';
Query OK, 0 rows affected (0.06 sec)

mysql> start slave;
Query OK, 0 rows affected (0.00 sec)

mysql>
```

<font style="color:red">4、查看S2（从库2）复制状态是否正常：</font>

```bash
mysql> show slave status\G
*************************** 1. row ***************************
               Slave_IO_State: Waiting for master to send event
                  Master_Host: 192.168.0.20
                  Master_User: repl
                  Master_Port: 3306
                Connect_Retry: 2
              Master_Log_File: mysql-bin.000001
          Read_Master_Log_Pos: 261
               Relay_Log_File: MySQL-02-relay-bin.000002
                Relay_Log_Pos: 407
        Relay_Master_Log_File: mysql-bin.000001
             Slave_IO_Running: Yes
            Slave_SQL_Running: Yes
              Replicate_Do_DB: 
          Replicate_Ignore_DB: 
           Replicate_Do_Table: 
       Replicate_Ignore_Table: 
      Replicate_Wild_Do_Table: yayun.%
  Replicate_Wild_Ignore_Table: 
                   Last_Errno: 0
                   Last_Error: 
                 Skip_Counter: 0
          Exec_Master_Log_Pos: 261
              Relay_Log_Space: 566
              Until_Condition: None
               Until_Log_File: 
                Until_Log_Pos: 0
           Master_SSL_Allowed: No
           Master_SSL_CA_File: 
           Master_SSL_CA_Path: 
              Master_SSL_Cert: 
            Master_SSL_Cipher: 
               Master_SSL_Key: 
        Seconds_Behind_Master: 0
Master_SSL_Verify_Server_Cert: No
                Last_IO_Errno: 0
                Last_IO_Error: 
               Last_SQL_Errno: 0
               Last_SQL_Error: 
  Replicate_Ignore_Server_Ids: 
             Master_Server_Id: 2
row in set (0.00 sec)

mysql>
```

查看原来的从库S1，现在的主库的show processlist情况：
```bash
mysql> show  processlist\G
*************************** 1. row ***************************
     Id: 4
   User: root
   Host: localhost
     db: NULL
Command: Query
   Time: 0
  State: NULL
   Info: show  processlist
*************************** 2. row ***************************
     Id: 7
   User: repl
   Host: 192.168.0.100:60235
     db: NULL
Command: Binlog Dump
   Time: 184
  State: Master has sent all binlog to slave; waiting for binlog to be updated
   Info: NULL
rows in set (0.00 sec)

mysql>
```

<font style="color:red">5、通知所有的客户端将应用指向S1（已提升为主库）,这样客户端发送的所有的更新变化将记录到S1的二进制日志。</font>

<font style="color:red">6、删除S1（新的主库）服务器上的master.info和relay-log.info文件，否则下次重启时还会按照从库启动。我们也可以设置该参数：</font>
```bash
skip_slave_start
```

7、最后，如果M服务器修复以后，则可以按照S2的方法配置成S1的从库。


8、上面的测试步骤中S1默认都是打开log-bin选项的，这样重置成主数据库后可以将二进制日志记录下来，并传送到其他从库，这是提升为主库必须的。其次，S1没有打开log-slave-updates参数，否则重置成主库以后，可能会将已经执行过的二进制日志重复传送给S2，导致S2同步错误。

---

### 相关链接

主从切换脚本参考链接：http://blog.itpub.net/25356953/viewspace-1745534/