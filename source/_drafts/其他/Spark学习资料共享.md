---
title: Spark学习资料共享
categories:
  - 资源共享
tags:
  - 大数据教程
date: 2017-4-9 21:18:00
toc: true

---

### 链接相关
课件代码：http://pan.baidu.com/s/1nvbkRSt
教学视频：http://pan.baidu.com/s/1c12XsIG
这是最近买的付费教程，对资料感兴趣的可以在下方留下邮件地址，我会定期进行密码发送。

---

### 课程简介
以目前主流的，最新的spark稳定版2.1.x为基础，深入浅出地介绍Spark生态系统原理及应用，内容包括Spark各组件(Spark Core/SQL/Streaming/MLlib)基本原理，使用方法，实战经验以及在线演示。本课程精心设计了五个企业级应用案例，帮助大家在理解理论的基础上，亲手实践和应用spark。

---

### 课程优化
1. 讲述最新、最稳定的Spark2.1.X版本
2. 精心设计5个企业级应用案例，更好地实践、应用Spark

<!-- more -->

---

### 面向人群
1.  大数据爱好者
2.  Spark初中级学者
3.  对Spark感兴趣、想系统性学习者

---

### 学习收益
1.  熟练使用Spark， 理解Spark原理，熟知Spark内幕
2.  掌握Spark 2.1新增特性并熟练使用
3.  用有丰富的Spark企业实战经验

---

### 课程大纲
第一部分: Spark 概述
* 第一课：Spark 2.1概述
 	* 1.  Spark产生背景
           包括mapreduce缺陷，多计算框架并存等
	* 2.  Spark 基本特点
	* 3.  Spark版本演化
	* 4.  Spark核心概念
           包括RDD, transformation, action, cache等
	* 5.  Spark生态系统
	包括Spark生态系统构成，以及与Hadoop生态系统关系
	* 6.  Spark在互联网公司中的地位与应用
           介绍当前互联网公司的Spark应用案例
	* 7.  Spark集群搭建
           包括测试集群搭建和生产环境中集群搭建方法，并亲手演示整个过程
	* 8.  背景知识补充介绍
		* a.  Hadoop基础
		* b.  HDFS简介（特点、架构与应用）
		* c.  YARN简介（架构）
		* d.  MapReduce简介（编程模型与应用）
			* I.  Eclipse与Intellij IDEA
			* II. Maven
 
第二部分: Spark Core
 
* 第二课：Spark  程序设计与企业级应用案例
	* 1.  Spark运行模式介绍
           Spark运行组件构成，spark运行模式（local、standalone、mesos/yarn等）
	* 2.  Spark开发环境构建
           集成开发环境选择，亲手演示spark程序开发与调试，spark运行
	* 3.  常见transformation与action用法
           介绍常见transformation与action使用方法，以及代码片段剖析
	* 4.  常见控制函数介绍
           包括cache、broadcast、accumulator等
	* 5.  Spark 应用案例：电影受众分析系统
           包括：背景介绍，数据导入，数据分析，常见Spark transformation和action用法在线演示
 
* 第三课：Spark  内部原理剖析与源码阅读
	* 1.  Spark运行模式剖析
           深入分析spark运行模式，包括local，standalone以及spark on yarn
	* 2.  Spark运行流程剖析
           包括spark逻辑查询计划，物理查询计划以及分布式执行
	* 3.  Spark shuffle剖析
           深入介绍spark shuffle的实现，主要介绍hash-based和sort-based两种实现
	* 4.  Spark 源码阅读
           Spark源码构成以及阅读方法
 
* 第四课：Spark  程序调优技巧
 	* 1.  数据存储格式调优
           数据存储格式选择，数据压缩算法选择等
	* 2.  资源调优
           如何设置合理的executor、cpu和内存数目，YARN多租户调度器合理设置，启用YARN的标签调度策略等
	* 3.  程序参数调优
           介绍常见的调优参数，包括避免不必要的文件分发，调整任务并发度，提高数据本地性，JVM参数调优，序列化等
	* 4.  程序实现调优
           如何选择最合适的transformation与action函数
	* 5.  调优案例分享与演示
           演示一个调优案例，如何将一个spark程序的性能逐步优化20倍以上。
 
第三部分   Spark SQL 2.1
 
* 第五课：Spark  SQL基本原理
	* 1.  Spark SQL是什么
	* 2.  Spark SQL基本原理
	* 3.  Spark  Dataframe与DataSet
	* 4.  Spark SQL与Spark Core的关系
 
* 第六课：Spark  SQL程序设计与企业级应用案例
	* 1.  Spark SQL程序设计
		* a.  如何访问MySQL、HDFS等数据源，如何处理parquet格式数据
		* b.  常用的DSL语法有哪些，如何使用
		* c.  Spark SQL调优技巧
	* 2.  Spark SQL应用案例：篮球运动员评估系统
	 	* a.  背景介绍
		* b.  数据导入
		* c.  数据分析
		* d.  结论
 
第四部分   Spark Streaming
 
* 第七课：Spark  Streaming、程序设计及应用案例
	* 1.Spark  Streaming基本原理
		* a.  Spark Streaming是什么
		* b.  Spark Streaming基本原理
		* c.  Structured Streaming
		* d.  Spark  Streaming 编程接口介绍
		* e.  Spark Streaming应用案例
	* 2.  Spark  Streaming程序设计与企业级应用案例
		* a.  常见流式数据处理模式
		* b.  Spark Streaming与Kafka 交互
		* c.  Spark Streaming与Redis交互
		* d.  Spark Streaming部署与运行
		* e.  Spark Streaming企业级案例：用户行为实时分析系统
 
第五部分   Spark MLlib
 
* 第八课： Spark MLlib及企业级案例
	* 1.  Spark MLlib简介
	* 2.  数据表示方式
	* 3.  MLlib中的聚类、分类和推荐算法
	* 4.  如何使用MLlib的算法
	* 5.  Spark MLLib企业级案例：信用卡欺诈检测系统
 
第六部分Spark综合案例
 
* 第九课：简易电影推荐系统
	* 1.  背景介绍
	* 2.  什么是Lambda architecture
	* 3.  利用HDFS+Spark Core+MLlib+Redis构建批处理线
	* 4.  利用Kafka+Spark Streaming+Redis构建实时处理线
	* 5.  整合批处理和实时处理线
	* 6.  扩展介绍：Apache beam：统一编程模型及应用

---

### 图片相关
![](http://7xvfir.com1.z0.glb.clouddn.com/Spark%E5%AD%A6%E4%B9%A0%E8%B5%84%E6%96%99%E5%85%B1%E4%BA%AB/1.png)