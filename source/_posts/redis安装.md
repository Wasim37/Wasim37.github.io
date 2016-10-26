---
title: redis安装
categories:
  - 部署配置
tags:
  - redis
date: 2016-6-18 22:41:19
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