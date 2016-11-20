---
title: Redis多实例及主从搭建
categories:
  - 运维部署
tags:
  - redis
date: 2016-9-18 22:41:19
toc: false
---

> 前提是服务器上已经安装好了redis,
redis安装可搜索本站另一篇博客：redis安装。

### redis单主机多实例

一、我们首先拷贝两份文件：

```bash
cp /etc/redis.conf /etc/redis6381.conf
cp /etc/redis.conf /etc/redis6382.conf
```

二、修改redis6381配置文件
```bash
# vim /etc/redis6381.conf

# 默认情况下 redis 不是作为守护进程运行的，如果你想让它在后台运行，你就把它改成 yes。
daemonize yes

# 当redis作为守护进程运行的时候，它会把 pid 默认写到 /var/run/redis.pid 文件里面，
# 但是你可以在这里自己制定它的文件位置。
pidfile /var/run/redis/redis_6381.pid

# 监听端口号，默认为 6379，如果你设为 0 ，redis 将不在 socket 上监听任何客户端连接。
port 6381

# 指定日志文件的位置，不同的实例设置不同的日志文件，便于问题定位
logfile /var/log/redis/redis_6381.log

# 设置dump的文件名称，不同的实例设置不同的db文件，便于问题定位
dbfilename dump_6381.rdb
 
# 工作目录
# 例如上面的 dbfilename 只指定了文件名，但是它会写入到这个目录下。
# 这个配置项一定是个目录，而不能是文件名。
# 这个配置项默认值为“./”，最好改相对路径为绝对路径
# 如果为相对路径，redis在哪里启动，dump.rdb文件就会产生在启动的目录，这也就是有些人重启redis后key值消失的原因
dir /data/redisdb/

```

<!-- more -->

相关命令
```bash
#启动6381端口服务
src/redis-server /etc/redis6381.conf

#按端口进入客户端
/usr/bin/redis-cli -p 6381
```

三、同理我们配置6382配置文件, 成功启动服务后，查看进程：

![图片3](http://7xvfir.com1.z0.glb.clouddn.com/redis%E5%A4%9A%E5%AE%9E%E4%BE%8B%E5%8F%8A%E4%B8%BB%E4%BB%8E%E6%90%AD%E5%BB%BA/3.png)


--- 

### redis配置主从

修改6381、6382从库配置：
```bash
vim /etc/redis/redis6381.conf
vim /etc/redis/redis6382.conf
```

![图片4](http://7xvfir.com1.z0.glb.clouddn.com/redis%E5%A4%9A%E5%AE%9E%E4%BE%8B%E5%8F%8A%E4%B8%BB%E4%BB%8E%E6%90%AD%E5%BB%BA/4.png)

重启6379、6381、6382服务，可以看到主从数据实现同步

![图片5](http://7xvfir.com1.z0.glb.clouddn.com/redis%E5%A4%9A%E5%AE%9E%E4%BE%8B%E5%8F%8A%E4%B8%BB%E4%BB%8E%E6%90%AD%E5%BB%BA/5.png)

用客户端登录相关主从服务器，输入info查看主从配置信息
```bash
#主机
127.0.0.1:6379>info

# Replication
role:master
connected_slaves:1
slave0:ip=从机ip,port=6379,state=online,offset=140933,lag=1
master_repl_offset:140933
repl_backlog_active:1
repl_backlog_size:1048576
repl_backlog_first_byte_offset:2
repl_backlog_histlen:140932

#从机
127.0.0.1:6381>info

# Replication
role:slave
master_host:主机ip
master_port:6379
master_link_status:up
master_last_io_seconds_ago:7
master_sync_in_progress:0
slave_repl_offset:141073
slave_priority:100
slave_read_only:1
connected_slaves:0
master_repl_offset:0
repl_backlog_active:0
repl_backlog_size:1048576
repl_backlog_first_byte_offset:0
repl_backlog_histlen:0

```

--- 

### redis添加密码
正式环境redis的使用，密码的配置必不可少。
redis密码缺失的情况下，攻击者很容易通过肉机扫描redis默认端口，免密登录redis进而通过config命令修改服务器配置文件，造成破坏。

修改6379主库配置：
```bash
vim /etc/redis/redis6379.conf

# 修改requirepass项
requirepass master-password
```
修改6381、6382从库配置：
```bash
vim /etc/redis/redis6381.conf
vim /etc/redis/redis6382.conf

# 修改requirepass项
requirepass slave-password

# 修改masterauth项
masterauth <master-password>
```

重启服务，按端口按密码进入客户端测试相关效果即可
```bash
/usr/bin/redis-cli -p 6382 -a password
```
