---
title: zabbix监控mysql
categories:
  - 运维部署
tags:
  - zabbix
  - mysql
date: 2016-10-11 18:24:17
toc: false
---

> zabbix自带mysql监控模板，可监控mysql的增删改查、请求流量带宽和响应流量带宽等。

### 监控步骤

1、服务器上安装zabbix agent客户端，并修改zabbix_agentd.conf文件
```bash
# vim /etc/zabbix/zabbix_agentd.conf

EnableRemoteCommands=1  来至zabbix服务器的远程命令是否允许被执行
Server=zabbix_server_IP  zabbix服务器ip地址
ServerActive=zabbix_server_IP  主动向zabbix server发送监控内容
Hostname=name  name配置的内容要和zabbix服务器配置的Host name一致
UnsafeUserParameters=1  是否启用自定义key,zabbix监控mysql、tomcat等数据时需要自定义key
```

2、编写check_mysql.sh脚本, 存放路径：/etc/zabbix/scripts。
并赋予脚本执行权限【chmod +x check_mysql.sh】。

<!-- more -->

```bash
# 用户名
MYSQL_USER=''

# 密码
MYSQL_PWD=''

# 主机地址/IP
MYSQL_HOST=''

# 端口
MYSQL_PORT=''

# 数据连接
MYSQL_CONN="/usr/bin/mysqladmin -u${MYSQL_USER} -p${MYSQL_PWD} -h${MYSQL_HOST} -P${MYSQL_PORT}"
 
# 参数是否正确
if [ $# -ne "1" ];then 
    echo "arg error!" 
fi 
 
# 获取数据
case $1 in 
    Uptime) 
        result=`${MYSQL_CONN} status|cut -f2 -d":"|cut -f1 -d"T"` 
        echo $result 
        ;; 
    Com_update) 
        result=`${MYSQL_CONN} extended-status |grep -w "Com_update"|cut -d"|" -f3` 
        echo $result 
        ;; 
    Slow_queries) 
        result=`${MYSQL_CONN} status |cut -f5 -d":"|cut -f1 -d"O"` 
        echo $result 
        ;; 
    Com_select) 
        result=`${MYSQL_CONN} extended-status |grep -w "Com_select"|cut -d"|" -f3` 
        echo $result 
                ;; 
    Com_rollback) 
        result=`${MYSQL_CONN} extended-status |grep -w "Com_rollback"|cut -d"|" -f3` 
                echo $result 
                ;; 
    Questions) 
        result=`${MYSQL_CONN} status|cut -f4 -d":"|cut -f1 -d"S"` 
                echo $result 
                ;; 
    Com_insert) 
        result=`${MYSQL_CONN} extended-status |grep -w "Com_insert"|cut -d"|" -f3` 
                echo $result 
                ;; 
    Com_delete) 
        result=`${MYSQL_CONN} extended-status |grep -w "Com_delete"|cut -d"|" -f3` 
                echo $result 
                ;; 
    Com_commit) 
        result=`${MYSQL_CONN} extended-status |grep -w "Com_commit"|cut -d"|" -f3` 
                echo $result 
                ;; 
    Bytes_sent) 
        result=`${MYSQL_CONN} extended-status |grep -w "Bytes_sent" |cut -d"|" -f3` 
                echo $result 
                ;; 
    Bytes_received) 
        result=`${MYSQL_CONN} extended-status |grep -w "Bytes_received" |cut -d"|" -f3` 
                echo $result 
                ;; 
    Com_begin) 
        result=`${MYSQL_CONN} extended-status |grep -w "Com_begin"|cut -d"|" -f3` 
                echo $result 
                ;; 
                        
        *) 
        echo "Usage:$0(Uptime|Com_update|Slow_queries|Com_select|Com_rollback|Questions|Com_insert|Com_delete|Com_commit|Bytes_sent|Bytes_received|Com_begin)" 
        ;; 
esac

```

3、修改/etc/zabbix/zabbix_agentd.d下的userparameter_mysql.conf文件，没有就自行创建。
注释掉原有key，在最后一行新增如下数据：
```bash
UserParameter=mysql.version,mysql -V
UserParameter=mysql.ping,HOME=/var/lib/zabbix mysql ping | grep -c alive
UserParameter=mysql.status[*],/etc/zabbix/scripts/check_mysql.sh $1
```

4、重启zabbix客户端
```bash
service zabbix-agent restart
```

5、在zabbix服务器上添加监控主机和mysql模板，然后点击【图形】->【预览】，查看相关监控图像。

![](http://7xvfir.com1.z0.glb.clouddn.com/zabbix%E7%9B%91%E6%8E%A7mysql/1.png)

![](http://7xvfir.com1.z0.glb.clouddn.com/zabbix%E7%9B%91%E6%8E%A7mysql/2.png)

6、安装grafana-zabbix插件，通过grafana监控相关数据。

![](http://7xvfir.com1.z0.glb.clouddn.com/zabbix%E7%9B%91%E6%8E%A7mysql/3.png)

<br/>

---

### 问题排查思路

如果发现监控没有数据，请排查如下问题：
- abbix客户端是否重启
- 脚本是否有执行权限
- 数据库是否有权限
- 环境变量是否有问题
- zabbix item列是否显示红叉【鼠标移至图标，有错误提示】

<font style="color:red">具体错误，可以查看zabbix agent打印的日志</font>。
默认地址为：LogFile=/var/log/zabbix/zabbix_agentd.log，可在zabbix_agentd.conf中修改。

<font style="color:red">**此处需要注意的是**</font>，根据错误提示修改了配置，并重启了zabbix客户端，zabbix 服务器的item错误提示并不会马上消失，监控页面也不会马上产生数据，因此不要立马判断你的修改无效，有效方法是先查看是否有错误日志打印。

<br/>

---

### 错误相关

- 如果日志提示错误【/bin/sh^M: bad interpreter: No such file or directory】，那是shell脚本编码格式错误导致的，vim进入脚本文件，敲命令【:set ff=unix】，保存退出即可。

- 如果日志提示警告【mysqladmin: [Warning] Using a password on the command line interface can be insecure.】，那么需要额外定义一个.my.cnf文件，然后check_mysql.sh的用户名密码等从.my.cnf读取。

- 如果zabbix服务器item项总是提示【Not supported by Zabbix Agent】，不是配置问题就是版本问题，可以在zabbix server上执行zabbix_get命令来试着获取item值。
```bash
yum list all |grep zabbix-get
yum install zabbix-get.x86_64

/usr/bin/zabbix_get -s 127.0.0.1 -p 10050 -k "system.cpu.load[all,avg15]"
0.270000
```

<br/>

---

### 其他
zabbix可以自定义监控模板，用来监控mysql、tomcat和nginx等。
监控模板网上可以搜索到，然后点击【组态】->【模板】->【汇入】即可。
由于汇入的模板默认会覆盖原有配置，所以记得事先点击模板列表左下角的【汇出】进行相关模板备份。

<br/>