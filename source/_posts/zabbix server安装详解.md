---
title: zabbix server安装详解
categories:
  - 运维部署
tags:
  - zabbix
date: 2016-9-23 22:41:19
toc: false
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
> zabbix-agent需要安装在被监控的机器上，详见另一篇文档《zabbix agent安装详解》

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

```bash
# 设置自启动
chkconfig httpd on
chkconfig --list|grep httpd
```

<br/>

---

## 中文设置及中文乱码

### 中文设置
【登陆】->【profile】->【User】，language改为chinese[zh_CN].

### 中文乱码
由于zabbix的web前端默认没有中文字库，因此zabbix图形化显示时下面的中文都是方框。
解决方法就是拷贝中文字体到zabbix前端。

1.进入c:\Windows\Fonts，选择其中任意一种中文字库例如楷体文件simkai.ttf，将其拷贝至zabbix的web 前端页面字体/usr/share/zabbix/fonts 下
```bash
[root@iZ94ekimlddZ fonts]# ls
graphfont.ttf  simkai.ttf
```

2.修改zabbix的web前端 defines.inc.php
```bash
# vim /usr/share/zabbix/include/defines.inc.php

找到
define('ZBX_FONT_NAME',                       'DejaVuSans');
define('ZBX_GRAPH_FONT_NAME',                 'DejaVuSans'); 

这2行修改为
define('ZBX_FONT_NAME',                       'SIMKAI');
define('ZBX_GRAPH_FONT_NAME',                 'SIMKAI'); 

保存退出
```

---

## 其他

**Zabbix官网安装教程(翻墙)：**
https://www.zabbix.com/documentation/2.2/manual/installation/install_from_packages#red_hat_enterprise_linux_centos

**zabbix中文操作手册：**
http://pan.baidu.com/s/1i46GoQh 密码：xw5n (手册中有相关shell脚本下载地址)

![zabbix中文操作手册](http://7xvfir.com1.z0.glb.clouddn.com/zabbix%E5%AE%89%E8%A3%85/1.png)

**zabbix_agentd.conf配置文件详解**
http://www.ttlsa.com/zabbix/zabbix_agentd-conf-description/

**zabbix_server.conf配置文件详解**
http://www.ttlsa.com/zabbix/zabbix_server-conf-detail/

**grafana-zabbix插件安装：**
在grafana插件中心安装grafana-zabbix插件后，需要配置相关数据源：
http://blog.csdn.net/zk673820543/article/details/50617412

**grafana-zabbix使用教程【内含gif图】：**
https://github.com/alexanderzobnin/grafana-zabbix/wiki/Usage

![](http://7xvfir.com1.z0.glb.clouddn.com/zabbix%E5%AE%89%E8%A3%85/2.gif)
