---
title: Sqoop简介及安装
categories:
  - 大数据
tags:
  - Sqoop
date: 2017-2-27 21:18:00
toc: true

---
Hadoop业务的大致开发流程以及Sqoop在业务中的地位：

![](http://7xvfir.com1.z0.glb.clouddn.com/Sqoop%E7%AE%80%E4%BB%8B%E5%8F%8A%E5%AE%89%E8%A3%85/1.jpg)

---

### Sqoop概念 
Sqoop可以理解为【SQL–to–Hadoop】，正如名字所示，Sqoop是一个用来将关系型数据库和Hadoop中的数据进行相互转移的工具。它可以将一个关系型数据库(例如Mysql、Oracle)中的数据导入到Hadoop(例如HDFS、Hive、Hbase)中，也可以将Hadoop(例如HDFS、Hive、Hbase)中的数据导入到关系型数据库(例如Mysql、Oracle)中。

![](http://7xvfir.com1.z0.glb.clouddn.com/Sqoop%E7%AE%80%E4%BB%8B%E5%8F%8A%E5%AE%89%E8%A3%85/2.jpg)

<!-- more -->

---

### Sqoop版本对比
Sqoop1和Sqoop2对比：
- 两个版本，完全不兼容，Sqoop1几乎无法平滑升级到Sqoop2
- 版本号划分区别
 - Apache版本：1.4.x(Sqoop1); 1.99.x(Sqoop2)
 - CDH版本 : Sqoop-1.4.3-cdh4(Sqoop1) ; Sqoop2-1.99.2-cdh4.5.0 (Sqoop2)
- Sqoop2 相对 Sqoop1的改进 
 - 引入Sqoop server，集中化管理connector等 
 - 访问方式多样化：CLI(command-line interface，命令行界面)，Web UI，REST API 
 - 引入基于角色的安全机制

在架构上，sqoop2引入了sqoop server（具体服务器为tomcat），对connector实现了集中的管理。其访问方式也变得多样化了，其可以通过REST API、JAVA API、WEB UI以及CLI控制台方式进行访问。

另外，其在安全性能方面也有一定的改善，在sqoop1中我们经常用脚本的方式将HDFS中的数据导入到mysql中，或者反过来将mysql数据导入到HDFS中，其中在脚本里边都要显示指定mysql数据库的用户名和密码的，安全性做的不是太完善。在sqoop2中，如果是通过CLI方式访问的话，会有一个交互过程界面，你输入的密码信息不被看到。

---
### Sqoop架构对比
![](http://7xvfir.com1.z0.glb.clouddn.com/Sqoop%E7%AE%80%E4%BB%8B%E5%8F%8A%E5%AE%89%E8%A3%85/3.jpg)
![](http://7xvfir.com1.z0.glb.clouddn.com/Sqoop%E7%AE%80%E4%BB%8B%E5%8F%8A%E5%AE%89%E8%A3%85/4.jpg)

---

### 安装部署
移步sqoop官网：http://sqoop.apache.org/
![](http://7xvfir.com1.z0.glb.clouddn.com/Sqoop%E7%AE%80%E4%BB%8B%E5%8F%8A%E5%AE%89%E8%A3%85/5.jpg)
我们可以看到现在的稳定版本是1.4.6，1.99.7与1.4.6不兼容，并且1.99.7不适用于生产部署。所以我们下载1.4.6版本。


1、下载
下载地址：http://www-eu.apache.org/dist/sqoop/1.4.6/
下载 sqoop-1.4.6.bin__hadoop-1.0.0.tar.gz

2、解压安装
```bash
tar -zxvf sqoop-1.4.6.bin__hadoop-1.0.0.tar.gz -C /data
cd /data
mv sqoop-1.4.6.bin__hadoop-1.0.0/ sqoop1
chmod -R 775 /data/sqoop1
chown -R hadoop:hadoop /data/sqoop1
```

3、配置环境变量
```bash
vim /etc/profile

export SQOOP_HOME=/data/sqoop1
export PATH=$PATH:$SQOOP_HOME/bin

source /etc/profile
```

4、其他配置

（1）下载mysql驱动包，mysql-connector-java-5.1.40-bin.jar，把jar包丢到到$SQOOP_HOME/lib下面

（2）接下来修改sqoop的配置文件

```bash
cd /data/sqoop1/conf
cp sqoop-env-template.sh sqoop-env.sh 

vim sqoop-env.sh 

# 指定各环境变量的实际配置
# Set Hadoop-specific environment variables here.

#Set path to where bin/hadoop is available
#export HADOOP_COMMON_HOME=

#Set path to where hadoop-*-core.jar is available
#export HADOOP_MAPRED_HOME=

#set the path to where bin/hbase is available
#export HBASE_HOME=

#Set the path to where bin/hive is available
#export HIVE_HOME=
```
	
5、验证是否成功
```
# 列出所有数据库
sqoop list-databases --connect jdbc:mysql://ip:port --username username --password pwd

# 列出数据库所有表
sqoop list-tables --connect jdbc:mysql://ip:port/dbname --username username --password pwd
```

---

### 链接相关
大数据进阶计划
http://wangxin123.com/2017/02/18/%E5%A4%A7%E6%95%B0%E6%8D%AE%E8%BF%9B%E9%98%B6%E8%AE%A1%E5%88%92/

Sqoop下载地址
http://www-eu.apache.org/dist/sqoop/1.4.6/

Sqoop v1.4.6 文档
http://sqoop.apache.org/docs/1.4.6/index.html
