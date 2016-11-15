---
title: zabbix agent安装详解
categories:
  - 运维部署
tags:
  - zabbix
date: 2016-9-25 18:24:17
toc: false
---

## 安装
### Installing repository configuration package

Zabbix 2.2 for RHEL5, Oracle Linux 5, CentOS 5:

```bash
rpm -ivh http://repo.zabbix.com/zabbix/2.2/rhel/5/x86_64/zabbix-release-2.2-1.el5.noarch.rpm
```

Zabbix 2.2 for RHEL6, Oracle Linux 6, CentOS 6:
```bash
rpm -ivh http://repo.zabbix.com/zabbix/2.2/rhel/6/x86_64/zabbix-release-2.2-1.el6.noarch.rpm
```

Zabbix 2.2 for RHEL7, Oracle Linux 7, CentOS 7:
```bash		
rpm -ivh http://repo.zabbix.com/zabbix/2.2/rhel/7/x86_64/zabbix-release-2.2-1.el7.noarch.rpm
```

<!-- more -->

### Installing Zabbix packages

Example for installing Zabbix agent only.
```bash
yum install zabbix-agent
```

<br/>

---

## 配置文件修改

查找配置文件地址，并事先做好相关备份
```bash
find / -name '*zabbix_agentd.conf*'
# /etc/zabbix/zabbix_agentd.conf
cp /etc/zabbix/zabbix_agentd.conf /etc/zabbix/zabbix_agentd.conf.bak
```

修改相关具体项
```bash
# vim /etc/zabbix/zabbix_agentd.conf

EnableRemoteCommands=1  来至zabbix服务器的远程命令是否允许被执行
Server=zabbix_server_IP  zabbix服务器ip地址
ServerActive=zabbix_server_IP  主动向zabbix server发送监控内容
Hostname=name  name配置的内容要和zabbix服务器配置的Host name一致
UnsafeUserParameters=1  是否启用自定义key,zabbix监控mysql、tomcat等数据时需要自定义key
```

开机自启动
```bash
chkconfig zabbix-agent on
chkconfig --list|grep zabbix-agent
```

启动客户端
```bash
service zabbix-agent start
```

<br/>

---

## 服务器添加被监控主机
登陆 http://zabbix_server_ip/zabbix, 点击 【组态】->【主机】->【创建主机】

![](http://7xvfir.com1.z0.glb.clouddn.com/zabbix%20agent%E5%AE%89%E8%A3%85%E8%AF%A6%E8%A7%A3/1.png)

配置主机名称【host name】、群组、被监控主机ip

![](http://7xvfir.com1.z0.glb.clouddn.com/zabbix%20agent%E5%AE%89%E8%A3%85%E8%AF%A6%E8%A7%A3/2.png)

添加监控模板并保存

![](http://7xvfir.com1.z0.glb.clouddn.com/zabbix%20agent%E5%AE%89%E8%A3%85%E8%AF%A6%E8%A7%A3/3.png)

回到被监控的主机列表，点击【项目】

![](http://7xvfir.com1.z0.glb.clouddn.com/zabbix%20agent%E5%AE%89%E8%A3%85%E8%AF%A6%E8%A7%A3/4.png)

查看刚才添加的模板所对应的监控项是否生效，绿色代表成功。

![](http://7xvfir.com1.z0.glb.clouddn.com/zabbix%20agent%E5%AE%89%E8%A3%85%E8%AF%A6%E8%A7%A3/5.png)

也可以在主机列表点击【图形】, 进入某个具体监控项后，再点击【预览】，查看相关监控图像。

![](http://7xvfir.com1.z0.glb.clouddn.com/zabbix%20agent%E5%AE%89%E8%A3%85%E8%AF%A6%E8%A7%A3/6.png)

<br/>



