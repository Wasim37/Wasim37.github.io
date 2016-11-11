---
title: zabbix邮件报警
categories:
  - 算法
date: 2016-11-1 18:53:00
---

### 示警媒介
一般情况下，zabbix监控主机都配置了触发器，触发器被触发发送消息给运维，需要中间介质来接收并传递消息。

zabbix默认的【示警媒介类型】有三种，Email、Jabber、SMS。
（1）Email：使用sendmail发送邮件，从这边出去的邮件基本是垃圾邮件。
（2）SMS：需要短信设备，没有，所以没用过这东西
（3）Jabber:Jabber有第三方插件，能让Jabber用户和MSN、YahooMessager、ICQ等IM用户相互通讯。因为Google遵从Jabber协议，并且Google已经将Gtalk的服务器开放给了其它的Jabber服务器。所以PSI、Giam等Jabber客户端软件支持GTalk用户登陆。国内没啥人用。

sendEmail是一个轻量级，命令行的SMTP邮件客户端。如果需要使用命令行发送邮件，那么sendEmail是不错的选择。sendEmail使用简单并且功能强大。这个被设计用在php、perl和web站点使用。**请注意，不是sendmail。**

---

### sendEmail安装
```bash
# 下载软件
wget http://caspian.dotconf.net/menu/Software/SendEmail/sendEmail-v1.56.tar.gz
# 解压软件
# tar zxvf sendEmail-v1.56.tar.gz
# 进入目录
cd /usr/src/sendEmail-v1.56
# 创建目录
mkdir /usr/local/bin
# 复制文件，并设置权限
cp -a sendEmail /usr/local/bin
chmod +x /usr/local/bin/sendEmail
# 安装组件
yum install perl-Net-SSLeay perl-IO-Socket-SSL -y
```

<!-- more -->

---

### zabbix server端配置
进入zabbix自定义的指定目录
可以查看zabbix_server.conf配置文件AlertScriptsPath变量是如何定义的。

进入相关目录
cd /usr/lib/zabbix/alertscripts

新建sendEmail.sh脚本，内容如下
```bash
#!/bin/bash

to=$1
subject=$2
body=$3
/usr/local/bin/sendEmail  -f a@domain.com -t "$to" -s smtp.exmail.qq.com -u "$subject" -o message-content-type=html -o message-charset=utf8 -xu a@domain.com -xp password -m "$body"
```

> a@domain.com 表示发件人邮箱
smtp.exmail.qq.com 表示邮箱的smtp服务器，这里用的是腾讯邮箱。
password 表示发件人邮箱密码

编辑完成后，给脚本权限
```bash
chmod +x sendEmail.sh
chown zabbix.zabbix sendEmail.sh
```
手动执行一次脚本，后面的参数分别对应接收人，主题，内容
```bash
./sendEmail.sh c@domain.com test 123
```
登录c@domain.com的账户，查看邮件是否可以收到
如果脚本执行没有报错，收不到邮件的话，请检查linux网络问题,iptables、selinux是否关闭。

---

### zabbix web端配置
进入zabbix管理页面
点击管理->报警媒介类型 点击最右边的创建媒体类型

![](1.png)
输入脚本名称，类型选择脚本
添加以下3个参数，分别对应sendEmail.sh脚本需要的3个参数：收件人地址、主题、详细内容
{ALERT.SENDTO}
{ALERT.SUBJECT}
{ALERT.MESSAGE}

![](2.png)
解释:很多人安装zabbix 3.0之后，写的脚本一直发信不成功,手动执行时可以的。
那是因为zabbix3.0之后，可以自定义参数了。所以不写参数，它是不会传参数的。
在2.x版本不存在这个问题，默认会传3个参数。

点击Admin用户

![](3.png)
点击添加

![](4.png)
选择sendEmail.sh脚本，输入收件人的邮箱地址

![](5.png)
点击用户群组，点击zabbix administrator后面的调用模式，点击一下，就启用了

![](6.png)
点权限->添加

![](7.png)

选择所有

![](8.png)
点击更新

![](9.png)
点击配置->动作 点击默认的动作

![](10.png)
点击操作->编辑

![](11.png)
修改持续时间为60秒
修改步骤为3,表示触发3次动作
选择用户Admin
选择仅送到sendEmail.sh
点击更新

![](12.png)
点击更新

![](13.png)
解释:默认的步骤是1-1,也即是从1开始到1结束。一旦故障发生，就是执行sendEmail.sh脚本发生报警邮件给Admin用户和zabbix administrator组。
假如故障持续了1个小时，它也只发送一次。如果改成1-0，0是表示不限制.无限发送
间隔就是默认持续时间60秒。那么一个小时，就会发送60封邮件。
如果需要短信报警的话,可以再创建一条新的动作，选择短信脚本。

下面开始测试邮件报警
先添加一台主机test，不存在的IP地址
等待几分钟，可以看到是红色状态

![](14.png)
等待几分钟，就会收到邮件报警了

![](15.png)
点击报表->动作日志 可以看到触发动作的次数。只会有3次，除非test主机状态改变，也就是正常的时候，会触发一次,否则不会再触发。

![](16.png)
大家可以看到邮件里面内容都堆到一起了，没有换行，且是英文，可以自行修改【组态-动作-动作】里的配置。

下面是我修改后的配置信息:
```bash
====================================================

# 默认接收人:

故障{TRIGGER.STATUS}，服务器【{HOST.NAME1}】发生【 {TRIGGER.NAME}】故障！

====================================================

# 默认信息:

告警主机:{HOST.NAME1}<br/>

告警时间:{EVENT.DATE} {EVENT.TIME}<br/>

告警等级:{TRIGGER.SEVERITY}<br/>

告警信息: {TRIGGER.NAME}<br/>

告警项目:{TRIGGER.KEY1}<br/>

问题详情:{ITEM.NAME}:{ITEM.VALUE}<br/>

当前状态:{TRIGGER.STATUS}:{ITEM.VALUE1}<br/>

事件ID:{EVENT.ID}<br/>

====================================================

# 恢复主旨:

恢复{TRIGGER.STATUS}，服务器【{HOST.NAME1}】故障【 {TRIGGER.NAME}】已恢复！

====================================================

# 恢复信息:

告警主机:{HOST.NAME1}<br/>

告警时间:{EVENT.DATE} {EVENT.TIME}<br/>

告警等级:{TRIGGER.SEVERITY}<br/>

告警信息: {TRIGGER.NAME}<br/>

告警项目:{TRIGGER.KEY1}<br/>

问题详情:{ITEM.NAME}:{ITEM.VALUE}<br/>

当前状态:{TRIGGER.STATUS}:{ITEM.VALUE1}<br/>

事件ID:{EVENT.ID}<br/>
```

