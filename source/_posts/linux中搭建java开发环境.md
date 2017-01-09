---
title: linux中搭建java开发环境
categories:
  - 运维部署
tags:
  - jdk
date: 2016-5-29 22:10:00
toc: false

---

### JDK安装
http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html
下载对应jdk版本，比如 jdk-7u80-linux-x64.tar.gz。

```bash
# 执行下面命令安装JDK
mkdir -p /opt/java
tar -xvf jdk-7u80-linux-x64.tar.gz -C /opt/java

# 创建一个链接
ln -s /opt/java/jdk1.7.0_80 /opt/java/jdk 

# 设置环境变量
vi /etc/frofile   

export JAVA_HOME=/opt/java/jdk
exprot PATH=$JAVA_HOME/bin:$PATH
export CLASSPATH=.:$JAVA_HOME/jre/lib/rt.jar:$JAVA_HOME/lib/dt.jar:$JAVA_HOME/lib/tools.jar

# 使配置文件生效
source /etc/profile
```

执行java -version命令，测试一下是否安装成功。

---

### Tomcat安装
```bash
# 解压
mkdir -p /opt/tomcat
tar -xvf apache-tomcat-6.0.10.tar.gz -C /opt/tomcat/

# 创建一个链接
ln -s /opt/tomcat/apache-tomcat-6.0.10 /opt/tomcat/tomcat6.0

cd /opt/tomcat/tomcat6.0/bin

./startup.sh
```
再打开浏览器测试一下，输入http:localhost:8080，猫的页面出来，说明安装成功了。

---

### 自动化部署脚本
JDK：https://github.com/Wasim37/deployment-scripts/tree/master/java
Tomcat：https://github.com/Wasim37/deployment-scripts/tree/master/tomcat
