---
title: ELK安装与配置
categories:
  - 运维部署
tags:
  - elk
date: 2016-10-25 22:10:00
toc: true

---

### ELK介绍
日志主要包括系统日志、应用程序日志和安全日志。系统运维和开发人员可以通过日志了解服务器软硬件信息、检查配置过程中的错误及错误发生的原因。经常分析日志可以了解服务器的负荷，性能安全性，从而及时采取措施纠正错误。

通常，日志被分散的储存不同的设备上。如果你管理数十上百台服务器，还使用依次登录每台机器的传统方法查阅日志，效率会十分其低下。开源实时日志分析ELK平台能够完美的解决上述问题。

**ELK由ElasticSearch、Logstash和Kiabana三个开源工具组成：**
- **Elasticsearch**是个开源分布式搜索引擎，它的特点有：分布式，零配置，自动发现，索引自动分片，索引副本机制，restful风格接口，多数据源，自动搜索负载等。
- **Logstash**是一个完全开源的工具，他可以对你的日志进行收集、过滤，并将其存储供以后使用（如，搜索）。
- **Kibana**也是一个开源和免费的工具，它Kibana可以为 Logstash 和 ElasticSearch 提供的日志分析友好的 Web 界面，可以帮助您汇总、分析和搜索重要数据日志。

<!-- more -->

---

### 安装jdk

jdk下载地址：http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html
Logstash的运行依赖于Java环境，而Logstash1.5以上版本依赖的java版本不低于java 1.7，因此推荐最新版本Java。
```bash
#rpm -ivh jdk-8u77-linux-x64.rpm 

#java -version
java version "1.8.0_77"
Java(TM) SE Runtime Environment (build 1.8.0_77-b03)
Java HotSpot(TM) 64-Bit Server VM (build 25.77-b03, mixed mode)
```

---

### 安装Elasticsearch
安装elasticsearch、logstash和kibana的官网地址：https://www.elastic.co/downloads/

我使用的版本信息如下：
elasticsearch：https:https://www.elastic.co/downloads/past-releases/elasticsearch-2-2-0
logstash： https://www.elastic.co/downloads/past-releases/logstash-2-2-0
kibana： https://www.elastic.co/downloads/past-releases/kibana-4-4-0

安装elasticsearch
```bash
tar xf elasticsearch-2.2.0.tar.gz -C /usr/local/
```

安装elasticsearch的head插件
```bash
#cd /usr/local/elasticsearch-2.2.0
#./bin/plugin install mobz/elasticsearch-head
-> Installing mobz/elasticsearch-head...
Plugins directory [/usr/local/elasticsearch-2.2.0/plugins] does not exist. Creating...
Trying https://github.com/mobz/elasticsearch-head/archive/master.zip ...
Downloading ..................................DONE
Verifying https://github.com/mobz/elasticsearch-head/archive/master.zip checksums if available ...
NOTE: Unable to verify checksum for downloaded plugin (unable to find .sha1 or .md5 file to verify)
Installed head into /usr/local/elasticsearch-2.2.0/plugins/head
```

查看：
```bash
#ll plugins/
total 4
drwxr-xr-x 5 root root 4096 Mar 29 18:09 head
```

安装elasticsearch的kopf插件
注：Elasticsearch-kopf插件可以查询Elasticsearch中的数据
```bash
#./bin/plugin install lmenezes/elasticsearch-kopf
-> Installing lmenezes/elasticsearch-kopf...
Trying https://github.com/lmenezes/elasticsearch-kopf/archive/master.zip ...
Downloading ..................................DONE
Verifying https://github.com/lmenezes/elasticsearch-kopf/archive/master.zip checksums if available ...
NOTE: Unable to verify checksum for downloaded plugin (unable to find .sha1 or .md5 file to verify)
Installed kopf into /usr/local/elasticsearch-2.2.0/plugins/kopf
```
查看
```bash
#ll  plugins/
total 8
drwxr-xr-x 5 search search 4096 Mar 29 18:09 head
drwxrwxr-x 8 search search 4096 Mar 30 18:10 kopf
```

创建elasticsearch的data和logs目录
```bash
mkdir /elasticsearch/data -pv
mkdir /elasticsearch/logs -pv
```

编辑elasticsearch的配置文件
```bash
cd config

#备份一下
cp elasticsearch.yml elasticsearch.yml_back

#在末尾添加如下几行
vim elasticsearch.yml   

#cluster.name: es_cluster
#node.name: node-1
#path.data: /elasticsearch/data
#path.logs: /elasticsearch/logs
#network.host: 10.0.90.24    
#network.port: 9200
```

