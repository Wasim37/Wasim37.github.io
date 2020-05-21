---
title: MapReduce详解
categories:
  - 大数据
tags:
  - MapReduce
date: 2017-3-1 21:18:00

---

### MapReduce简介
MapReduce是一种编程模型，用于大规模数据集（大于1TB）的并行运算。概念"Map（映射）"和"Reduce（归约）"，是它们的主要思想。

**MapReduce极大地方便了编程人员在不会分布式并行编程的情况下，将自己的程序运行在分布式系统上。**

---

### WordCount单词计数
单词计数是最简单也是最能体现MapReduce思想的程序之一，可以称为MapReduce版"Hello World"。
词计数主要完成功能是：**统计一系列文本文件中每个单词出现的次数。**

以下是WordCount过程图解，可以先大致浏览下，然后结合下文的Mapper和Reduce任务详解进行理解。

![分片后解析为键值对](http://7xvfir.com1.z0.glb.clouddn.com/MapReduce%E8%AF%A6%E8%A7%A3/4.png)

<!-- more -->

![map](http://7xvfir.com1.z0.glb.clouddn.com/MapReduce%E8%AF%A6%E8%A7%A3/5.png)
![分区排序合并](http://7xvfir.com1.z0.glb.clouddn.com/MapReduce%E8%AF%A6%E8%A7%A3/6.png)
![reduce](http://7xvfir.com1.z0.glb.clouddn.com/MapReduce%E8%AF%A6%E8%A7%A3/7.png)

---

### 分析MapReduce执行过程

MapReduce运行的时候，会通过Mapper运行的任务读取HDFS中的数据文件，然后调用自己的方法，处理数据，最后输出。Reducer任务会接收Mapper任务输出的数据，作为自己的输入数据，调用自己的方法，最后输出到HDFS的文件中。整个流程如图：

![](http://7xvfir.com1.z0.glb.clouddn.com/MapReduce%E8%AF%A6%E8%A7%A3/1.png)

---

### Mapper任务详解

**每个Mapper任务是一个java进程**，它会读取HDFS中的文件，解析成很多的键值对，经过我们覆盖的map方法处理后，转换为很多的键值对再输出。整个Mapper任务的处理过程又可以分为以下几个阶段，如图所示。

![](http://7xvfir.com1.z0.glb.clouddn.com/MapReduce%E8%AF%A6%E8%A7%A3/2.png)

在上图中，把Mapper任务的运行过程分为六个阶段。

- 第一阶段是把输入文件按照一定的标准进行分片(InputSplit)，每个输入片的大小是固定的。默认情况下，输入片(InputSplit)的大小与数据块(Block)的大小是相同的。如果数据块(Block)的大小是默认值64MB，输入文件有两个，一个是32MB，一个是72MB。那么小的文件是一个输入片，大文件会分为两个数据块，那么是两个输入片。一共产生三个输入片。**每一个输入片由一个Mapper进程处理**。这里的三个输入片，会有三个Mapper进程处理。

- 第二阶段是对输入片中的记录按照一定的规则解析成键值对。有个默认规则是把每一行文本内容解析成键值对。“键”是每一行的起始位置(单位是字节)，“值”是本行的文本内容。

- 第三阶段是调用Mapper类中的map方法。第二阶段中解析出来的每一个键值对，调用一次map方法。如果有1000个键值对，就会调用1000次map方法。每一次调用map方法会输出零个或者多个键值对。

- 第四阶段是按照一定的规则对第三阶段输出的键值对进行分区。比较是基于键进行的。比如我们的键表示省份(如北京、上海、山东等)，那么就可以按照不同省份进行分区，同一个省份的键值对划分到一个区中。**默认是只有一个区。分区的数量就是Reducer任务运行的数量。默认只有一个Reducer任务。**

- 第五阶段是对每个分区中的键值对进行排序。首先，按照键进行排序，对于键相同的键值对，按照值进行排序。比如三个键值对<2,2>、<1,3>、<2,1>，键和值分别是整数。那么排序后的结果是<1,3>、<2,1>、<2,2>。如果有第六阶段，那么进入第六阶段；如果没有，直接输出到本地的linux文件中。

- 第六阶段是对数据进行归约处理，也就是reduce处理。**键相等的键值对会调用一次reduce方法。**经过这一阶段，数据量会减少。归约后的数据输出到本地的linxu文件中。**本阶段默认是没有的，需要用户自己增加这一阶段的代码。**

---

### Reducer任务详解

每个Reducer任务是一个java进程。Reducer任务接收Mapper任务的输出，归约处理后写入到HDFS中，可以分为如下图所示的几个阶段。

![](http://7xvfir.com1.z0.glb.clouddn.com/MapReduce%E8%AF%A6%E8%A7%A3/3.png)

- 第一阶段是Reducer任务会主动从Mapper任务复制其输出的键值对。Mapper任务可能会有很多，因此Reducer会复制多个Mapper的输出。

- 第二阶段是把复制到Reducer本地数据，全部进行合并，即把分散的数据合并成一个大的数据。再对合并后的数据排序。

- 第三阶段是对排序后的键值对调用reduce方法。**键相等的键值对调用一次reduce方法**，每次调用会产生零个或者多个键值对。最后把这些输出的键值对写入到HDFS文件中。

---

### Shuffle--MapReduce心脏

**Shuffle过程是MapReduce的核心，也被称为奇迹发生的地方。**

![](http://7xvfir.com1.z0.glb.clouddn.com/MapReduce%E8%AF%A6%E8%A7%A3/8.jpg)


上面这张图是官方对Shuffle过程的描述，可以肯定的是，单从这张图基本不可能明白Shuffle的过程，因为它与事实相差挺多，细节也是错乱的。**Shuffle可以大致理解成怎样把map task的输出结果有效地传送到reduce端。也可以这样理解， Shuffle描述着数据从map task输出到reduce task输入的这段过程。**

在Hadoop这样的集群环境中，大部分map task与reduce task的执行是在不同的节点上。很多时候Reduce执行时需要跨节点去拉取其它节点上的map task结果**【注意：Map输出总是写到本地磁盘，但是Reduce输出不是，一般是写到HDFS】**。

如果集群正在运行的job有很多，那么task的正常执行对集群内部的网络资源消耗会很严重。这种网络消耗是正常的，我们不能限制，能做的 就是最大化地减少不必要的消耗。还有在节点内，相比于内存，磁盘IO对job完成时间的影响也是可观的。从最基本的要求来说，我们对Shuffle过程的 期望可以有：

- 完整地从map task端拉取数据到reduce 端。
- 在跨节点拉取数据时，尽可能地减少对带宽的不必要消耗。
- 减少磁盘IO对task执行的影响。

比如为了减少磁盘IO的消耗，我们可以调节io.sort.mb的属性。每个Map任务都有一个用来写入输出数据的循环内存缓冲区，这个缓冲区默认大小是100M，可以通过io.sort.mb设置，当缓冲区中的数据量达到一个特定的阀值(io.sort.mb * io.sort.spill.percent，其中io.sort.spill.percent 默认是0.80)时，系统将会启动一个后台线程把缓冲区中的内容spill 到磁盘。在spill过程中，Map的输出将会继续写入到缓冲区，但如果缓冲区已经满了，Map就会被阻塞直道spill完成。

spill线程在把缓冲区的数据写到磁盘前，会对他进行一个二次排序，首先根据数据所属的partition排序，然后每个partition中再按Key排序。输出包括一个索引文件和数据文件，如果设定了Combiner，将在排序输出的基础上进行。Combiner就是一个Mini Reducer，它在执行Map任务的节点本身运行，先对Map的输出作一次简单的Reduce，使得Map的输出更紧凑，更少的数据会被写入磁盘和传送到Reducer。**Spill文件保存在由mapred.local.dir指定的目录中，Map任务结束后删除。**

Shuffle其他细节这里不再详述，下面这些文章可能对大家有所帮助：
http://my.oschina.net/u/2003855/blog/310301
http://blog.csdn.net/thomas0yang/article/details/8562910
