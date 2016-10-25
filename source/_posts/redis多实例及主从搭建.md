---
title: redis多实例及主从搭建
categories:
  - 部署配置
tags:
  - redis
date: 2016-9-18 22:41:19
---

> 假设我们服务器上面已经安装好了redis,
可在搜索栏搜索本站另一篇博客：centos6安装redis-2.8.19.tar.gz

### redis单主机多实例

一、我们首先拷贝两份文件：

```bash
cp /etc/redis.conf /etc/redis6381.conf
cp /etc/redis.conf /etc/redis6382.conf
```

二、配置6381端口
```bash
vim /etc/redis6381.conf
```
![图片1](1.png)

<!-- more -->

相关命令
```bash
#启动6381端口服务
src/redis-server /etc/redis6381.conf

#按端口进入客户端
/usr/bin/redis-cli -p 6381
```

三、同理我们配置6382端口：
```bash
vim /etc/redis6382.conf
```

![图片2](2.png)

相关命令
```bash
#启动6382端口服务
src/redis-server /etc/redis6382.conf

#按端口进入客户端
/usr/bin/redis-cli -p 6382
```

查看进程：

![图片3](3.png)


--- 

### redis配置主从

修改6381、6382从库配置：
```bash
vim /etc/redis/redis6381.conf
vim /etc/redis/redis6382.conf
```

![图片4](4.png)

重启6379、6381、6382服务，可以看到主从数据实现同步

![图片5](5.png)

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

# 修改masterauth项
masterauth <master-password>
```

重启服务，按端口按密码进入客户端测试相关效果即可
```bash
/usr/bin/redis-cli -p 6382 -a password
```