启动elasticsearch
```bash
#./bin/elasticsearch
Exception in thread "main" java.lang.RuntimeException: don't run elasticsearch as root.
        at org.elasticsearch.bootstrap.Bootstrap.initializeNatives(Bootstrap.java:93)
        at org.elasticsearch.bootstrap.Bootstrap.setup(Bootstrap.java:144)
        at org.elasticsearch.bootstrap.Bootstrap.init(Bootstrap.java:285)
        at org.elasticsearch.bootstrap.Elasticsearch.main(Elasticsearch.java:35)
Refer to the log for complete error details.
```

提示不能以root用户启动，所以创建一个普通用户，以普通用户身份启动elasticsearch
```bash
#groupadd search
#useradd -g search  search

将data和logs目录的属主和属组改为search
#chown search.search /elasticsearch/ -R
```

重新启动
```bash
#./bin/elasticsearch
[2016-03-29 19:58:20,026][WARN ][bootstrap                ] unable to install syscall filter: seccomp unavailable: requires kernel 3.5+ with CONFIG_SECCOMP and CONFIG_SECCOMP_FILTER compiled in
Exception in thread "main" java.lang.IllegalStateException: Unable to access 'path.scripts' (/usr/local/elasticsearch-2.2.0/config/scripts)
Likely root cause: java.nio.file.AccessDeniedException: /usr/local/elasticsearch-2.2.0/config/scripts
        at sun.nio.fs.UnixException.translateToIOException(UnixException.java:84)
        at sun.nio.fs.UnixException.rethrowAsIOException(UnixException.java:102)
        at sun.nio.fs.UnixException.rethrowAsIOException(UnixException.java:107)
        at sun.nio.fs.UnixFileSystemProvider.createDirectory(UnixFileSystemProvider.java:384)
        at java.nio.file.Files.createDirectory(Files.java:674)
        at java.nio.file.Files.createAndCheckIsDirectory(Files.java:781)
        at java.nio.file.Files.createDirectories(Files.java:767)
        at org.elasticsearch.bootstrap.Security.ensureDirectoryExists(Security.java:337)
        at org.elasticsearch.bootstrap.Security.addPath(Security.java:314)
        at org.elasticsearch.bootstrap.Security.addFilePermissions(Security.java:248)
        at org.elasticsearch.bootstrap.Security.createPermissions(Security.java:212)
        at org.elasticsearch.bootstrap.Security.configure(Security.java:118)
        at org.elasticsearch.bootstrap.Bootstrap.setupSecurity(Bootstrap.java:196)
        at org.elasticsearch.bootstrap.Bootstrap.setup(Bootstrap.java:167)
        at org.elasticsearch.bootstrap.Bootstrap.init(Bootstrap.java:285)
        at org.elasticsearch.bootstrap.Elasticsearch.main(Elasticsearch.java:35)
Refer to the log for complete error details.
```

报以上错误，原因是权限的问题，修改权限
```bash
#chown search.search /usr/local/elasticsearch-2.2.0 -R
```

