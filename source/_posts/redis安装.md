---
title: redis安装
categories:
  - 运维部署
tags:
  - redis
date: 2016-9-16 22:41:19
toc: false
---

### redis简介
redis是一个性能非常优秀的内存数据库，通过key-value存储系统。和Memcached类似，它支持存储的value类型相对更多，包括string(字符串)、list(链表)、set(集合)、zset(sorted set --有序集合)和hashs（哈希类型）。这些数据类型都支持push/pop、add/remove及取交集并集和差集及更丰富的操作，而且这些操作都是原子性的。在此基础上，redis支持各种不同方式的排序。与memcached一样，为了保证效率，数据都是缓存在内存中。区别的是redis会周期性的把更新的数据写入磁盘或者把修改操作写入追加的记录文件，并且在此基础上实现了master-slave(主从)同步。

Redis 是一个高性能的key-value数据库。 redis的出现，很大程度补偿了memcached这类key/value存储的不足，在部 分场合可以对关系数据库起到很好的补充作用。它提供了Python，Ruby，Erlang，PHP客户端，使用很方便。redis的安装配置，比较简单，详见官方网站。

### 安装

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
mv redis-2.8.24 redis
cd redis
```

<!-- more -->

安装及版本查看
```bash
#编译安装
make
make install

#版本查看
redis-server --version
```

设置配置文件路径
```bash
mkdir -p /etc/redis
cp redis.conf /etc/redis
```

修改配置文件
```bash
vim /etc/redis/redis.conf

#仅修改daemonize，no设置为yes，按守护进程启动
#密码设置、多实例、主从搭建可以查看本站另一篇文章
daemonize yes
```

启动
```bash
/usr/local/bin/redis-server /etc/redis/redis.conf
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

PS：如果要卸载redis，把/usr/local/bin/目录下的redis删除即可。
为了卸载干净，你还可以把解压和编译的redis包及配置的redis.conf也删除。

---

### 开机自启动
```bash
echo "/usr/local/bin/redis-server /etc/redis/redis.conf &" >> /etc/rc.local
```
---

### 相关链接
redis中文官网：
http://doc.redisfans.com/

reids设计与实现
http://redisbook.readthedocs.org/en/latest/index.html

redis使用场景
http://www.360doc.com/content/15/0510/20/23016082_469494498.shtml

redis conf配置详解
http://www.cnblogs.com/kreo/p/4423362.html