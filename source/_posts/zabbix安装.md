---
title: zabbix安装
categories:
  - Linux
date: 2016-9-22 22:41:19
---

## 简介
zabbix（音同 zæbix）是一个基于WEB界面的提供分布式系统监视以及网络监视功能的企业级的开源解决方案。
zabbix能监视各种网络参数，保证服务器系统的安全运营；并提供灵活的通知机制以让系统管理员快速定位/解决存在的各种问题。

zabbix由2部分构成，zabbix server与可选组件zabbix agent。
zabbix server可以通过SNMP，zabbix agent，ping，端口监视等方法提供对远程服务器/网络状态的监视，数据收集等功能，它可以运行在Linux，Solaris，HP-UX，AIX，Free BSD，Open BSD，OS X等平台上。

--- 
## 安装

### Installing repository configuration package

Zabbix 2.2 for RHEL5, Oracle Linux 5, CentOS 5:

```bash
rpm -ivh http://repo.zabbix.com/zabbix/2.2/rhel/5/x86_64/zabbix-release-2.2-1.el5.noarch.rpm
```

Zabbix 2.2 for RHEL6, Oracle Linux 6, CentOS 6:
```bash
rpm -ivh http://repo.zabbix.com/zabbix/2.2/rhel/6/x86_64/zabbix-release-2.2-1.el6.noarch.rpm
```

<!-- more -->

Zabbix 2.2 for RHEL7, Oracle Linux 7, CentOS 7:
```bash		
rpm -ivh http://repo.zabbix.com/zabbix/2.2/rhel/7/x86_64/zabbix-release-2.2-1.el7.noarch.rpm
```

### Installing Zabbix packages

Install Zabbix packages. Example for Zabbix server and web frontend with mysql database.

```bash
yum install zabbix-server-mysql zabbix-web-mysql
```

Example for installing Zabbix agent only.
```bash
yum install zabbix-agent
```
> zabbix-agent安装在需要监控的机器上

### Creating initial database
Create zabbix database and user on MySQL.

```bash
# mysql -uroot
mysql> create database zabbix character set utf8 collate utf8_bin;
mysql> grant all privileges on zabbix.* to zabbix@localhost identified by 'zabbix';
mysql> exit
```

Import initial schema and data.
```bash
cd /usr/share/doc/zabbix-server-mysql-2.2.0/create
mysql -uroot zabbix < schema.sql
mysql -uroot zabbix < images.sql
mysql -uroot zabbix < data.sql
```

### Starting Zabbix server process
Edit database configuration in zabbix_server.conf
```bash
# vi /etc/zabbix/zabbix_server.conf
DBHost=localhost
DBName=zabbix
DBUser=zabbix
DBPassword=zabbix
```

Start Zabbix server process.
```bash
service zabbix-server start
```

### Editing PHP configuration for Zabbix frontend

Apache configuration file for Zabbix frontend is located in /etc/httpd/conf.d/zabbix.conf. Some PHP settings are already configured.

```bash
php_value max_execution_time 300
php_value memory_limit 128M
php_value post_max_size 16M
php_value upload_max_filesize 2M
php_value max_input_time 300
# php_value date.timezone Europe/Riga
```

It's necessary to uncomment the “date.timezone” setting and set the right timezone for you. After changing the configuration file restart the apache web server.

> 如上所述，此处时区配置项需要修改，可改为 php_value date.timezone Asia/Shanghai

```bash
service httpd restart
```

Zabbix frontend is available at http://zabbix-frontend-hostname/zabbix in the browser. 
Default username/password is **Admin/zabbix**.

---
## 其他

**官网教程：**
https://www.zabbix.com/documentation/2.2/manual/installation/install_from_packages#red_hat_enterprise_linux_centos

**zabbix中文操作手册：**
http://pan.baidu.com/s/1i46GoQh 密码：xw5n

![zabbix中文操作手册](1.png)

