---
title: Percona Xtrabackup的安装及使用
tags:
  - mysql
categories:
  - 数据库
date: 2017-1-19 22:22:00
toc: false
---

### Xtrabackup的安装
在官网中，复制相关链接下载最新版本
https://www.percona.com/downloads/XtraBackup/LATEST/

```bash
cd /data/install_packages
wget https://www.percona.com/downloads/XtraBackup/Percona-XtraBackup-2.4.5/binary/redhat/6/x86_64/percona-xtrabackup-24-2.4.5-1.el6.x86_64.rpm
yum install percona-xtrabackup-24-2.4.5-1.el6.x86_64.rpm

# 如果提示缺失依赖包
# yum -y install perl perl-devel libaio libaio-devel perl-Time-HiRes perl-DBD-MySQL
```

待更新