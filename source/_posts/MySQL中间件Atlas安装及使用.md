---
title: MySQL中间件Atlas安装及使用
categories:
  - 部署配置
tags:
  - atlas
  - mysql
date: 2016-10-18 18:24:17
---

### 简介
Atlas是由 Qihoo 360公司Web平台部基础架构团队开发维护的一个基于MySQL协议的数据中间层项目。它在MySQL官方推出的MySQL-Proxy 0.8.2版本的基础上，修改了大量bug，添加了很多功能特性。而且安装方便。配置的注释写的蛮详细的，都是中文。

### 主要功能
- 读写分离
- 从库负载均衡
- IP过滤
- 自动分表
- DBA可平滑上下线DB
- 自动摘除宕机的DB

### 相关链接
Mysql中间件产品比较：http://songwie.com/articlelist/44
Atlas的安装：https://github.com/Qihoo360/Atlas/wiki/Atlas的安装
Atlas功能特点FAQ：https://github.com/Qihoo360/Atlas/wiki/Atlas功能特点FAQ
Atlas性能特点：https://github.com/Qihoo360/Atlas/wiki/Atlas的性能测试
Atlas架构：https://github.com/Qihoo360/Atlas/wiki/Atlas的架构
Atlas+Keepalived：http://sofar.blog.51cto.com/353572/1601552
Atlas各项功能验证：http://blog.itpub.net/27000195/viewspace-1421262/

<!-- more -->

> 官网教程很详细，且是中文，这里就不详述相关安装过程了

### 设置开机自启动
```bash
echo "/usr/local/mysql-proxy/bin/mysql-proxyd test start" >> /etc/rc.local
```

### 添加atlas服务
```bash
# 编写简单的Atlas启动脚本
vim /etc/init.d/atlas

#!/bin/sh  

start()  
{  
        /usr/local/mysql-proxy/bin/mysql-proxyd test start
}  
stop()  
{  
        /usr/local/mysql-proxy/bin/mysql-proxyd test stop
}
status()  
{       
        /usr/local/mysql-proxy/bin/mysql-proxyd test status  
}
restart()  
{  
        /usr/local/mysql-proxy/bin/mysql-proxyd test restart
} 
ATLAS="/usr/local/mysql-proxy/bin/mysql-proxyd"  
[ -f $ATLAS ] || exit 1  
# See how we were called.  
case "$1" in  
        start)  
                start  
                ;;  
        stop)  
                stop  
                ;;  
        restart)  
                restart
                ;;  
        status)  
                status 
                ;;  
                # stop    sleep 3   start  ;;  
        *)  
                echo $"Usage: $0 {start|stop|status|restart}"  
                exit 1  
esac  
exit 0 

# atlas服务验证
service atlas status
service atlas start
service atlas restart
service atlas stop
```

### 查看MySQL监听端口
```bash
etstat -tanlp | grep mysql
tcp        0      0 0.0.0.0:2345            0.0.0.0:*               LISTEN      21449/mysql-proxy   
tcp        0      0 0.0.0.0:3306            0.0.0.0:*               LISTEN      24096/mysqld        
tcp        0      0 0.0.0.0:1234            0.0.0.0:*               LISTEN      21449/mysql-proxy
```

### Atlas安装及卸载
```bash
# 安装
sudo rpm -i Atlas-2.2.1.el6.x86_64.rpm

# 卸载
sudo rpm -e Atlas-2.2.1.el6.x86_64
```

### 系列问题

**问题：atlas安装后，读写分离测试，为什么读一直走主库 **
回答：有事务存在的情况下，会强制走主库。解决方法，添加注解[@Transactional(propagation=Propagation.NOT_SUPPORTED)];
若不涉及事务，检查主从库的用户名密码配置是否一致，是否设置为允许远程登录，并执行[FLUSH PRIVILEGES]。

**问题：读写分离自测成功，java程序连接Atlas后却不能读写分离，所有的请求都发向主库，这是为什么？**
回答：检查一下java框架，是不是默认将autocommit设置为0了，很多java框架将语句都封装在一个事务中，而Atlas会将事务请求都发向主库。

**问题：执行相关命令，成功上下线从库DB后，为什么从库仍然可以同步主库数据**
回答：atlas是中间件，只是提供了访问层的代理，代理和主从没有关系，数据库的主从还需自己配置。而上下线从库DB，只是说读的请求不再发往相应的从库了，事先配置的主从关系并不会改变。还有目前的atlas暂不支持多主模式。

**问题：Atlas碰到解决不了的问题怎么办？**
回答：将相关环境、步骤和运行截图发邮件至zhuchao[AT]360.cn，或者加QQ群326544838。我一问题纠结了几小时，然后发送邮件了，三分钟后就回复我了，震惊了 (¯﹃¯)

更新中。。。

