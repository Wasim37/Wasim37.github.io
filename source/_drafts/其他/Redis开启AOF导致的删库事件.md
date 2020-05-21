---
title: Redis开启AOF导致的删库事件
categories:
  - 错误集锦
tags:
  - redis
  - aof
date: 2017-5-27 21:18:00
toc: true

---

#### 事件背景
<font style="color:red">Redis主从开启AOF，错误操作导致数据被清空。
Redis主要作用：缓存、队列。</font>

---

#### 事故过程
Redis搭建了主从，持久化方式为RDB，RDB没有定时备份，且AOF都没有开启。
考虑到开启AOF会使Redis安全性更高，所以尝试先在从机做测试，没问题后再上主机。

Redis开启AOF的方式非常简单，打开Redis的conf文件，找到【appendonly】配置项，将【no】改为【yes】重启服务即可。

Redis从机重启后，成功在数据目录生成了百M以上的【appendonly.aof】文件，以该aof文件单独启动Redis实例，生成的数据和单独以RDB文件启动生成的数据一样，因此判断从机AOF配置成功。

接着直接上了主机，Redis主机以同样的方式配置AOF后，结果实例重启的瞬间，Redis主从数据被清空，主从AOF及RDB文件大小接近0M。

---

<!-- more -->

#### 问题分析
<font style="color:red">1、为什么在已经开启RDB持久化的情况下，还打算开启AOF？</font>
解答：同时开启两种持久化，Redis拥有足以媲美PostgreSQL的数据安全性。

```java
RDB 持久化可以在指定的时间间隔内生成数据集的时间点快照，常用做备份。
AOF 持久化记录服务器执行的所有写操作命令，并在服务器启动时，通过重新执行这些命令来还原数据集。

RDB默认的快照保存配置：
save 900 1     #900秒内如果超过1个key被修改，则发起快照保存
save 300 10    #300秒内容如超过10个key被修改，则发起快照保存
save 60 10000  #60秒内容如超过10000个key被修改，则发起快照保存

而AOF默认策略则为每秒钟一次fsync
当然你也可以设置不同的fsync策略，比如无fsync
或者每秒钟一次fsync，或者每次执行写入命令时fsync

AOF文件有序地保存了对数据库执行的所有写入操作，
这些写入操作以Redis协议的格式保存。
因此AOF文件的内容非常容易被人读懂，对文件进行分析也很轻松。 
导出AOF文件也非常简单：举个例子，如果你不小心执行了 FLUSHALL 命令，
但只要AOF文件未被重写，那么只要停止服务器，
移除AOF文件末尾的FLUSHALL命令，并重启Redis，
就可以将数据集恢复到FLUSHALL执行之前的状态。

有效地利用以上的RDB和AOF特性，能使Redis拥有足以媲美PostgreSQL的数据安全性。
```

<font style="color:red">2、为什么在从机AOF配置成功的情况下，主机开启AOF，主从数据瞬间被清空？</font>
解答：首先得明白Redis有这么一个特性，即<font style="color:red">两种持久化同时开启的情况下，Redis启动默认加载AOF文件恢复数据。</font>

Redis从机由于事先没有开启AOF，配置重启后，从机会生成一个空的AOF文件并默认加载，这时从机数据是空的，但由于配置了主从，从机会同步主机数据，所以你会发现新生成的AOF文件大小在迅速增长。因此Redis从机开启AOF后，数据最终是没有问题的。

这时候Redis主机也配置AOF并重启，主机生成AOF并默认加载，数据瞬间被清空，同时主机RDB发现60秒内有超过10000个key被修改，发起了快照保存，RDB数据也被清空。由于都是内存操作，所以非常快。最后再主从同步，所有数据被删。

<font style="color:red">3、两种持久化同时开启的情况下，Redis启动为什么默认选择加载AOF而不是RDB文件来恢复数据？</font>
解答：AOF默认策略为每秒钟一次fsync，所以通常情况下，AOF文件所保存的数据相对RDB更完整。

<font style="color:red">4、AOF 持久化会记录服务器执行的所有写操作命令，那么数据被清空后，为什么不能通过AOF文件的日志记录恢复数据？</font>
解答：Redis会自动地在后台对AOF进行重写，重写后的新AOF文件包含了恢复当前数据集所需的最小命令集合

```java
为什么会重写？

因为AOF记录了服务器执行的所有写操作命令，而RDB本身又是一个非常紧凑的文件
所以对于相同的数据集来说，AOF文件的体积通常要大于RDB文件的体积
而体积大了终究不好，比如Redis重启默认加载AOF文件就要更多的时间
```

<font style="color:red">5、面试官如果问你，如何在不用【config set】命令的情况下，将Redis持久化由RDB切换到AOF，你怎么回答？</font>
解答：呵呵，利用主从。。。从机配置AOF重启后，将生成的AOF文件复制至主机Redis数据目录，主机配置AOF后再重启。

```bash
注：在 Redis 2.2 或以上版本，通过【config set】可以在不重启的情况下，从 RDB 切换到 AOF。
1）为最新的 dump.rdb 文件创建一个备份。
2）将备份放到一个安全的地方。
3）执行以下两条命令：
redis-cli> CONFIG SET appendonly yes
redis-cli> CONFIG SET save ""

4）确保命令执行之后，数据库的键的数量没有改变。
5）确保写命令会被正确地追加到 AOF 文件的末尾。

步骤 3 执行的第一条命令开启了AOF功能：<font style="color:red">Redis会阻塞直到初始AOF文件创建完成为止</font>，之后Redis会继续处理命令请求， 并开始将写入命令追加到 AOF 文件末尾。
步骤 3 执行的第二条命令用于关闭RDB功能。这一步是可选的，如果你愿意的话，也可以同时使用RDB和AOF这两种持久化功能。

不过别忘了在redis.conf中打开AOF功能！否则的话，服务器重启之后，之前通过【CONFIG SET】设置的配置就会被遗忘，程序会按原来的配置来启动服务器。
```