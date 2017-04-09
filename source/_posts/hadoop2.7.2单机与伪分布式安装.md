---
title: hadoop2.7.2单机与伪分布式安装
categories:
  - 大数据
tags:
  - hadoop
date: 2017-2-21 21:18:00
toc: true

---

### 环境相关
系统：CentOS 6.8 64位
jdk：1.7.0_79
hadoop：hadoop 2.7.2

---

### 安装java环境
详见：[linux中搭建java开发环境](http://wangxin123.com/2016/05/29/linux%E4%B8%AD%E6%90%AD%E5%BB%BAjava%E5%BC%80%E5%8F%91%E7%8E%AF%E5%A2%83/)

---

### 创建hadoop用户
```bash
# 以root用户登录
su root

# 创建一个hadoop组下的hadoop用户，并使用 /bin/bash 作为shell
useradd -m hadoop -G hadoop -s /bin/bash

# useradd 主要参数
# －c：加上备注文字，备注文字保存在passwd的备注栏中。
# －d：指定用户登入时的启始目录
# －D：变更预设值
# －e：指定账号的有效期限，缺省表示永久有效
# －f：指定在密码过期后多少天即关闭该账号
# －g：指定用户所属的起始群组
# －G：指定用户所属的附加群组
# －m：自动建立用户的登入目录
# －M：不要自动建立用户的登入目录
# －n：取消建立以用户名称为名的群组
# －r：建立系统账号
# －s：指定用户登入后所使用的shell
# －u：指定用户ID号

# 设置hadoop用户密码，按提示输入两次密码
# 学习阶段可简单设为"hadoop"，若提示“无效的密码，过于简单”，则再次输入确认即可
passwd hadoop
```

<!-- more -->

可为hadoop用户增加管理员权限，避免一些对新手来说比较棘手的权限问题。
```bash
visudo

# 找到 root ALL=(ALL) ALL 这行
# 大致在第98行，可先按一下键盘上的ESC键，然后输入 :98
# 在这行下面增加一行内容 hadoop ALL=(ALL) ALL

## Allow root to run any commands anywhere
root    ALL=(ALL)       ALL
hadoop  ALL=(ALL)       ALL

```
保存退出后以刚才创建的hadoop用户登录

---

### 配置SSH免密码登录
集群、单节点模式都需要用到 SSH 登陆，一般情况下，CentOS 默认已安装了 SSH client、SSH server，打开终端执行如下命令进行检验，查看是否包含了SSH client跟SSH server
```bash
[hadoop@iZwz9b62gfdv0s2e67yo8kZ hadoop]$ rpm -qa | grep ssh
libssh2-1.4.2-2.el6_7.1.x86_64
openssh-5.3p1-118.1.el6_8.x86_64
openssh-clients-5.3p1-118.1.el6_8.x86_64
openssh-server-5.3p1-118.1.el6_8.x86_64
```

如果不包含，可以通过yum进行安装
```bash
sudo yum install openssh-clients
sudo yum install openssh-server
```

测试下ssh是否可用
```bash
# 按提示输入密码hadoop，就可以登陆到本机
ssh localhost
```

但这样登陆是需要每次输入密码的，我们需要配置成SSH无密码登陆比较方便。
首先输入 exit 退出刚才的 ssh，就回到了我们原先的终端窗口。
然后利用 ssh-keygen 生成密钥，并将密钥加入到授权中。
```bash
# 退出刚才的 ssh localhost
exit

# 若没有该目录，请先执行一次ssh localhost
cd ~/.ssh/

# pwd查看当前目录，应为"/home/hadoop/"
# ~ 代表的是用户的主文件夹，即 “/home/用户名” 这个目录

# 会有提示，都按回车就可以
ssh-keygen -t rsa              
cat id_rsa.pub >> authorized_keys
chmod 600 ./authorized_keys
```

此时再用 ssh localhost 命令, 无需输入密码就可以直接登陆了
```bash
[hadoop@iZwz9b62gfdv0s2e67yo8kZ .ssh]$ ssh localhost
Last login: Wed Feb 20 22:29:22 2017 from 127.0.0.1

Welcome to Alibaba Cloud Elastic Compute Service !

[hadoop@iZwz9b62gfdv0s2e67yo8kZ ~]$ exit
logout
Connection to localhost closed.
[hadoop@iZwz9b62gfdv0s2e67yo8kZ .ssh]$ 
```

---

### 安装hadoop2
下载地址：http://mirrors.hust.edu.cn/apache/hadoop/common/hadoop-2.7.2/ 。
下载 hadoop-2.7.2.tar.gz 和 hadoop-2.7.2.tar.gz.mds 文件，保存在/data/install_package/hadoop。

其中hadoop-2.x.y.tar.gz.mds文件是用来检查hadoop-2.x.y.tar.gz 文件的完整性的。
如果文件发生了损坏或下载不完整，Hadoop 将无法正常运行。相关命令如下：
```bash
cd /data/install_package/hadoop
head -n 6 hadoop-2.7.2.tar.gz.mds
md5sum hadoop-2.7.2.tar.gz | tr "a-z" "A-Z"
```

若hadoop-2.x.y.tar.gz不完整，则这两个值差别很大

![](http://7xvfir.com1.z0.glb.clouddn.com/hadoop2.7.2%E5%8D%95%E6%9C%BA%E4%B8%8E%E4%BC%AA%E5%88%86%E5%B8%83%E5%BC%8F%E5%AE%89%E8%A3%85/1.png?imageView2/0/q/75|watermark/1/image/aHR0cDovLzd4dmZpci5jb20xLnowLmdsYi5jbG91ZGRuLmNvbS8lRTYlQjAlQjQlRTUlOEQlQjAvJUU1JThEJTlBJUU1JUFFJUEyJUU2JUIwJUI0JUU1JThEJUIwXyVFNyU5OSVCRCVFOCU4OSVCMi5wbmc=/dissolve/100/gravity/SouthEast/dx/10/dy/10|imageslim)

我们选择将 Hadoop 安装至 /data/hadoop/ 中
```bash
sudo tar -zxf /data/install_package/hadoop/hadoop-2.6.0.tar.gz -C /data/hadoop
cd /data/hadoop/
sudo mv ./hadoop-2.7.2/ ./hadoop
# 赋予权限，hadoop组及hadoop用户前面已经配置
sudo chown -R hadoop:hadoop ./hadoop
```

Hadoop 解压后即可使用。输入hadoop version，成功会显示版本信息

![](http://7xvfir.com1.z0.glb.clouddn.com/hadoop2.7.2%E5%8D%95%E6%9C%BA%E4%B8%8E%E4%BC%AA%E5%88%86%E5%B8%83%E5%BC%8F%E5%AE%89%E8%A3%85/2.jpg?imageView2/0/q/75|watermark/1/image/aHR0cDovLzd4dmZpci5jb20xLnowLmdsYi5jbG91ZGRuLmNvbS8lRTYlQjAlQjQlRTUlOEQlQjAvJUU1JThEJTlBJUU1JUFFJUEyJUU2JUIwJUI0JUU1JThEJUIwXyVFNyU5OSVCRCVFOCU4OSVCMi5wbmc=/dissolve/100/gravity/SouthEast/dx/10/dy/10|imageslim)

---

### hadoop单机配置(非分布式)
Hadoop 默认为非分布式模式，非分布式即单 Java 进程。

Hadoop 默认附带了丰富的例子，包括 wordcount、terasort、join、grep 等。执行下面命令可以查看：

![](http://7xvfir.com1.z0.glb.clouddn.com/hadoop2.7.2%E5%8D%95%E6%9C%BA%E4%B8%8E%E4%BC%AA%E5%88%86%E5%B8%83%E5%BC%8F%E5%AE%89%E8%A3%85/3.jpg?imageView2/0/q/75|watermark/1/image/aHR0cDovLzd4dmZpci5jb20xLnowLmdsYi5jbG91ZGRuLmNvbS8lRTYlQjAlQjQlRTUlOEQlQjAvJUU1JThEJTlBJUU1JUFFJUEyJUU2JUIwJUI0JUU1JThEJUIwXyVFNyU5OSVCRCVFOCU4OSVCMi5wbmc=/dissolve/100/gravity/SouthEast/dx/10/dy/10|imageslim)

在此我们选择运行 grep 例子，将 input 文件夹中的所有文件作为输入，筛选当中符合正则表达式 dfs[a-z.]+ 的单词并统计出现的次数，最后输出结果到 output 文件夹中。
```bash
cd /data/hadoop
mkdir ./input

# 将配置文件作为输入文件
cp ./etc/hadoop/*.xml ./input  
# 筛选符合规则的单词并统计其出现次数
./bin/hadoop jar ./share/hadoop/mapreduce/hadoop-mapreduce-examples-*.jar grep ./input ./output 'dfs[a-z.]+'

# 查看运行结果
[hadoop@iZwz9b62gfdv0s2e67yo8kZ hadoop]$ cat ./output/*          
1	dfsadmin
```

若运行出现 WARN 提示【WARN util.NativeCodeLoader: Unable to load native-hadoop library for your platform… using builtin-java classes where applicable】，可以忽略，不会影响 Hadoop 正常运行（可通过编译 Hadoop 源码解决，详见：http://www.cnblogs.com/wuren/p/3962511.html）。

>注意，Hadoop 默认不会覆盖结果文件，因此再次运行上面实例会提示出错，需要先将 ./output 删除。

---

### hadoop伪分布式配置
Hadoop 可以在单节点上以伪分布式方式运行，配置伪分布式前，我们需设置HADOOP环境变量。
```bash
# 编辑profile
vim /etc/profile

# 文件末尾新增
export HADOOP_HOME=/data/hadoop
export HADOOP_INSTALL=$HADOOP_HOME
export HADOOP_MAPRED_HOME=$HADOOP_HOME
export HADOOP_COMMON_HOME=$HADOOP_HOME
export HADOOP_HDFS_HOME=$HADOOP_HOME
export YARN_HOME=$HADOOP_HOME
export HADOOP_COMMON_LIB_NATIVE_DIR=$HADOOP_HOME/lib/native
export PATH=$PATH:$HADOOP_HOME/sbin:$HADOOP_HOME/bin

# 使配置生效
source /etc/profile
```

然后修改HADOOP核心配置文件，文件位于 /data/hadoop/etc/hadoop/ 中。
伪分布式需要修改2个配置文件 core-site.xml 和 hdfs-site.xml。

修改配置文件 core-site.xml：
```bash
# 默认配置
<configuration>
</configuration>

# 修改为
<configuration>
    <property>
        <name>hadoop.tmp.dir</name>
        <value>file:/data/hadoop/tmp</value>
        <description>Abase for other temporary directories.</description>
    </property>
    <property>
        <name>fs.defaultFS</name>
        <value>hdfs://localhost:9000</value>
    </property>
</configuration>
```

同样修改配置文件 hdfs-site.xml：
```bash
# 默认配置
<configuration>
</configuration>

# 修改为
<configuration>
    <property>
        <name>dfs.replication</name>
        <value>1</value>
    </property>
    <property>
        <name>dfs.namenode.name.dir</name>
        <value>file:/data/hadoop/tmp/dfs/name</value>
    </property>
    <property>
        <name>dfs.datanode.data.dir</name>
        <value>file:/data/hadoop/tmp/dfs/data</value>
    </property>
</configuration>
```

>hadoop配置文件详解可查看官方文档，也可以移步：http://www.iyunv.com/thread-17698-1-1.html

配置完成后，格式化NameNode
```bash
./bin/hdfs namenode -format
```

成功的话，会看到 “successfully formatted” 和 “Exitting with status 0” 的提示，若为 “Exitting with status 1” 则是出错。

接着开启 NaneNode 和 DataNode 守护进程：
```bash
./sbin/start-dfs.sh
```

若出现如下 SSH 的提示 “Are you sure you want to continue connecting”，输入 yes 即可。
启动时可能会有 WARN 提示 "WARN util.NativeCodeLoader…"，如前面提到的，这个提示不会影响正常使用。

启动完成后，可以通过命令 jps 来判断是否成功启动，若成功启动则会列出如下进程: “NameNode”、”DataNode”和SecondaryNameNode（如果 SecondaryNameNode 没有启动，请运行 sbin/stop-dfs.sh 关闭进程，然后再次尝试启动尝试）。如果没有 NameNode 或 DataNode ，那就是配置不成功，请仔细检查之前步骤，或通过查看启动日志排查原因。

```bash
[hadoop@iZwz9b62gfdv0s2e67yo8kZ hadoop]$ jps
20339 SecondaryNameNode
20166 DataNode
20027 NameNode
15375 Jps
```

>通过查看启动日志分析启动失败原因
有时 Hadoop 无法正确启动，如 NameNode 进程没有顺利启动，这时可以查看启动日志来排查原因，注意几点：
- 启动时会提示形如 “dblab: starting namenode, logging to /data/hadoop/logs/hadoop-hadoop-namenode-iZwz9b62gfdv0s2e67yo8kZ.out”，其中 iZwz9b62gfdv0s2e67yo8kZ 对应你的主机名，但启动的日志信息是记录在 /data/hadoop/logs/hadoop-hadoop-namenode-iZwz9b62gfdv0s2e67yo8kZ.log 中，所以应该查看这个后缀为 .log 的文件；
- 每一次的启动日志都是追加在日志文件之后，所以得拉到最后面看，看下记录的时间就知道了。
- 一般出错的提示在最后面，也就是写着 Fatal、Error 或者 Java Exception 的地方。
- 可以在网上搜索一下出错信息，看能否找到一些相关的解决方法。

成功启动后，可以访问 Web 界面 http://ip:50070 查看 NameNode 和 Datanode 信息，还可以在线查看 HDFS 中的文件。

![](http://7xvfir.com1.z0.glb.clouddn.com/hadoop2.7.2%E5%8D%95%E6%9C%BA%E4%B8%8E%E4%BC%AA%E5%88%86%E5%B8%83%E5%BC%8F%E5%AE%89%E8%A3%85/4.jpg?imageView2/0/q/75|watermark/1/image/aHR0cDovLzd4dmZpci5jb20xLnowLmdsYi5jbG91ZGRuLmNvbS8lRTYlQjAlQjQlRTUlOEQlQjAvJUU1JThEJTlBJUU1JUFFJUEyJUU2JUIwJUI0JUU1JThEJUIwLnBuZw==/dissolve/100/gravity/SouthEast/dx/10/dy/10|imageslim)

---

### 运行hadoop伪分布式实例
上面的单机模式，grep 例子读取的是本地数据，伪分布式读取的则是 HDFS 上的数据。要使用 HDFS，首先需要在 HDFS 中创建用户目录：

```bash
./bin/hdfs dfs -mkdir -p /user/hadoop
```

接着将 ./etc/hadoop 中的 xml 文件作为输入文件复制到分布式文件系统中，即将 /data/hadoop/etc/hadoop 复制到分布式文件系统中的 /user/hadoop/input 中。我们使用的是 hadoop 用户，并且已创建相应的用户目录 /user/hadoop ，因此在命令中就可以使用相对路径如 input，其对应的绝对路径就是 /user/hadoop/input:

```bash
./bin/hdfs dfs -mkdir input
./bin/hdfs dfs -put ./etc/hadoop/*.xml input
```

复制完成后，可以通过如下命令查看 HDFS 中的文件列表：
```bash
./bin/hdfs dfs -ls input
```

伪分布式运行 MapReduce 作业的方式跟单机模式相同，区别在于伪分布式读取的是HDFS中的文件（可以将单机步骤中创建的本地 input 文件夹，输出结果 output 文件夹都删掉来验证这一点）。

```bash
./bin/hadoop jar ./share/hadoop/mapreduce/hadoop-mapreduce-examples-*.jar grep input output 'dfs[a-z.]+'

# 查看运行结果的命令（查看的是位于HDFS中的输出结果）
./bin/hdfs dfs -cat output/*

# 结果如下
1	dfsadmin
1	dfs.replication
1	dfs.namenode.name.dir
1	dfs.datanode.data.dir

```

我们也可以将运行结果取回到本地：
```bash
rm -r ./output    # 先删除本地的 output 文件夹（如果存在）
./bin/hdfs dfs -get output ./output
cat ./output/*
```

>运行程序时，输出目录不能存在。在实际开发应用程序时，可考虑在程序中加上如下代码，能在每次运行时自动删除输出目录，避免繁琐的命令行操作.
```bash
Configuration conf = new Configuration();
Job job = new Job(conf);
 
/* 删除输出目录 */
Path outputPath = new Path(args[1]);
outputPath.getFileSystem(conf).delete(outputPath, true);
```

若要关闭 Hadoop，则运行
```bash
./sbin/stop-dfs.sh
```
下次启动 hadoop 时，无需进行 NameNode 的初始化，只需要运行 ./sbin/start-dfs.sh 即可

---

### 启动YARN
伪分布式不启动 YARN 也可以，一般不会影响程序执行。

有的人可能会疑惑，怎么启动 Hadoop 后，见不到书上所说的 JobTracker 和 TaskTracker，这是因为Hadoop2使用了新的 MapReduce 框架（MapReduce V2，也称为 YARN，Yet Another Resource Negotiator）。

YARN 是从 MapReduce 中分离出来的，负责资源管理与任务调度。YARN 运行于 MapReduce 之上，提供了高可用性、高扩展性，YARN 的更多介绍在此不展开，有兴趣的可移步：http://blog.chinaunix.net/uid-28311809-id-4383551.html

上述通过 ./sbin/start-dfs.sh 启动 Hadoop，仅仅是启动了 MapReduce 环境，我们可以启动 YARN ，让 YARN 来负责资源管理与任务调度。

首先修改配置文件 mapred-site.xml：
```bash
mv ./etc/hadoop/mapred-site.xml.template ./etc/hadoop/mapred-site.xml
vim ./etc/hadoop/mapred-site.xml

<configuration>
    <property>
        <name>mapreduce.framework.name</name>
        <value>yarn</value>
    </property>
</configuration>
```

然后就可以启动YARN了，当然，首先需要先执行过 ./sbin/start-dfs.sh
```bash
./sbin/start-yarn.sh      $ 启动YARN
# 开启历史服务器，才能在Web中查看任务运行情况
./sbin/mr-jobhistory-daemon.sh start historyserver 
```

然后通过jps查看，可以看到多了 NodeManager 和 ResourceManager 两个后台进程。

启动 YARN 之后，运行实例的方法还是一样的，仅仅是资源管理方式、任务调度不同。观察日志信息可以发现，不启用 YARN 时，是 “mapred.LocalJobRunner” 在跑任务，启用 YARN 之后，是 “mapred.YARNRunner” 在跑任务。启动 YARN 有个好处是可以通过 Web 界面查看任务的运行情况：http://ip:8088/cluster

但 YARN 主要是为集群提供更好的资源管理与任务调度，然而这在单机上体现不出价值，反而会使程序跑得稍慢些。因此在单机上是否开启 YARN 就看实际情况了。

>不启动 YARN 需重命名 mapred-site.xml。
如果不想启动 YARN，务必把配置文件 mapred-site.xml 重命名，改成 mapred-site.xml.template，需要用时改回来就行。否则在该配置文件存在，而未开启 YARN 的情况下，运行程序会提示 “Retrying connect to server: 0.0.0.0/0.0.0.0:8032” 的错误，这也是为何该配置文件初始文件名为 mapred-site.xml.template。

---

### 链接相关
大数据进阶计划
http://wangxin123.com/2017/02/18/%E5%A4%A7%E6%95%B0%E6%8D%AE%E8%BF%9B%E9%98%B6%E8%AE%A1%E5%88%92/

hadoop2下载地址
http://mirrors.hust.edu.cn/apache/hadoop/common/hadoop-2.7.2/

Yarn简单介绍及内存配置
http://blog.chinaunix.net/uid-28311809-id-4383551.html

hadoop配置文件详解
http://www.iyunv.com/thread-17698-1-1.html