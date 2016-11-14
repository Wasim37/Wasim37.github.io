---
title: Zookeeper简介
categories:
  - 其他技术
tags:
  - 大数据
date: 2016-5-19 21:18:00
toc: false
---

### 什么是Zookeeper？
ZooKeeper是一个分布式的，开放源码的分布式应用程序协调服务，它包含一个简单的原语集，分布式应用程序可以基于它实现同步服务，配置维护和命名服务等。Zookeeper是hadoop的一个子项目，其发展历程无需赘述。在分布式应用中，由于工程师不能很好地使用锁机制，以及基于消息的协调机制不适合在某些应用中使用，因此需要有一种可靠的、可扩展的、分布式的、可配置的协调机制来统一系统的状态。Zookeeper的目的就在于此。本文简单分析zookeeper的工作原理，对于如何使用zookeeper不是本文讨论的重点。

### Zookeeper角色
![](1.png)

<!-- more -->

系统模型如图所示：
![](2.png)

### 设计目的
- 最终一致性：client不论连接到哪个Server，展示给它都是同一个视图，这是zookeeper最重要的性能。
- 可靠性：具有简单、健壮、良好的性能，如果消息m被到一台服务器接受，那么它将被所有的服务器接受。
- 实时性：Zookeeper保证客户端将在一个时间间隔范围内获得服务器的更新信息，或者服务器失效的信息。但由于网络延时等原因，Zookeeper不能保证两个客户端能同时得到刚更新的数据，如果需要最新数据，应该在读数据之前调用sync()接口。
- 等待无关（wait-free）：慢的或者失效的client不得干预快速的client的请求，使得每个client都能有效的等待。
- 原子性：更新只能成功或者失败，没有中间状态。
- 顺序性：包括全局有序和偏序两种：全局有序是指如果在一台服务器上消息a在消息b前发布，则在所有Server上消息a都将在消息b前被发布；偏序是指如果一个消息b在消息a后被同一个发送者发布，a必将排在b前面。

### 单机安装和配置
1、解压：tar xzf zookeeper-3.4.5.tar.gz
2、在conf目录下创建一个配置文件zoo.cfg，dataDir=/usr/local/zk/data
3、启动ZooKeeper的Server：sh bin/zkServer.sh start, 如果想要关闭，输入：zkServer.sh stop

### 集群安装和配置
1、创建myid文件，server1机器的内容为：1，server2机器的内容为：2，server3机器的内容为：3
2、在conf目录下创建一个配置文件zoo.cfg，
dataDir=/usr/local/zk/data
server.1=server1:2888:3888
server.2=server2:2888:3888
server.3=server3:2888:3888

### Zookeeper的数据模型
- 层次化的目录结构，命名符合常规文件系统规范
- 每个节点在zookeeper中叫做znode,并且其有一个唯一的路径标识
- 节点Znode可以包含数据和子节点，但是EPHEMERAL类型的节点不能有子节点
- Znode中的数据可以有多个版本，比如某一个路径下存有多个数据版本，那么查询这个路径下的数据就需要带上版本
- 客户端应用可以在节点上设置监视器
- 节点不支持部分读写，而是一次性完整读写

