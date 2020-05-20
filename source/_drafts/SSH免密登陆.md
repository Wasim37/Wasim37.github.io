---
title: SSH免密登陆
categories:
  - 运维部署
tags:
  - 安全
date: 2017-1-2 22:10:00
toc: false

---

### 免密登录流程

![免密登陆流程图](http://7xvfir.com1.z0.glb.clouddn.com/SSH%E5%85%8D%E5%AF%86%E7%99%BB%E9%99%86/1.png?imageView2/0/q/75|watermark/1/image/aHR0cDovLzd4dmZpci5jb20xLnowLmdsYi5jbG91ZGRuLmNvbS8lRTYlQjAlQjQlRTUlOEQlQjAvJUU1JThEJTlBJUU1JUFFJUEyJUU2JUIwJUI0JUU1JThEJUIwLnBuZw==/dissolve/100/gravity/SouthEast/dx/10/dy/10|imageslim)

<!-- more -->

---

### 免密登陆配置
1、以root用户登录系统，新建用户username，并指定用户登录的起始目录
```bash
adduser -d /home/username -m username

# adduser命令详解
-c：加上备注文字，备注文字保存在passwd的备注栏中。 
-d：指定用户登入时的启始目录。
-D：变更预设值。
-e：指定账号的有效期限，缺省表示永久有效。
-f：指定在密码过期后多少天即关闭该账号。
-g：指定用户所属的起始群组。
-G：指定用户所属的附加群组。
-m：自动建立用户的登入目录。
-M：不要自动建立用户的登入目录。
-n：取消建立以用户名称为名的群组。
-r：建立系统账号。
-s：指定用户登入后所使用的shell。
-u：指定用户ID号
```

2、为用户设置密码
```bash
passwd username
old password:******
new password:*******
Re-enter new password:*******
```

3、从root用户切换为username用户，然后进入刚才创建的初始目录，创建.ssh文件夹
```bash
su username

cd /home/username
mkdir .ssh
cd .ssh
```

4、生成秘钥，如有提示可以一路回车
```bash
ssh-keygen -t  rsa
```
如果成功，会在/home/username/.ssh/目录下生成名为id_rsa和id_rsa.pub的一对公钥私钥
注意：以上命令需切换为username用户执行，否则秘钥文件会自动生成在/root/.ssh/目录下

5、将公钥文件的内容copy至authorized_keys文件，然后修改相关权限
```bash
cat id_rsa.pub >> authorized_keys

chmod 600 authorized_keys
chown username:username /home/username/.ssh/
```

6、为用户赋予root权限
```bash
vim /etc/sudoers
## Allow root to run any commands anywhere
root    ALL=(ALL)     ALL
username    ALL=(ALL)     ALL
```

7、设置每个用户登录时读取自己的免密配置文件，并取消服务器密码登录，开启免密验证
```bash
vim /etc/ssh/sshd_config

RSAAuthentication yes
PubkeyAuthentication yes
AuthorizedKeysFile      %h/.ssh/authorized_keys

PasswordAuthentication no
PermitRootLogin yes
RSAAuthentication yes
PubkeyAuthentication yes
```

8、重启sshd服务，使配置生效
```bash
/etc/init.d/sshd restart
```

将/home/username/.ssh/下的私钥文件id_rsa发给相应用户，该用户即可使用私钥文件免密登录了。

本文为了省事，公钥私钥是自己在服务器上生成的，其实也可以用户自己执行命令生成公钥私钥，然后把公钥传至服务器/home/username/.ssh/下，并重命名为authorized_keys。





