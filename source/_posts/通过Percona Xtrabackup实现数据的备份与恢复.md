---
title: 通过Percona Xtrabackup实现数据的备份与恢复
tags:
  - mysql
  - 完全备份
  - 增量备份
  - Percona Xtrabackup
categories:
  - 数据库
date: 2017-1-20 22:22:00
toc: true
---

### Xtrabackup简介
Percona XtraBackup是一个开源、免费的MySQL热备份软件,能够为InnoDB和XtraDB数据库执行非阻塞备份，特点如下：

1、快速、可靠的完成备份
2、备份期间不间断事务处理
3、节省磁盘空间和网络带宽
4、自动对备份文件进行验证
5、恢复快，保障在线运行时间持久性

另外，官网关于Xtrabackup还有如下介绍，它能增量备份MySQL数据库，通过流压缩备份MySQL数据到另外一台服务器，在线MySQL服务器之间进行表空间迁移，很easy的创建新的MySQL从服务器，并且备份MySQL数据库时不会带来额外的系统压力。

**XtraBackup 有两个工具：xtrabackup 和 innobackupex：**
xtrabackup 本身只能备份 InnoDB 和 XtraDB ，不能备份 MyISAM；
innobackupex 本身是 Hot Backup 脚本修改而来，同时可以备份 MyISAM 和 InnoDB，但是备份 MyISAM 需要加读锁。

<!-- more -->

**为什么说Xtrabackup是针对InnoDB引擎的备份工具？**
对于MyISAM表只能是温备，而且也不支持增量备份。而XtraBackup更多高级特性通常只能在innodb存储引擎上实现，而且高级特性还都依赖于mysql数据库对innodb引擎实现了单独表空间，否则没办法实现单表或单库导出，因此可以说Xtrabackup是为InnoDB而生也不为过！

官网软件下载：https://www.percona.com/downloads/XtraBackup/LATEST/
用户操作手册：http://www.percona.com/doc/percona-xtrabackup/2.4/index.html

---

### Xtrabackup备份原理

**1、InnoDB的备份原理**
在InnoDB内部会维护一个redo日志文件，我们也可以叫做事务日志文件。事务日志会存储每一个InnoDB表数据的记录修改。当InnoDB启动时，InnoDB会检查数据文件和事务日志，并执行两个步骤：它应用（前滚）已经提交的事务日志到数据文件，并将修改过但没有提交的数据进行回滚操作。

- 备份过程
Xtrabackup在启动时会记住log sequence number（LSN），并且复制所有的数据文件。复制过程需要一些时间，所以这期间如果数据文件有改动，那么将会使数据库处于一个不同的时间点。这时，xtrabackup会运行一个后台进程，用于监视事务日志，并从事务日志复制最新的修改。Xtrabackup必须持续的做这个操作，是因为事务日志是会轮转重复的写入，并且事务日志可以被重用。所以xtrabackup自启动开始，就不停的将事务日志中每个数据文件的修改都记录下来。

- 准备过程
上面就是xtrabackup的备份过程。接下来是准备（prepare）过程。在这个过程中，xtrabackup使用之前复制的事务日志，对各个数据文件执行灾难恢复（就像mysql刚启动时要做的一样）。当这个过程结束后，数据库就可以做恢复还原了。

**2、MyISAM的备份原理**
以上的过程在xtrabackup的编译二进制程序中实现。程序innobackupex可以允许我们备份MyISAM表和frm文件从而增加了便捷和功能。Innobackupex会启动xtrabackup，直到xtrabackup复制数据文件后，然后执行FLUSH TABLES WITH READ LOCK来阻止新的写入进来并把MyISAM表数据刷到硬盘上，之后复制MyISAM数据文件，最后释放锁。

备份MyISAM和InnoDB表最终会处于一致，在准备（prepare）过程结束后，InnoDB表数据已经前滚到整个备份结束的点，而不是回滚到xtrabackup刚开始时的点。这个时间点与执行FLUSH TABLES WITH READ LOCK的时间点相同，所以myisam表数据与InnoDB表数据是同步的。类似oracle的，InnoDB的prepare过程可以称为recover（恢复），myisam的数据复制过程可以称为restore（还原）。

Xtrabackup和innobackupex这两个工具都提供了许多前文没有提到的功能特点。手册上有对各个功能都有详细的介绍。简单介绍下，这些工具提供了如流（streaming）备份，增量（incremental）备份等，通过复制数据文件，复制日志文件和提交日志到数据文件（前滚）实现了各种复合备份方式。

**什么是流备份？**
流备份是指备份的数据通过标准输出STDOUT传输给tar程序进行归档，而不是单纯的将数据文件保存到指定的备份目录中，参数--stream=tar表示开启流备份功能并打包。同时也可以利用流备份到远程服务器上。

---

