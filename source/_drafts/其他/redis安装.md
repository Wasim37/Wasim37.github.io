---
title: Redis安装
categories:
  - 运维部署
tags:
  - redis
date: 2016-9-16 22:41:19
toc: true
---

### redis简介
redis是一个性能非常优秀的内存数据库，通过key-value存储系统。和Memcached类似，它支持存储的value类型相对更多，包括string(字符串)、list(链表)、set(集合)、zset(sorted set --有序集合)和hashs（哈希类型）。这些数据类型都支持push/pop、add/remove及取交集并集和差集及更丰富的操作，而且这些操作都是原子性的。在此基础上，redis支持各种不同方式的排序。与memcached一样，为了保证效率，数据都是缓存在内存中。区别的是redis会周期性的把更新的数据写入磁盘或者把修改操作写入追加的记录文件，并且在此基础上实现了master-slave(主从)同步。

Redis 是一个高性能的key-value数据库。 redis的出现，很大程度补偿了memcached这类key/value存储的不足，在部 分场合可以对关系数据库起到很好的补充作用。它提供了Python，Ruby，Erlang，PHP客户端，使用很方便。redis的安装配置，比较简单，详见官方网站。

---

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
root      8033     1  0 19:36 ?        00:00:00 /usr/local/bin/redis-server *:6379               
root      8084  4991  0 19:46 pts/0    00:00:00 grep redis
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

</br>

---

### 安全配置
#### 设置密码
redis的默认安装是不设置密码的，可以在redis.conf中进行配置
```bash
# vim /etc/redis/redis.conf
requirepass CWWmCeM79Sgz2imp
```
或者通过命令设置
```bash
CONFIG set requirepass "CWWmCeM79Sgz2imp" 
```
由于Redis的性能极高，并且输入错误密码后Redis并不会进行主动延迟（考虑到Redis的单线程模型），所以攻击者可以通过穷举法破解Redis的密码（1秒内能够尝试十几万个密码），<font style="color:red;">因此在设置时一定要选择复杂的密码，</font>可以用随机密码生成器生成。

<font style="color:red;">注意：配置Redis复制的时候如果主数据库设置了密码，需要在从数据库的配置文件中通过masterauth参数设置主数据库的密码，以使从数据库连接主数据库时自动使用AUTH命令认证。详见本站的另一篇文章《Redis多实例及主从搭建》。</font>

#### 禁止高危命令
```bash
# vim /etc/redis/redis.conf
rename-command FLUSHALL ""
rename-command FLUSHDB  ""
rename-command CONFIG   ""
rename-command EVAL     ""

# 保存，重启redis，进入客户端，输入flushall等命令，出现如下提示
# (error) ERR unknown command 'flushall'
```
<font style="color:red;">曾经我的测试服务器发生过一次这样的事故，由于安装的redis没有设置密码，被人通过扫描ip加默认的6379端口，进入了redis，然后通过config命令修改了我的免密码登录文件，导致所有人无法登录服务器。所以为了安全，你还可以修改你的默认redis端口。事故详情见本站另一篇文章《彻底清除Linux centos minerd木马》</font>

#### 绑定只能本机连接
Redis的默认配置会接受来自任何地址发送来的请求。
即在任何一个拥有公网IP的服务器上启动Redis服务器，都可以被外界直接访问到。
<font style="color:red;">如果只允许本机应用连接Redis，</font>可在配置文件中修改bind参数。

```bash
# vim /etc/redis/redis.conf
bind 127.0.0.1
```

#### 使用linux nobody启动redis
在root账户下使用nobody用户启动程序xxx的方法：
```bash
su -m nobody -c xxx
```
nobody账户默认是无法登陆的，直接使用su -nobody会出现
```bash
This account is currently not available. 
```
需要修改配置文件etc/passwd实现登陆
```bash
vim /etc/passwd  

# 找到 nobody:x:99:99:Nobody:/:/sbin/nologin，改成如下
nobody:x:99:99:Nobody:/:/bin/bash  

# 保存执行
su -nobody  
```

---

### 开机自启动
```bash
echo "/usr/local/bin/redis-server /etc/redis/redis.conf &" >> /etc/rc.local
```

---

### 自动化部署脚本
https://github.com/Wasim37/deployment-scripts/tree/master/redis

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

---