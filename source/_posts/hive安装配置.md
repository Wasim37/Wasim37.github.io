---
title: HIVE安装配置
categories:
  - 大数据
tags:
  - hive
date: 2017-2-26 21:18:00
toc: true

---

### Hive环境模式
- 内嵌模式
将元数据保存在本地内嵌的 Derby 数据库中，这是使用 Hive 最简单的方式。但是这种方式缺点也比较明显，因为一个内嵌的 Derby 数据库每次只能访问一个数据文件，这也就意味着它不支持多会话连接。

- 本地模式
这种模式是将元数据保存在本地独立的数据库中（一般是 MySQL），这用就可以支持多会话和多用户连接了。

- 远程模式
此模式应用于 Hive 客户端较多的情况。把 MySQL 数据库独立出来，将元数据保存在远端独立的 MySQL 服务中，避免了在每个客户端都安装 MySQL 服务从而造成冗余浪费的情况。

---

### 下载安装HIVE
Hive 是基于 Hadoop 文件系统之上的数据仓库。因此，安装Hive之前必须确保 Hadoop 已经成功安装。

本次教程，使用hive2.0.1版本，下载地址：http://mirrors.hust.edu.cn/apache/hive/hive-2.0.1/
下载apache-hive-2.0.1-bin.tar.gz，解压至/data/hive

```bash
tar -zxvf apache-hive-2.0.1-bin.tar.gz -C /data
cd /data
mv apache-hive-2.0.1-bin hive
```

<!-- more -->

---

### 配置环境变量

```bash
# 编辑文件
vim /etc/profile

# 文件末尾添加
export HIVE_HOME=/data/hive
export PATH=$HIVE_HOME/bin:$HIVE_HOME/conf:$PATH

# 使修改生效
source /etc/profile
```

---

### 内嵌模式

（1）修改 Hive 配置文件

Hive工程的配置文件为 hive-site.xml，默认情况下，该文件并不存在，需要拷贝它的模版来实现。
```bash
cd /data/hive/conf
cp hive-default.xml.template hive-site.xml
```

hive-site.xml的主要配置有
```bash
<property>
    <name>hive.metastore.warehouse.dir</name>
    <value>/user/hive/warehouse</value>
    <description>location of default database for the warehouse</description>
</property>
..
<property>
    <name>hive.exec.scratchdir</name>
    <value>/tmp/hive</value>
    <description>HDFS root scratch dir for Hive jobs which gets created with write all (733) permission. For each connecting user, an HDFS scratch dir: ${hive.exec.scratchdir}/&lt;username&gt; is created, with ${hive.scratch.dir.permission}.</description>
</property>
```

- hive.metastore.warehouse.dir
该参数指定了 Hive 的数据存储目录，默认位置在 HDFS 上面的 /user/hive/warehouse 路径下。
- hive.exec.scratchdir
该参数指定了 Hive 的数据临时文件目录，默认位置为 HDFS 上面的 /tmp/hive 路径下。

hive-site.xml文件内容不需修改，文件配置详解移步：https://my.oschina.net/HIJAY/blog/503842?p=1

接下来我们还要修改Hive目录下的/conf/hive-env.sh 文件，该文件默认也不存在，同样是拷贝它的模版来修改：

```bash
cd /data/hive/conf
cp hive-env.sh.template hive-env.sh

vim hive-env.sh

# 做如下修改
export HADOOP_HEAPSIZE=1024
# Set HADOOP_HOME to point to a specific hadoop install directory
HADOOP_HOME=/data/hadoop
# Hive Configuration Directory can be controlled by:
export HIVE_CONF_DIR=/data/hive/conf
# Folder containing extra ibraries required for hive compilation/execution can be controlled by:
export HIVE_AUX_JARS_PATH=/data/hive/lib
```

（2）创建必要目录

前面我们看到 hive-site.xml 文件中有两个重要的路径【/user/hive/warehouse】与【/tmp/hive】。
切换到hadoop 用户下查看HDFS是否有这些路径，如果没有，就新建目录，并且给它们赋予用户写权限。
```bash
$ hadoop dfs -mkdir /user/hive/warehouse
$ hadoop dfs -mkdir /tmp/hive
$ hadoop dfs -chmod 777 /user/hive/warehouse
$ hadoop dfs -chmod 777 /tmp/hive
```

如果你遇到 no such file or directory 类似的错误，就一步一步新建目录，例如：
```bash
$ hadoop dfs -mkdir /tmp
$ hadoop dfs -mkdir /tmp/hive
```

然后通过相关命令检查是否新建成功，比如【hdfs dfs -lsr /】。

（3）运行 Hive

前面我们已经提到过，内嵌模式使用默认配置和 Derby 数据库，所以无需其它特别修改，先 ./start-all.sh 启动 Hadoop, 然后直接运行 hive：
```bash
[root@iZwz9b62gfdv0s2e67yo8kZ /]$ cd /data/hive/bin/
[root@iZwz9b62gfdv0s2e67yo8kZ bin]$ hive
```

你很可能会遇到与【${system:java.io.tmpdir}】有关的这个错误：
```bash
Exception in thread "main"Java.lang.RuntimeException: java.lang.IllegalArgumentException:java.NET.URISyntaxException: Relative path in absolute URI:${system:java.io.tmpdir%7D/$%7Bsystem:user.name%7D
        atorg.apache.Hadoop.Hive.ql.session.SessionState.start(SessionState.java:444)
        atorg.apache.hadoop.hive.cli.CliDriver.run(CliDriver.java:672)
        atorg.apache.hadoop.hive.cli.CliDriver.main(CliDriver.java:616)
        atsun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
```

