---
title: MySQL同步报错故障处理集锦
categories:
  - 数据库
tags:
  - mysql
date: 2017-1-15 21:18:00
toc: true
---

### 前言
在发生故障切换后，经常遇到的问题就是同步报错，下面是最近收集的报错信息。

---

### 记录删除失败
**在master上删除一条记录，而slave上找不到**
```bash
Last_SQL_Error: Could not execute Delete_rows event on table hcy.t1; 
Can't find record in 't1', 
Error_code: 1032; handler error HA_ERR_KEY_NOT_FOUND; 
the event's master log mysql-bin.000006, end_log_pos 254
```

解决方法：master要删除一条记录，而slave上找不到报错，这种情况主都已经删除了，那么从机可以直接跳过。
```bash
stop slave;
set global sql_slave_skip_counter=1;
start slave;
```
如果这种情况很多，需要针对这种错误专门写相关脚本。

<!-- more -->

---


### 主键重复
在slave已经有该记录，又在master上插入了同一条记录。
```bash
Last_SQL_Error: Could not execute Write_rows event on table hcy.t1; 
Duplicate entry '2' for key 'PRIMARY', 
Error_code: 1062; 
handler error HA_ERR_FOUND_DUPP_KEY; the event's master log mysql-bin.000006, end_log_pos 924
```
解决方法：

在slave上用desc hcy.t1; 先看下表结构：
```bash
mysql> desc hcy.t1;
+-------+---------+------+-----+---------+-------+
| Field | Type    | Null | Key | Default | Extra |
+-------+---------+------+-----+---------+-------+
| id    | int(11) | NO   | PRI | 0       |       | 
| name  | char(4) | YES  |     | NULL    |       | 
+-------+---------+------+-----+---------+-------+
```
删除重复的主键
```bash
mysql> delete from t1 where id=2;
Query OK, 1 row affected (0.00 sec)

mysql> start slave;
Query OK, 0 rows affected (0.00 sec)

mysql> show slave status\G;
……
Slave_IO_Running: Yes
Slave_SQL_Running: Yes
……
mysql> select * from t1 where id=2;
```
在master上和slave上再分别确认一下。

---

### 更新丢失
在master上更新一条记录，而slave上找不到，丢失了数据。
```bash
Last_SQL_Error: Could not execute Update_rows event on table hcy.t1; 
Can't find record in 't1', 
Error_code: 1032; 
handler error HA_ERR_KEY_NOT_FOUND; 
the event's master log mysql-bin.000010, end_log_pos 794
```
解决方法：

在master上，用mysqlbinlog 分析下出错的binlog日志在干什么。
```bash
/usr/local/mysql/bin/mysqlbinlog --no-defaults -v -v --base64-output=DECODE-ROWS mysql-bin.000010 | grep -A '10' 794

#120302 12:08:36 server id 22  end_log_pos 794  Update_rows: table id 33 flags: STMT_END_F
### UPDATE hcy.t1
### WHERE
###   @1=2 /* INT meta=0 nullable=0 is_null=0 */
###   @2='bbc' /* STRING(4) meta=65028 nullable=1 is_null=0 */
### SET
###   @1=2 /* INT meta=0 nullable=0 is_null=0 */
###   @2='BTV' /* STRING(4) meta=65028 nullable=1 is_null=0 */
# at 794
#120302 12:08:36 server id 22  end_log_pos 821  Xid = 60
COMMIT/*!*/;
DELIMITER ;
# End of log file
ROLLBACK /* added by mysqlbinlog */;
/*!50003 SET COMPLETION_TYPE=@OLD_COMPLETION_TYPE*/;
```

在slave上，查找下更新后的那条记录，应该是不存在的。
```bash
mysql> select * from t1 where id=2;
Empty set (0.00 sec)
```
然后再到master查看
```bash
mysql> select * from t1 where id=2;
+----+------+
| id | name |
+----+------+
|  2 | BTV  | 
+----+------+
1 row in set (0.00 sec)
```
把丢失的数据在slave上填补，然后跳过报错即可。
```bash
mysql> insert into t1 values (2,'BTV');
Query OK, 1 row affected (0.00 sec)

mysql> select * from t1 where id=2;    
+----+------+
| id | name |
+----+------+
|  2 | BTV  | 
+----+------+
1 row in set (0.00 sec)

mysql> stop slave ;set global sql_slave_skip_counter=1;start slave;
Query OK, 0 rows affected (0.01 sec)
Query OK, 0 rows affected (0.00 sec)
Query OK, 0 rows affected (0.00 sec)

mysql> show slave status\G;
……
 Slave_IO_Running: Yes
 Slave_SQL_Running: Yes
……
```

