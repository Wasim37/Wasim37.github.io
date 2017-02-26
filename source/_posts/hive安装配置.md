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

hive-site.xml文件默认不需要修改，文件配置详解移步：

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

前面我们看到 hive-site.xml 文件中有两个重要的路径，切换到 hadoop 用户下查看 HDFS 是否有这些路径：
```bash
$ hadoop dfs -ls /
```
图片描述信息

没有发现上面提到的路径，因此我们需要自己新建这些目录，并且给它们赋予用户写（W）权限。
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

检查是否新建成功 hadoop dfs -ls / 以及 hadoop dfs -ls /user/hive/ ：

图片描述信息

（3）修改 io.tmpdir 路径

同时，要修改 hive-site.xml 中所有包含 ${system:java.io.tmpdir} 字段的 value 即路径（vim下 / 表示搜索，后面跟你的关键词，比如搜索 hello，则为 /hello , 再回车即可），你可以自己新建一个目录来替换它，例如 /home/hive/iotmp . 同样注意修改写权限。如果不修改这个，你很可能会出现如下错误：

图片描述信息

（4）运行 Hive

前面我们已经提到过，内嵌模式使用默认配置和 Derby 数据库，所以无需其它特别修改，先 ./start-all.sh 启动 Hadoop, 然后直接运行 hive：

你很可能会遇到这个错误：

图片描述信息

这是因为 Hive 中的 Jline jar 包和 Hadoop 中的 Jline 冲突了，在路径：$HADOOP_HOME/share/hadoop/yarn/lib/jline-0.9.94.jar 将其删除。

再次启动 hive，就OK了:

图片描述信息

show tables; 注意不要漏写了 分号。

图片描述信息

---

### 本地模式

现在我们替换默认的 Derby 数据库为 MySQL数据库。

（1）下载安装 MySQL

mysql安装详见：
http://wangxin123.com/2016/09/27/MySQL%E5%AE%89%E8%A3%85%E5%8F%8A%E5%8D%B8%E8%BD%BD/
本实验环境下默认是安装了 MySQL 的，直接启动它：
```bash
$ service mysql start
```

创建 hive 数据库，赋予相关用户远程登录权限

图片描述信息

图片描述信息

虽然 MySQL 已经默认安装，但我们还需要下载一个 MySQL 的 JDBC 驱动包。这里使用的是 mysql-connector-java-5.1.40.tar.gz，你需要将其复制到 $HIVE_HOME/lib 目录下面：
```bash
$ wget http://labfile.oss.aliyuncs.com/mysql-connector-java-5.1.40.tar.gz

$ tar zxvf mysql-connector-java-5.1.35.tar.gz

$ cd mysql-connector-java-5.1.35

$ mv mysql-connector-java-5.1.35-bin.jar /usr/local/hadoop/hive/lib/
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

启动 Hive 的方式同内嵌模式一样：

图片描述信息