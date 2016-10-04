---
title: MySQL主从搭建
tags:
  - mysql
categories:
  - 部署配置
date: 2016-9-21 22:22:00
---

### 注意事项
1、主从服务器操作系统版本和位数一致。
2、MySQL版本一致。

### 服务器配置
**Master**: 192.168.1.18
**Slave**: 192.168.1.16

---

### Master(192.168.1.18)服务器配置
1、编辑配置文件

```bash
#如果my.cnf文件不存在，就手动复制一个
vim /etc/my.cnf
```

```bash
[mysqld]  
#数据库服务的唯一标识，一般设置为服务器IP的末尾号
server-id=1
  
#启动二进制文件   
log-bin=master-bin
log-bin-index=master-bin.index

#需要备份的数据库  
binlog-do-db=orders

#不需要备份的数据库  
binlog-ignore-db=mysql

#若没有配置binlog-do-db和binlog_ignore_db，表示备份全部数据库。
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
mysql> create user 'mastj'@'192.168.1.16' identified by '123456';
        
#配置主从复制权限
mysql> grant replication slave on *.* to 'mastj'@'192.168.1.16' identified by '123456';
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

## Slave(192.168.1.16)服务器配置
1、配置服务ID
```bash
# vim /etc/my.cnf 

#数据库服务的唯一标识，一般设置为服务器IP的末尾号
server-id=2
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
```

**若Slave_IO_Running和Slave_SQL_Running均为Yes，则表示配置成功。**
<br/>