### Xtrabackup实现细节
XtraBackup以read-write模式打开innodb的数据文件，然后对其进行复制。其实它不会修改此文件。也就是说，运行 XtraBackup的用户，必须对innodb的数据文件具有读写权限。之所以采用read-write模式是因为XtraBackup采用了其内置的 innodb库来打开文件，而innodb库打开文件的时候就是rw的。

XtraBackup要从文件系统中复制大量的数据，所以它尽可能地使用posix_fadvise()，来告诉OS不要缓存读取到的数据，从 而提升性能。因为这些数据不会重用到了，OS却没有这么聪明。如果要缓存一下的话，几个G的数据，会对OS的虚拟内存造成很大的压力，其它进程，比如 mysqld很有可能被swap出去，这样系统就会受到很大影响了。

在备份innodb page的过程中，XtraBackup每次读写1MB的数据，1MB/16KB=64个page。这个不可配置。读1MB数据之 后，XtraBackup一页一页地遍历这1MB数据，使用innodb的buf_page_is_corrupted()函数检查此页的数据是否正常，如果数据不正常，就重新读取这一页，最多重新读取10次，如果还是失败，备份就失败了，退出。在复制transactions log的时候，每次读写512KB的数据。同样不可以配置。

---

### Xtrabackup安装与卸载
在官网中，复制相关链接下载最新版本
https://www.percona.com/downloads/XtraBackup/LATEST/

```bash
# 安装
cd /data/install_packages
wget https://www.percona.com/downloads/XtraBackup/Percona-XtraBackup-2.4.5/binary/redhat/6/x86_64/percona-xtrabackup-24-2.4.5-1.el6.x86_64.rpm
yum install percona-xtrabackup-24-2.4.5-1.el6.x86_64.rpm

# 如果提示缺失依赖包
# yum -y install perl perl-devel libaio libaio-devel perl-Time-HiRes perl-DBD-MySQL
```

```bash
# 如果版本错误，查看已安装的percona版本
yum list installed |grep percona
percona-xtrabackup-24.x86_64    2.4.5-1.el6    @/percona-xtrabackup-24-2.4.5-1.el6.x86_64

# 卸载
yum remove percona-xtrabackup-24.x86_64
```

---

### Xtrabackup常用参数
```bash
常用参数：
--user=USER                     指定备份用户，不指定的话为当前系统用户
--password=PASSWD               指定备份用户密码
--port=PORT                     指定数据库端口
--defaults-group=GROUP-NAME     在多实例的时候使用
--host=HOST                     指定备份的主机，可以为远程数据库服务器
--apply-log                     回滚日志
--database                      指定需要备份的数据库，多个数据库之间以空格分开
--defaults-file                 指定mysql的配置文件
--copy-back                     将备份数据复制回原始位置
--incremental                   增量备份，后面跟要增量备份的路径
--incremental-basedir=DIRECTORY 增量备份时使用指向上一次的增量备份所在的目录
--incremental-dir=DIRECTORY     增量备份还原的时候用来合并增量备份到全量，用来指定全备路径
--redo-only                     对增量备份进行合并
--rsync                         加快本地文件传输，适用于non-InnoDB数据库引擎。不与--stream共用
--safe-slave-backup
--no-timestamp                  生成的备份文件不以时间戳为目录.
```

---

### 完全备份与恢复

完全备份目录：/data/backup/full
**完全备份与增量备份每次命令操作成功的标志是，日志结尾处打印【completed OK!】**

```bash
# 全量备份
innobackupex --user=root --password=passwd /data/backup/full

# 上个命令在我的 /data/backup/full/ 目录生成了一个文件夹【2017-01-20_10-52-43】
# 一般情况下，这个备份不能用于恢复，因为备份的数据中可能会包含尚未提交的事务或已经提交但尚未同步至数据文件中的事务，此时数据文件处于不一致的状态
# 因此，我们现在就是要通过回滚未提交的事务及同步已经提交的事务至数据文件也使得数据文件处于一致性状态。
innobackupex --user=root --password --defaults-file=/data/mysql/my.cnf --apply-log /data/backup/full/2017-01-20_10-52-43

# 恢复操作演练
# 关掉服务，迁移已有的数据目录
service mysql stop
mv /data/mysql/data /data/mysql/data_old
mkdir -p /data/mysql/data
# 执行innobackupex恢复命令
innobackupex --defaults-file=/data/mysql/my.cnf --user=root --password=passwd --copy-back /data/backup/full/2017-01-20_10-52-43
# 对新目录执行赋权操作，此操作需在innobackupex恢复命令后
chown -R mysql.mysql /data/mysql/data
# 重启服务，并检查数据是否恢复
service mysqld start

```
---

### 增量备份与恢复

增量备份目录1：/data/backup/inc1
增量备份目录2：/data/backup/inc2

