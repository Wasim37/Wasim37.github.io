---
title: Druid
categories:
  - JAVA
tags:
  - Druid
date: 2016-4-24 22:10:00
toc: false

---

**Druid是阿里巴巴的开源项目，它在监控、可扩展性、稳定性和性能方面，相对于其他数据库连接池都有较明显的优势**

### 网站
官网介绍：[https://github.com/alibaba/druid/wiki/常见问题](https://github.com/alibaba/druid/wiki/常见问题)
阿里巴巴开源项目Druid负责人温少访谈：[http://www.iteye.com/magazines/90](http://www.iteye.com/magazines/90)  
配置方法如下：[http://blog.csdn.net/pk490525/article/details/12621649](http://blog.csdn.net/pk490525/article/details/12621649)  


### 问题
**实践遇到的问题**：官网下载 druid-1.0.17.jar，引入并配置好相关文件后，启动报了一个警告

![图片1](http://7xvfir.com1.z0.glb.clouddn.com/Druid/1.png)

**查看源码如下**：
![图片2](http://7xvfir.com1.z0.glb.clouddn.com/Druid/2.png)

**原因**：应该是mysql驱动太老了，因为下载的druid-1.0.17.jar是16年最新发布的，去mysql官网下载最新jar包后，问题解决

### 运行结果
启动后项目，http://localhost:8080/ichargerclouds/druid/index.html
监控页面运行如下：

![图片3](http://7xvfir.com1.z0.glb.clouddn.com/Druid/3.png)