解决方法是修改 hive-site.xml 中所有包含 ${system:java.io.tmpdir} 字段的 value。
可自己新建一个目录来替换它，例如 /data/hive/iotmp，同时赋予相关写权限。

修改后再次启动 hive，可能又遇到数据库未初始化的错误：
```bash
Exception in thread "main" java.lang.RuntimeException: Hive metastore database is not initialized. 
Please use schematool (e.g. ./schematool -initSchema -dbType ...) to create the schema. 
If needed, don't forget to include the option to auto-create the underlying database in your JDBC connection string (e.g. ?createDatabaseIfNotExist=true for derby)
```

执行以下命令初始化即可
```bash
cd /data/hive/bin
./schematool -initSchema -dbType derby
```

继续报错：
```bash
Initialization script hive-schema-2.0.0.derby.sql
Error: FUNCTION 'NUCLEUS_ASCII' already exists. (state=X0Y68,code=30000)
org.apache.hadoop.hive.metastore.HiveMetaException: Schema initialization FAILED! Metastore state would be inconsistent !!
*** schemaTool failed ***
```

这个function的构建是数据库初始化的一部分，既然存在了，就直接去hive-schema-2.0.0-derby.sql里面注释掉【CREATE FUNCTION】的相关语句好了。

注释后再次启动hive，就ok了

![](http://7xvfir.com1.z0.glb.clouddn.com/hive%E5%AE%89%E8%A3%85%E9%85%8D%E7%BD%AE/1.png)

---

### 本地模式

（1）安装 MySQL
成功安装mysql后启动服务，并创建名为hive的数据库，再创建一个hive用户为HIVE所用。
mysql安装方法详见：[MySQL安装及卸载](http://wangxin123.com/2016/09/27/MySQL%E5%AE%89%E8%A3%85%E5%8F%8A%E5%8D%B8%E8%BD%BD/)

MySQL安装后，还需要下载一个MySQL的JDBC驱动包。
这里使用的是mysql-connector-java-5.1.40-bin.jar，需将其复制到$HIVE_HOME/lib目录下。
```bash
$ tar -zxvf mysql-connector-java-5.1.40.tar.gz
$ cd mysql-connector-java-5.1.40
$ mv mysql-connector-java-5.1.40-bin.jar /data/hive/lib/
```

（2）修改 hive-site.xml 配置文件

最后，依然是修改 $HIVE_HOME/conf 下的 hive-site.xml 文件，把默认的 Derby 修改为 MySQL :

```bash
<property>
    <name>javax.jdo.option.ConnectionURL</name>
    //所连接的MySQL数据库实例
    <value>jdbc:mysql://localhost:3306/hive</value>
</property>

<property>
    <name>javax.jdo.option.ConnectionDriverName</name>
    //连接的MySQL数据库驱动
    <value>com.mysql.jdbc.Driver</value>
</property>

<property>
    <name>javax.jdo.option.ConnectionUserName</name>
    //连接的MySQL数据库用户名
    <value>hive</value>
</property>

<property>
    <name>javax.jdo.option.ConnectionPassword</name>
    //连接的MySQL数据库密码
    <value>hive</value>
</property>
```
（3）启动 Hive

启动 Hive 的方式同内嵌模式一样，需先初始化数据库.
```bash
cd /data/hive/bin
./schematool -initSchema -dbType mysql
```

然后运行HIVE，可能发现运行不成功，并一直收到警告
```bash
Sun Feb 26 23:20:20 CST 2017 WARN: Establishing SSL connection without server's identity verification is not recommended. According to MySQL 5.5.45+, 5.6.26+ and 5.7.6+ requirements SSL connection must be established by default if explicit option isn't set. For compliance with existing applications not using SSL the verifyServerCertificate property is set to 'false'. You need either to explicitly disable SSL by setting useSSL=false, or set useSSL=true and provide truststore for server certificate verification.
```

修改hive-site.xml文件的javax.jdo.option.ConnectionURL选项即可
```bash
<property>
    <name>javax.jdo.option.ConnectionURL</name>
    //所连接的MySQL数据库实例
    <value>jdbc:mysql://localhost:3306/hive?characterEncoding=utf8&useSSL=false</value>
</property>
```

再次启动HIVE，仍然报错
```bash
[Fatal Error] hive-site.xml:493:77: The reference to entity "useSSL" must end with the ';' delimiter.
Exception in thread "main" java.lang.RuntimeException: org.xml.sax.SAXParseException; systemId: file:/data/hive/conf/hive-site.xml; lineNumber: 493; columnNumber: 77; The reference to entity "useSSL" must end with the ';' delimiter.
```

经查，再次修改javax.jdo.option.ConnectionURL选项，然后启动HIVE，发现启动成功。
```bash
<property>
    <name>javax.jdo.option.ConnectionURL</name>
    //所连接的MySQL数据库实例
    <value>jdbc:mysql://localhost:3306/hive?characterEncoding=utf8&amp;useSSL=false</value>
</property>
```

---

### 链接相关
大数据进阶计划
http://wangxin123.com/2017/02/18/%E5%A4%A7%E6%95%B0%E6%8D%AE%E8%BF%9B%E9%98%B6%E8%AE%A1%E5%88%92/
