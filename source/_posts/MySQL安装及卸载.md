---
title: MySQL安装及卸载
tags:
  - mysql
categories:
  - 数据库
date: 2016-9-27 22:22:00
toc: true
---

### 安装
此安装为手动安装，非yum安装。
官网下载地址：http://downloads.mysql.com/archives/community/

```bash
#解压
cd /usr/local/
tar -zxvf mysql-5.7.13-linux-glibc2.5-x86_64.tar.gz
mv mysql-5.7.13-linux-glibc2.5-x86_64 mysql

#创建实例目录
mkdir /data/mysql
#创建数据目录
mkdir /data/mysql/data
#创建日志目录
mkdir /data/mysql/logs

#添加用户、组
groupadd mysql
useradd -r -g mysql -s /bin/false mysql

#设置权限
chown -R mysql:mysql /usr/local/mysql /data/mysql
chmod 750 /usr/local/mysql /data/mysql

#安装，初始化数据库
yum install -y libaio
/usr/local/mysql/bin/mysqld --initialize-insecure --user=mysql --basedir=/usr/local/mysql --datadir=/data/mysql/data
```

<!-- more -->

```bash
#配置文件
cp -rf /usr/local/mysql/support-files/my-default.cnf /data/mysql
mv my-default.cnf my.cnf

#my.cnf参数配置
[mysql]
socket = /data/mysql/mysql.sock

[mysqld]
lower_case_table_names = 1

basedir = /usr/local/mysql
datadir = /data/mysql/data
port = 3306

socket = /data/mysql/mysql.sock

[mysqld_safe]
user = mysql
port = 3306
datadir = /data/mysql/data
log-error = /data/mysql/logs/mysqld.log
pid-file = /data/mysql/mysql.pid
socket = /data/mysql/mysql.sock

sql_mode=NO_ENGINE_SUBSTITUTION,STRICT_TRANS_TABLES 
```

```bash
#启动服务 设置密码
/usr/local/mysql/bin/mysqld_safe --defaults-file=/data/mysql/my.cnf &
sleep 3
/usr/local/mysql/bin/mysqladmin -u root password wx123 --socket=/data/mysql/mysql.sock
```

```bash
#设置环境变量
vim /etc/profile
export PATH=/usr/local/mysql/bin:$PATH

source /etc/profile
```

```bash
# 配置启动脚本
cp /usr/local/mysql/support-files/mysql.server /etc/init.d/mysql

vim /etc/init.d/mysql

basedir=/usr/local/mysql
datadir=/data/mysql/data
mysqld_pid_file_path=/data/mysql/mysql.pid

#$bindir/mysqld_safe --datadir="$datadir" --pid-file="$mysqld_pid_file_path" $other_args >/dev/null 2>&1 &
$bindir/mysqld_safe --defaults-file=/data/mysql/my.cnf 1>/dev/null &
```

```bash
#配置服务
chmod +x /etc/init.d/mysql
chkconfig --add mysql
service mysql restart
```

```bash
#开机自启动
chkconfig mysql on
chkconfig --list|grep mysql
# mysql      0:off 1:off 2:off 3:on  4:on  5:on  6:off
```

---

### 卸载
手动删除
```bash
#停掉mysql服务
service mysql stop

#删除安装目录
rm -rf /usr/local/mysql

#删除数据目录
rm -rf /data/mysql

#删除残留文件
find / -name '*mysql*'
rm -rf XXX
```

---

yum删除
```bash
yum list installed | grep mysql
yum remove XXX

#删除残留文件
find / -name '*mysql*'
rm -rf XXX
```

---

### 自动化部署脚本
https://github.com/Wasim37/deployment-scripts/tree/master/mysql

---

### 相关链接
my.cnf配置文件：https://blog.linuxeye.com/379.html