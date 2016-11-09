---
title: MySQL主从搭建
tags:
  - mysql
categories:
  - 运维部署
date: 2016-10-7 22:22:00
---

### 注意事项
1、主从服务器操作系统版本和位数一致。
2、MySQL版本一致。

### 服务器配置
**Master**: 192.168.1.18
**Slave**: 192.168.1.16

---

### <font style="color:red">Master(192.168.1.18)服务器配置</font>
1、编辑配置文件

```bash
# 如果不存在，就手动创建一个
vim /etc/my.cnf

在配置文件加入如下值：

[mysqld]  
# 唯一的服务辨识号,数值位于 1 到 2^32-1之间.
# 此值在master和slave上都需要设置.
# 如果 “master-host” 没有被设置,则默认为1, 但是如果忽略此选项,MySQL不会作为master生效.
server-id=1
  
# 打开二进制日志功能.
# 在复制(replication)配置中,作为 MASTER 主服务器必须打开此项
# 如果你需要从你最后的备份中做基于时间点的恢复,你也同样需要二进制日志.   
log-bin=master-bin
log-bin-index=master-bin.index

#需要备份的数据库  
binlog-do-db=orders

#不需要备份的数据库
#若没有配置binlog-do-db和binlog_ignore_db，表示备份全部数据库。
binlog-ignore-db=mysql

```

<!-- more -->

2、重启mysqld服务
```bash
service mysqld restart
```
 
3、为从MySQL创建用户
```bash
#登录
mysql -uroot -p
Enter password: 

#创建用户
mysql> create user 'mastj'@'192.168.1.16(从机ip)' identified by '123456';
        
#配置主从复制权限
mysql> grant replication slave on *.* to 'mastj'@'192.168.1.16(从机ip)' identified by '123456';
```

4、若orders中已有数据，还需要锁定主服务器数据库，然后将数据导入到从数据库
```bash
#锁定
mysql> flush tables with read lock;

#数据复制到从数据库后，查看主数据库master状态并解锁：
mysql> show master status;  
+------------------+----------+--------------+------------------+-------------------+  
| File             | Position | Binlog_Do_DB | Binlog_Ignore_DB | Executed_Gtid_Set |  
+------------------+----------+--------------+------------------+-------------------+  
| mysql-bin.000003 |     2005 | orders       | mysql            |                   |  
+------------------+----------+--------------+------------------+-------------------+  
1 row in set (0.00 sec)  
  
mysql> unlock tables; 
```

---

## <font style="color:red">Slave(192.168.1.16)服务器配置<font>
1、配置服务ID
```bash
vim /etc/my.cnf 

[mysqld]
#server_id是必须的，而且唯一
server-id=2

# 使得slave只读.只有用户拥有SUPER权限和在上面的slave线程能够修改数据.
# 你可以使用此项去保证没有应用程序会意外的修改slave而不是master上的数据
#read_only

# 如果你在使用链式从服务器结构的复制模式 (A->B->C),
# 需要打开slave的二进制日志
#log_bin=mysql-bin

# 如果你在使用链式从服务器结构的复制模式 (A->B->C),
# 你需要在服务器B上打开此项.
# 此选项打开在从线程上重做过的更新的日志, 并将其写入从服务器的二进制日志.
# 如果打开log_bin，却没有设置log_slave_updates，这是一种错误的配置。
#log_slave_updates

```

2、重启MySQL服务
```bash
service mysqld restart
```

3、配置复制
```bash
#登录
mysql -uroot -p
Enter password: 
       
#执行
mysql> change master to master_host='192.168.1.18',
                master_user='mastj',
                master_password='123456',
                master_port=3306,
                master_log_file='mysql-bin.000003',
                master_log_pos=2005,
                master_connect_retry=10;
```

**参数详解：**
master_host:主服务器的IP。
master_user：配置主服务器时建立的用户名
master_password：用户密码
master_port：主服务器mysql端口，如果未曾修改，默认即可。
master_log_file：日志文件名称，**填写查看master状态时显示的File**
master_log_pos：日志位置，**填写查看master状态时显示的Position**
master_connect_retry：重连次数

4、启动进程
```bash
mysql> start slave;
```

5、检查主从复制状态
```bash
mysql> show slave status\G  
*************************** 1. row ***************************  
               Slave_IO_State: Waiting for master to send event  
                  Master_Host: 192.168.1.18  
                  Master_User: mastj  
                  Master_Port: 3306  
                Connect_Retry: 10  
              Master_Log_File: mysql-bin.000003  
          Read_Master_Log_Pos: 2369  
               Relay_Log_File: jhq0113-relay-bin.000002  
                Relay_Log_Pos: 647  
        Relay_Master_Log_File: mysql-bin.000003  
             Slave_IO_Running: Yes  
            Slave_SQL_Running: Yes  
            ...
```

**若Slave_IO_Running和Slave_SQL_Running均为Yes，则表示配置成功。**

---

## MySQL复制过程
MySQL主从复制过程主要由三个线程来完成，其中两个线程(Sql线程和IO线程)在Slave端，另外一个线程(IO线程)在Master端。
- Slave 上面的IO线程连接上 Master，并请求从指定日志文件的指定位置(或者从最开始的日志)之后的日志内容；
- Master 接收到来自 Slave 的 IO 线程的请求后，通过负责复制的 IO 线程根据请求信息读取指定日志指定位置之后的日志信息，返回给 Slave 端的 IO 线程。返回信息中除了日志所包含的信息之外，还包括本次返回的信息在 Master 端的 Binary Log 文件的名称以及在 Binary Log 中的位置；
- Slave 的 IO 线程接收到信息后，将接收到的日志内容依次写入到 Slave 端的Relay Log文件(mysql-relay-bin.xxxxxx)的最末端，并将读取到的Master端的bin-log的文件名和位置记录到master- info文件中，以便在下一次读取的时候能够清楚的高速Master“我需要从某个bin-log的哪个位置开始往后的日志内容，请发给我”
- Slave 的 SQL 线程检测到 Relay Log 中新增加了内容后，会马上解析该 Log 文件中的内容成为在 Master 端真实执行时候的那些可执行的 Query 语句，并在自身执行这些 Query。这样，实际上就是在 Master 端和 Slave 端执行了同样的 Query，所以两端的数据是完全一样的。

---

## 相关链接

**my.cnf参数详解**
https://my.oschina.net/eduosi/blog/270535

**<font style="color:red">线上MySQL主从同步报错故障处理总结</font>**
http://xstarcd.github.io/wiki/MySQL/online_mysqlrepl_error.html

**Mysql主从架构的复制原理**
http://blog.csdn.net/hguisu/article/details/7325124

**不同场景下 MySQL 的迁移方案**
https://dbarobin.com/2015/09/15/migration-of-mysql-on-different-scenes

<br/>