---

### 1236错误, 二进制文件缺失
误删二进制文件等各种原因，导致主库mysql-bin.000012文件丢失，从库同步失败。
```bash
Master_Log_File: mysql-bin.000012
Slave_IO_Running: No
Slave_SQL_Running: Yes
Last_IO_Error: Got fatal error 1236 from master when reading data from binary log: 'Could not find first log file name in binary log index file'
```

- 首先停止从库同步
```bash
slave stop;
```
- 查看主库日志文件和位置
```bash
mysql> show master logs;
+------------------+-----------+
| Log_name         | File_size |
+------------------+-----------+
| mysql-bin.000013 |       154 |
+------------------+-----------+
```
- 回从库，使日志文件和位置对应主库
```bash
CHANGE MASTER TO MASTER_LOG_FILE='log-bin.000013',MASTER_LOG_POS=154;
```
- 最后，启动从库：
```bash
slave start;

show slave status\G;

Master_Log_File: mysql-bin.000013
Slave_IO_Running: Yes
Slave_SQL_Running: Yes
Last_IO_Error:
```

---

### 中继日志损坏
slave的中继日志relay-bin损坏。
```bash
Last_SQL_Error: Error initializing relay log position: I/O error reading the header from the binary log
Last_SQL_Error: Error initializing relay log position: Binlog has bad magic number;  
It's not a binary log file that can be used by  this version of MySQL
```

1、手工修复
解决方法：找到同步的binlog和POS点，然后重新做同步，这样就可以有新的中继日值了。

例子：
```bash
mysql> show slave status\G;
*************************** 1. row ***************************
              Master_Log_File: mysql-bin.000010
          Read_Master_Log_Pos: 1191
               Relay_Log_File: vm02-relay-bin.000005
                Relay_Log_Pos: 253
        Relay_Master_Log_File: mysql-bin.000010
             Slave_IO_Running: Yes
            Slave_SQL_Running: No
              Replicate_Do_DB: 
          Replicate_Ignore_DB: 
           Replicate_Do_Table: 
       Replicate_Ignore_Table: 
      Replicate_Wild_Do_Table: 
  Replicate_Wild_Ignore_Table: 
                   Last_Errno: 1593
                   Last_Error: Error initializing relay log position: I/O error reading the header from the binary log
                 Skip_Counter: 1
          Exec_Master_Log_Pos: 821

Slave_IO_Running ：接收master的binlog信息
                   Master_Log_File
                   Read_Master_Log_Pos

Slave_SQL_Running：执行写操作
                   Relay_Master_Log_File
                   Exec_Master_Log_Pos
```

以执行写的binlog和POS点为准。
```bash
Relay_Master_Log_File: mysql-bin.000010
Exec_Master_Log_Pos: 821
```

```bash
mysql> stop slave;
Query OK, 0 rows affected (0.01 sec)

mysql> CHANGE MASTER TO MASTER_LOG_FILE='mysql-bin.000010',MASTER_LOG_POS=821;
Query OK, 0 rows affected (0.01 sec)

mysql> start slave;
Query OK, 0 rows affected (0.00 sec)


mysql> show slave status\G;
*************************** 1. row ***************************
               Slave_IO_State: Waiting for master to send event
                  Master_Host: 192.168.8.22
                  Master_User: repl
                  Master_Port: 3306
                Connect_Retry: 10
              Master_Log_File: mysql-bin.000010
          Read_Master_Log_Pos: 1191
               Relay_Log_File: vm02-relay-bin.000002
                Relay_Log_Pos: 623
        Relay_Master_Log_File: mysql-bin.000010
             Slave_IO_Running: Yes
            Slave_SQL_Running: Yes
              Replicate_Do_DB: 
          Replicate_Ignore_DB: 
           Replicate_Do_Table: 
       Replicate_Ignore_Table: 
      Replicate_Wild_Do_Table: 
  Replicate_Wild_Ignore_Table: 
                   Last_Errno: 0
                   Last_Error: 
                 Skip_Counter: 0
          Exec_Master_Log_Pos: 1191
              Relay_Log_Space: 778
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
```

2、Ibbackup
各种大招都用上了，无奈slave数据丢失过多，ibbackup（需要银子）该你登场了。

Ibbackup热备份工具，是付费的。xtrabackup是免费的，功能上一样。

Ibbackup备份期间不锁表，备份时开启一个事务（相当于做一个快照），然后会记录一个点，之后数据的更改保存在ibbackup_logfile文件里，恢复时把ibbackup_logfile 变化的数据再写入到ibdata里。

Ibbackup 只备份数据（ ibdata、.ibd ），表结构.frm不备份。