然后切换到search用户启动elasticsearch
```bash
#su - search
$cd /usr/local/elasticsearch-2.2.0
$./bin/elasticsearch
[2016-03-29 20:11:20,243][WARN ][bootstrap                ] unable to install syscall filter: seccomp unavailable: requires kernel 3.5+ with CONFIG_SECCOMP and CONFIG_SECCOMP_FILTER compiled in
[2016-03-29 20:11:20,409][INFO ][node                     ] [node-1] version[2.2.0], pid[2359], build[8ff36d1/2016-01-27T13:32:39Z]
[2016-03-29 20:11:20,409][INFO ][node                     ] [node-1] initializing ...
[2016-03-29 20:11:21,102][INFO ][plugins                  ] [node-1] modules [lang-expression, lang-groovy], plugins [head], sites [head]
[2016-03-29 20:11:21,118][INFO ][env                      ] [node-1] using [1] data paths, mounts [[/ (/dev/sda3)]], net usable_space [24.5gb], net total_space [27.2gb], spins? [possibly], types [ext4]
[2016-03-29 20:11:21,118][INFO ][env                      ] [node-1] heap size [1007.3mb], compressed ordinary object pointers [true]
[2016-03-29 20:11:22,541][INFO ][node                     ] [node-1] initialized
[2016-03-29 20:11:22,542][INFO ][node                     ] [node-1] starting ...
[2016-03-29 20:11:22,616][INFO ][transport                ] [node-1] publish_address {10.0.90.24:9300}, bound_addresses {10.0.90.24:9300}
[2016-03-29 20:11:22,636][INFO ][discovery                ] [node-1] es_cluster/yNJhglX4RF-ydC4CWpFyTA
[2016-03-29 20:11:25,732][INFO ][cluster.service          ] [node-1] new_master {node-1}{yNJhglX4RF-ydC4CWpFyTA}{10.0.90.24}{10.0.90.24:9300}, reason: zen-disco-join(elected_as_master, [0] joins received)
[2016-03-29 20:11:25,769][INFO ][http                     ] [node-1] publish_address {10.0.90.24:9200}, bound_addresses {10.0.90.24:9200}
[2016-03-29 20:11:25,770][INFO ][node                     ] [node-1] started
[2016-03-29 20:11:25,788][INFO ][gateway                  ] [node-1] recovered [0] indices into cluster_state

#也可以直接让elasticsearch在后台运行
$./bin/elasticsearch &

#或者不中断启动（我这里使用这种方式启动）
$nohup /usr/local/elasticsearch-2.2.0/bin/elasticsearch &
```

查看启动是否成功
```bash 
# netstat -tunlp
Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address               Foreign Address             State       PID/Program name   
tcp        0      0 0.0.0.0:22                  0.0.0.0:*                   LISTEN      950/sshd            
tcp        0      0 127.0.0.1:25                0.0.0.0:*                   LISTEN      1027/master         
tcp        0      0 ::ffff:10.0.90.24:9300      :::*                        LISTEN      2428/java           
tcp        0      0 :::22                       :::*                        LISTEN      950/sshd            
tcp        0      0 ::1:25                      :::*                        LISTEN      1027/master         
tcp        0      0 ::ffff:10.0.90.24:9200      :::*                        LISTEN      2428/java     
```

在浏览器启动查看
```bash
http://10.0.90.24:9200/  --会显示如下：
{
  "name" : "node-1",
  "cluster_name" : "es_cluster",
  "version" : {
    "number" : "2.2.0",
    "build_hash" : "8ff36d139e16f8720f2947ef62c8167a888992fe",
    "build_timestamp" : "2016-01-27T13:32:39Z",
    "build_snapshot" : false,
    "lucene_version" : "5.4.1"
  },
  "tagline" : "You Know, for Search"
}
```

返回的信息展示了配置的cluster_name和name，以及安装的ES的版本等信息。

至于之前安装的head插件，它是一个用浏览器跟ES集群交互的插件，可以查看集群状态、集群的doc内容、执行搜索和普通的Rest请求等。可以如下地址 http://ip:9200/_plugin/head 查看ES集群状态：

