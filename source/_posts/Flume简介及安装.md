---
title: Flume简介及安装
categories:
  - 大数据
tags:
  - Flume
date: 2017-2-27 21:18:00
toc: true

---

Hadoop业务的大致开发流程以及Flume在业务中的地位：

![](http://7xvfir.com1.z0.glb.clouddn.com/Flume%E7%AE%80%E4%BB%8B%E5%8F%8A%E5%AE%89%E8%A3%85/1.jpg) 
从Hadoop的业务开发流程图中可以看出，在大数据的业务处理过程中，对于数据的采集是十分重要的一步，也是不可避免的一步，从而引出我们本文的主角—Flume。

---

### Flume概念 

![](http://7xvfir.com1.z0.glb.clouddn.com/Flume%E7%AE%80%E4%BB%8B%E5%8F%8A%E5%AE%89%E8%A3%85/2.jpg) 
flume是分布式的日志收集系统，它将各个服务器中的数据收集起来并送到指定的地方去，比如说送到图中的HDFS，简单来说flume就是收集日志的。 

<!-- more -->

---

### Event概念 
在这里有必要先介绍一下flume中event的相关概念：flume的核心是把数据从数据源(source)收集过来，在将收集到的数据送到指定的目的地(sink)。为了保证输送的过程一定成功，在送到目的地(sink)之前，会先缓存数据(channel),待数据真正到达目的地(sink)后，flume在删除自己缓存的数据。 

在整个数据的传输的过程中，流动的是event，即事务保证是在event级别进行的。那么什么是event呢？—–event将传输的数据进行封装，是flume传输数据的基本单位，如果是文本文件，通常是一行记录，event也是事务的基本单位。event从source，流向channel，再到sink，本身为一个字节数组，并可携带headers(头信息)信息。event代表着一个数据的最小完整单元，从外部数据源来，向外部的目的地去。

为了方便大家理解，给出一张event的数据流向图： 

![](http://7xvfir.com1.z0.glb.clouddn.com/Flume%E7%AE%80%E4%BB%8B%E5%8F%8A%E5%AE%89%E8%A3%85/3.jpg)

一个完整的event包括：event headers、event body、event信息(即文本文件中的单行记录)，其中event信息就是flume收集到的日记记录。 

---

### Flume架构 
flume之所以这么神奇，是源于它自身的一个设计，这个设计就是agent，agent本身是一个Java进程，运行在日志收集节点—所谓日志收集节点就是服务器节点。 

agent里面包含3个核心的组件：source—->channel—–>sink,类似生产者、仓库、消费者的架构。

- source：source组件是专门用来收集数据的，可以处理各种类型、各种格式的日志数据,包括avro、thrift、exec、jms、spooling directory、netcat、sequence generator、syslog、http、legacy、自定义。 
- channel：source组件把数据收集来以后，临时存放在channel中，即channel组件在agent中是专门用来存放临时数据的——对采集到的数据进行简单的缓存，可以存放在memory、jdbc、file等等。 
- sink：sink组件是用于把数据发送到目的地的组件，目的地包括hdfs、logger、avro、thrift、ipc、file、null、Hbase、solr、自定义。 

---

### Flume运行机制
flume的核心就是一个agent，这个agent对外有两个进行交互的地方，一个是接受数据的输入——source，一个是数据的输出sink，sink负责将数据发送到外部指定的目的地。source接收到数据之后，将数据发送给channel，chanel作为一个数据缓冲区会临时存放这些数据，随后sink会将channel中的数据发送到指定的地方—-例如HDFS等，注意：只有在sink将channel中的数据成功发送出去之后，channel才会将临时数据进行删除，这种机制保证了数据传输的可靠性与安全性。 

---

### Flume广义用法 
flume之所以这么神奇—-其原因也在于flume可以支持多级flume的agent，即flume可以前后相继，例如sink可以将数据写到下一个agent的source中，这样的话就可以连成串了，可以整体处理了。flume还支持扇入(fan-in)、扇出(fan-out)。所谓扇入就是source可以接受多个输入，所谓扇出就是sink可以将数据输出多个目的地destination中。 

![](http://7xvfir.com1.z0.glb.clouddn.com/Flume%E7%AE%80%E4%BB%8B%E5%8F%8A%E5%AE%89%E8%A3%85/4.jpg)

---

### 安装配置
1、安装
下载地址：http://mirrors.hust.edu.cn/apache/flume/1.7.0/

2、解压缩
```bash
tar -zxvf apache-flume-1.7.0-bin.tar.gz -C /data
mv apache-flume-1.7.0-bin flume
```

3、配置环境变量
```bash
vim /etc/profile

export FLUME_HOME=/data/flume
export PATH=$PATH:$FLUME_HOME/bin

source /etc/profile
```

4、验证是否安装成功
```bash
[root@iZwz9b62gfdv0s2e67yo8kZ /]# flume-ng version
Flume 1.7.0
Source code repository: https://git-wip-us.apache.org/repos/asf/flume.git
Revision: 511d868555dd4d16e6ce4fedc72c2d1454546707
Compiled by bessbd on Wed Oct 12 20:51:10 CEST 2016
From source with checksum 0d21b3ffdc55a07e1d08875872c00523
```

---

### 链接相关
大数据进阶计划
http://wangxin123.com/2017/02/18/%E5%A4%A7%E6%95%B0%E6%8D%AE%E8%BF%9B%E9%98%B6%E8%AE%A1%E5%88%92/

Flume下载地址
http://mirrors.hust.edu.cn/apache/flume/1.7.0/