```bash
# 全量备份
innobackupex  --defaults-file=/data/mysql/my.cnf  --user=root --password=passwd /data/backup/full

# 第一次增量备份
innobackupex  --defaults-file=/data/mysql/my.cnf  --user=root --password=passwd --incremental /data/backup/inc1  --incremental-basedir=/data/backup/full/2017-01-20_10-52-43

# --incremental-basedir指的是完全备份所在的目录
# 此命令执行结束后，innobackupex命令会在/data/backup目录中创建一个新的以时间命名的目录以存放所有的增量备份数据。
# 另外，在执行过增量备份之后再一次进行增量备份时，其--incremental-basedir应该指向上一次的增量备份所在的目录。
# 需要注意的是，增量备份仅能应用于InnoDB或XtraDB表，对于MyISAM表而言，执行增量备份时其实进行的是完全备份。

# 第二次增量备份
innobackupex  --defaults-file=/data/mysql/my.cnf  --user=root --password=passwd --incremental /data/backup/inc2  --incremental-basedir=/data/backup/inc1/2017-01-20_11-04-31

# 如果需要恢复的话需要先执行如下操作
innobackupex --apply-log --redo-only /data/backup/full/2017-01-20_10-52-43
innobackupex --apply-log --redo-only /data/backup/full/2017-01-20_10-52-43 --incremental-dir=/data/backup/inc1/2017-01-20_11-04-31

# 如果存在多次增量备份的话，就多次执行如下命令。此处执行针对的是第二次增量备份
innobackupex --apply-log --redo-only /data/backup/full/2017-01-20_10-52-43 --incremental-dir=/data/backup/inc2/2017-01-20_11-06-41

# 恢复操作演练，需先停掉服务器并迁移已有的数据目录，详情见全量备份
# 执行恢复命令
innobackupex --defaults-file=/data/mysql/my.cnf --user=root --password=passwd --copy-back  /data/backup/full/2017-01-20_10-52-43
```

---

### 备份恢复常见错误
**Q：针对增量备份已经执行了增量恢复，再次执行相关恢复命令时，报如下错误**
```bash
xtrabackup: ########################################################
xtrabackup: # !!WARNING!!                                          #
xtrabackup: # The transaction log file is corrupted.               #
xtrabackup: # The log was not applied to the intended LSN!         #
xtrabackup: ########################################################
xtrabackup: The intended lsn is 1614986
xtrabackup: starting shutdown with innodb_fast_shutdown = 1
```
**A：**此错误是提示你日志已损坏，即上次的恢复命令已经对日志进行了回滚。所以每次对增量备份执行恢复时，可事先备份数据，以防万一。

**Q：对备份文件执行恢复命令时，报错如下：**
```bash
innobackupex: Connecting to MySQL server with DSN 'dbi:mysql:;mysql_read_default_group=xtrabackup' as 'root'  (using password: YES).
innobackupex: Error: Failed to connect to MySQL server: DBI connect(';mysql_read_default_group=xtrabackup','root',...) failed: Can't connect to local MySQL server through socket '/var/lib/mysql/mysql.sock' (2) at /usr/bin/innobackupex line 2995
```
**A：** 说明没有读取到my.cnf中的socket路径，也说明备份连接数据库时候走的是socket接口形式，我们可以换做走tcp/ip，执行命令中新增参数--host=127.0.0.1即可。如果仍然报错，检查相关命令是否有拼错的单词，检查datadir目录是否有【mysql:mysql】权限等。

**Q：xtrabackup Error: datadir must be specified.**
**A：**--defaults-file 对应的 my.cnf 文件没有指明datadir目录。如果指明了目录，执行相关命令仍然报错。把命令中的 --defaults-file 顺序从 --password后移至innobackupex后试试。innobackupex查找datadir不够智能。

---

### 备份方案的选择
常见的备份有全量备份、增量备份和差异备份。

首先需要弄明白增量备份和差异备份的区别:
**增量备份**：自从任意类型的上次备份后有所修改做的备份。
**差异备份**：自上次全备份后有所改变的部分而做的备份。

- **全量备份与差异备份结合**
以每周数据备份计划为例，我们可以在周一进行完全备份，在周二至周日进行差异备份。如果在周日数据被破坏了，则你只需要还原周一的全量备份和周六的差异备份。这种策略备份数据需要时间较多，但还原数据使用时间较少。

- **全量备份与增量备份结合**
以每周数据备份计划为例，我们可以在周一进行完全备份，在周二至周日进行增量备份。如果在周日数据被破坏了，则你需要还原周一的全量备份和从周二至周六的所有增量备份。这种策略备份数据需要时间较少，但还原数据使用时间较多。且周二至周六任何一个增量数据损坏，所有备份不可用。

- **全量备份、增量备份和差异备份结合**
以每周数据备份计划为例，我们可以在周一进行完全备份，在周二至周日进行差异备份，并且每天针对当天的差异备份每隔一段时间（比如半小时）进行增量备份。如果在周日某个时间点数据被破坏了，则你需要还原周一的全量备份和周六的差异备份，然后再还原周日所做的所有增量备份。这种策略操作最复杂，但是数据库最多损失半个小时的数据。

<font style="color:red"><blod>PS： 只做备份，不做恢复演练，可能最后一场空。</blod></font>

</br>