---
title: redis安装
categories:
  - 部署配置
tags:
  - redis
date: 2016-6-18 22:41:19
---

检查安装依赖程序
```bash
yum install gcc-c++
yum install -y tcl
yum install wget
```

获取安装文件
```bash
wget http://download.redis.io/releases/redis-2.8.24.tar.gz
```

解压文件
```bash
tar -xzvf redis-2.8.24.tar.gz
mv redis-2.8.24 /usr/local/redis
```

<!-- more -->

进入目录
```bash
cd /usr/local/redis
```

编译安装
```bash
make
make install
```

设置配置文件路径
```bash
mkdir -p /etc/redis
cp redis.conf /etc/redis
mv redis.conf redis-6379.conf
```

修改配置文件
```bash
vim /etc/redis/redis.conf
```
仅修改： daemonize yes （no-->yes）

启动
```bash
/usr/local/bin/redis-server /etc/redis/redis.conf
```

查看启动
```bash
ps -ef | grep redis 
```

使用客户端
```bash
redis-cli
>set name david
OK
>get name
"david"
```

关闭客户端
```bash
redis-cli shutdown
```

开机启动配置
```bash
echo "/usr/local/bin/redis-server /etc/redis/redis.conf &" >> /etc/rc.local
```

查看redis版本
```bash
redis-server --version
```