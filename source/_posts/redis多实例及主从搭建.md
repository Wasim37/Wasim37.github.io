---
title: redis多实例及主从搭建
categories:
  - Linux
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

启动6381端口服务
```bash
src/redis-server /etc/redis6381.conf
```

三、同理我们配置6382端口：
```bash
vim /etc/redis6382.conf
```

![图片2](2.png)

启动6382端口服务
```bash
src/redis-server /etc/redis6382.conf
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

重启6379、6381、6382服务

![图片5](5.png)

可以看到主从数据实现同步