---
title: Not supported by Zabbix Agent & zabbix agent重装
categories:
  - 部署配置
tags:
  - zabbix
date: 2016-9-25 18:24:17
---

> zabbix服务器显示一些监控项不起效，提示错误【Not supported by Zabbix Agent】，
最后定位为zabbix客户端版本过低。

### Not supported by Zabbix Agent

两台被监控的服务器，配置文件设置都一样，但是其中一台某些监控项失效，初步怀疑是版本不一致
```bash
/usr/sbin/zabbix_agentd -V
```

<!-- more -->

结果显示zabbix agent版本分别为【2.2.14】和【1.8.22】，不起效的为1.8.22。
以下是两个版本的安装过程：
```bash
#2.2.14安装步骤【参照官网】
rpm -ivh http://repo.zabbix.com/zabbix/2.2/rhel/6/x86_64/zabbix-release-2.2-1.el6.noarch.rpm
yum install zabbix-agent

#1.8.22安装步骤【相对官网，明显少了个步骤】
yum install zabbix-agent
```


**yum install zabbix-agent为什么默认安装的是1.8.22？**
通过如下命令可以查看
```bash
yum list all | grep zabbix-agent
# pcp-export-zabbix-agent.x86_64             3.10.9-6.el6                 base    
# zabbix-agent.x86_64                        1.8.22-1.el6                 epel
```

<br/>

---

### zabbix agent重装
```bash
# 卸载
yum remove zabbix-agent

# 安装
rpm -ivh http://repo.zabbix.com/zabbix/2.2/rhel/6/x86_64/zabbix-release-2.2-1.el6.noarch.rpm
yum install zabbix-agent

# 启动及查看
service zabbix-agent restart
service zabbix-agent status
# zabbix_agentd (pid  32485) is running...

/usr/sbin/zabbix_agentd -V
# Zabbix Agent (daemon) v2.2.14 (revision 61184) (22 July 2016)
# Compilation time: Jul 24 2016 06:52:24

```