![](http://7xvfir.com1.z0.glb.clouddn.com/ELK%E5%AE%89%E8%A3%85%E4%B8%8E%E9%85%8D%E7%BD%AE/1.jpg)

---

### 安装Logstash
安装
```bash
#tar xf kibana-4.4.0-linux-x64.tar.gz -C /usr/local/

#cd /usr/local/
#mv  kibana-4.4.0-linux-x64/ kibana
```

为kibana提供SysV形式的启动脚本
```bash
vim /etc/init.d/kibana

#!/bin/bash
### BEGIN INIT INFO
# Provides:          kibana
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: Runs kibana daemon
# Description: Runs the kibana daemon as a non-root user
### END INIT INFO
# Process name
NAME=kibana
DESC="Kibana4"
PROG="/etc/init.d/kibana"
# Configure location of Kibana bin
KIBANA_BIN=/usr/local/kibana/bin
# PID Info
PID_FOLDER=/var/run/kibana/
PID_FILE=/var/run/kibana/$NAME.pid
LOCK_FILE=/var/lock/subsys/$NAME
PATH=/bin:/usr/bin:/sbin:/usr/sbin:$KIBANA_BIN
DAEMON=$KIBANA_BIN/$NAME
# Configure User to run daemon process
DAEMON_USER=root
# Configure logging location
KIBANA_LOG=/var/log/kibana.log
# Begin Script
RETVAL=0

if [ `id -u` -ne 0 ]; then
        echo "You need root privileges to run this script"
        exit 1
fi

# Function library
. /etc/init.d/functions

start() {
        echo -n "Starting $DESC : "

pid=`pidofproc -p $PID_FILE kibana`
        if [ -n "$pid" ] ; then
                echo "Already running."
                exit 0
        else
        # Start Daemon
if [ ! -d "$PID_FOLDER" ] ; then
                        mkdir $PID_FOLDER
                fi
daemon --user=$DAEMON_USER --pidfile=$PID_FILE $DAEMON 1>"$KIBANA_LOG" 2>&1 &
                sleep 2
                pidofproc node > $PID_FILE
                RETVAL=$?
                [[ $? -eq 0 ]] && success || failure
echo
                [ $RETVAL = 0 ] && touch $LOCK_FILE
                return $RETVAL
        fi
}

reload()
{
    echo "Reload command is not implemented for this service."
    return $RETVAL
}

stop() {
        echo -n "Stopping $DESC : "
        killproc -p $PID_FILE $DAEMON
        RETVAL=$?
echo
        [ $RETVAL = 0 ] && rm -f $PID_FILE $LOCK_FILE
}

case "$1" in
  start)
        start
;;
  stop)
        stop
        ;;
  status)
        status -p $PID_FILE $DAEMON
        RETVAL=$?
        ;;
  restart)
        stop
        start
        ;;
  reload)
reload
;;
  *)
# Invalid Arguments, print the following message.
        echo "Usage: $0 {start|stop|status|restart}" >&2
exit 2
        ;;
esac
```

```bash
添加执行权限
#chmod +x /etc/init.d/kibana
```

```bash
启动kibana
#service kibana start
Starting Kibana4 : [  OK  ]

查看是否启动成功，如下表示启动成功
#netstat -tunlp
Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address               Foreign Address             State       PID/Program name   
tcp        0      0 0.0.0.0:22                  0.0.0.0:*                   LISTEN      950/sshd            
tcp        0      0 127.0.0.1:25                0.0.0.0:*                   LISTEN      1027/master         
tcp        0      0 0.0.0.0:5601                0.0.0.0:*                   LISTEN      2909/node   --kibana端口         
tcp        0      0 ::ffff:10.0.90.24:9300      :::*                        LISTEN      2428/java           
tcp        0      0 :::22                       :::*                        LISTEN      950/sshd            
tcp        0      0 ::1:25                      :::*                        LISTEN      1027/master         
tcp        0      0 ::ffff:10.0.90.24:9200      :::*                        LISTEN      2428/java           

设置开机自启动
#chkconfig --add kibana
#chkconfig kibana on 
```

---

### 安装Kibana

Kibana一个收集器，我们需要为它指定Input和Output（Input和Output可以为多个）。

```bash
#tar xf logstash-2.2.0.tar.gz -C /usr/local/
#cd /usr/local/
#mv logstash-2.2.0 logstash
```

测试logstash，你会发现输入什么内容，logstash按照某种格式输出什么内容
```bash
#/usr/local/logstash/bin/logstash -e 'input { stdin{} } output { stdout {} }' 

Settings: Default pipeline workers: 2
Logstash startup completed
hello world   ---输入的内容
2016-04-01T09:05:35.818Z elk hello world
```

注：其中-e参数允许Logstash直接通过命令行接受设置。这点尤其快速的帮助我们反复的测试配置是否正确而不用写配置文件。使用CTRL-C命令可以退出之前运行的Logstash。

使用-e参数在命令行中指定配置是很常用的方式，不过如果需要配置更多设置则需要很长的内容。这种情况，我们首先创建一个简单的配置文件，并且指定logstash使用这个配置文件。

注：logstash 配置文件的例子：https://www.elastic.co/guide/en/logstash/current/configuration-file-structure.html
logstash配置文件是以json格式设置参数的配置文件位于/etc/logstash/conf.d目录（rpm安装的路径）下配置包括三个部分输入端、过滤器和输出。

格式如下：
```bash
# This is a comment. You should use comments to describe
# parts of your configuration.
input {
  ...
}

filter {
  ...
}

output {
  ...
}
```

插件配置格式：
```bash
input {
  file {
    path => "/var/log/messages"
    type => "syslog"
  }

  file {
    path => "/var/log/apache/access.log"
    type => "apache"
  }
}
```

首先创建一个简单的例子
```bash
#cd /usr/local/logstash/config

#cat logstash-simple.conf 
input { stdin { } }
output {
   stdout { codec => rubydebug }
}
```

先输出一些内容，例如当前时间：
```bash
#echo "`date` hello world"
Fri Apr  1 17:07:17 CST 2016 hello world
```

执行
```bash
#/usr/local/logstash/bin/logstash agent -f logstash-simple.conf
Settings: Default pipeline workers: 2
Logstash startup completed
```


```bash
# 将刚才生成的时间信息粘贴到这里，回车，就会看到如下信息：
Fri Apr  1 17:07:17 CST 2016 hello world
{
       "message" => "Tue Jul 14 18:07:07 EDT 2015 hello World",
      "@version" => "1",
    "@timestamp" => "2016-04-01T09:08:19.809Z",
          "host" => "elk"
}
```

接下来在logstash的安装目录创建一个用于测试logstash使用elasticsearch作为logstash的后端输出的测试文件
logstash-es-test.conf该文件中定义了stdout和elasticsearch作为output，这样的“多重输出”即保证输出结果显示到屏幕上，同时也输出到elastisearch中。如下：
```bash
#cat logstash-es-test.conf 
input { stdin { } }
output {
   elasticsearch {hosts => "10.0.90.24" }
   stdout { codec=> rubydebug }
}
```

测试配置文件是否正确
```bash
/usr/local/logstash/bin/logstash --configtest -f logstash-es-test.conf 
Configuration OK
```

如果文件比较多也可以这样：
```bash
/usr/local/logstash/bin/logstash --configtest -f config/*.conf
```

执行：
```bash
/usr/local/logstash/bin/logstash agent -f logstash-es-test.conf 
Settings: Default pipeline workers: 2
Logstash startup completed
```

```bash
# 输入以下内容，回车
hello logstash
{
       "message" => "hello logstash",
      "@version" => "1",
    "@timestamp" => "2016-04-01T09:18:26.967Z",
          "host" => "elk"
}
```
Ctrl+c 结束执行！

我们可以使用curl命令发送请求来查看ES是否接收到了数据：
```bash
#curl 'http://10.0.90.24:9200/_search?pretty'
{
  "took" : 4,
  "timed_out" : false,
  "_shards" : {
    "total" : 6,
    "successful" : 6,
    "failed" : 0
  },
  "hits" : {
    "total" : 5,
    "max_score" : 1.0,
    "hits" : [ {
      "_index" : ".kibana",
      "_type" : "config",
      "_id" : "4.4.0",
      "_score" : 1.0,
      "_source" : {
        "buildNum" : 9689
      }
    }, {
      "_index" : "logstash-2016.04.01",
      "_type" : "logs",
      "_id" : "AVPRHddUspScKx_yDLKx",
      "_score" : 1.0,
      "_source" : {
        "message" : "hello logstash",
        "@version" : "1",
        "@timestamp" : "2016-04-01T09:18:26.967Z",
        "host" : "elk"
      }
      }]
    }
}
```
通过以上显示信息，可以看到ES已经收到了数据！说明可以通过Elasticsearch和Logstash来收集日志数据了。

---

### 修改kibana端口
```bash
#cd /usr/local/kibana/config

备份配置
#cp  kibana.yml kibana.yml_back

修改为如下：其他默认不变
server.port: 80           --修改端口为80，默认是5601
server.host: "10.0.90.24"
elasticsearch.url: "http://10.0.90.24:9200"    --ip为server的ip地址
kibana.defaultAppId: "discover"
elasticsearch.requestTimeout: 300000
elasticsearch.shardTimeout: 0

重启kibana
#service kibana restart
```

在浏览器访问kibana的地址 http://10.0.90.24 就可以看到kibana的页面了。

登录之后，首先配置一个索引，默认kibana的数据被指向Elasticsearch，使用默认的logstash-*的索引名称，并且是基于时间（@timestamp）的，如下

![](http://7xvfir.com1.z0.glb.clouddn.com/ELK%E5%AE%89%E8%A3%85%E4%B8%8E%E9%85%8D%E7%BD%AE/2.jpg)

点击“Create”，如果能看到如下类似界面，说明索引创建完成。

![](http://7xvfir.com1.z0.glb.clouddn.com/ELK%E5%AE%89%E8%A3%85%E4%B8%8E%E9%85%8D%E7%BD%AE/3.jpg)
  
点击“Discover”，可以搜索和浏览Elasticsearch中的数据，默认搜索的是最近15分钟的数据，可以自定义选择时间。
到此，说明你的ELK平台安装部署完成。