---
title: MySQL数据目录更改及相关问题解决方案
tags:
  - mysql
categories:
  - 数据库
date: 2017-1-12 22:22:00
toc: false

---

### 步骤相关

1、停掉MySQL服务
service mysql stop

2、把旧的数据目录/var/lib/mysql备份到新的数据目录/data/mysql
cp /var/lib/mysql /data -R

3、给mysql组的mysql用户赋予新的数据目录的权限
chown -R mysql:mysql /data/mysql

4、修改my.cnf
datadir=/var/lib/mysql，改为datadir=/data/mysql

5、如果mysql事先为手动安装，还需修改MySQL启动脚本/etc/init.d/mysql
datadir=/data/mysql

6、重启MySQL服务
service mysql restart

<!-- more -->

---

### 问题相关
**数据迁移后，服务启动失败，报如下错误**
```bash
The server quit without updating PID file
```

原因：可能datadir目录修改或其他原因，mysql用户没有PID或其他相关文件的权限
方案：相关目录执行 "chown -R mysql:mysql /data/mysql"，然后重启服务。

原因：可能已存在mysql进程
方案：执行"ps -ef|grep mysqld"，用"kill -9  进程号"杀死已经发现的进程，然后重启服务。

原因：可能第二次重装mysql，残余数据影响了服务启动
方案：去mysql数据目录/data看看，如果存在mysql-bin.index，先备份再删除试试。或者用"find / -name '*mysql*'"查找残余数据，然后删除。

原因：selinux问题，如果是centos系统，可能会默认开启selinux
方案：编辑 /etc/selinux/config，把 SELINUX=enforcing 改为 SELINUX=disabled ，然后重启服务。

原因：skip-federated字段问题
方案：检查 my.cnf 文件是否有没被注释掉的 skip-federated 字段，如果有就注释掉。

原因：其他未知错误
方案：在 my.cnf 配置错误日志，log-error=/data/mysql/mysqld.log，再次重启，如果失败查看相关日志。