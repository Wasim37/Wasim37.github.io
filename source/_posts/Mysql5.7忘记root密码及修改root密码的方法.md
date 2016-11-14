---
title: Mysql5.7忘记root密码及修改root密码的方法
categories:
  - 错误集锦
tags:
  - mysql
date: 2016-9-20 22:41:19
toc: false

---

Mysql 安装成功后，输入 mysql --version 显示版本如下
```bash
mysql  Ver 14.14 Distrib 5.7.13-6, for Linux (x86_64) using  6.0
```

用默认密码登录报如下错误：
```bash	
mysqladmin -uroot -p password 'newpassword'
Enter password:
mysqladmin: connect to server at 'localhost' failed
error: 'Access denied for user 'root'@'localhost' (using password: YES)'
```

解决方法：
```bash
/etc/init.d/mysql stop
mysqld_safe --user=mysql --skip-grant-tables --skip-networking &
mysql -u root mysql
mysql> use mysql
mysql> UPDATE user SET authentication_string=PASSWORD('newpassword') where USER='root';
mysql> FLUSH PRIVILEGES;
mysql> quit

/etc/init.d/mysql restart
mysql -uroot -p
Enter password: <输入新设的密码newpassword>
```

<!-- more -->

> 注意：mysql5.7版本mysql数据库user表的密码字段为authentication_string, 其他版本大部分为password，update语句相应为：
```bash
UPDATE user SET Password=PASSWORD('newpassword') where USER='root';
```

---

<br/>

用重置的密码终于登录成功，结果发现操作任何sql语句都报如下错误：
```bash
You must reset your password using ALTER USER statement before executing this statement.
```

** 错误显示在操作sql语句前必须重置密码，然后试了好几个重置密码的语句都重置失败，陷入了死循环。
这时发现错误提示修改密码需使用 <font style="color:red">Alter USER </font>语句，才找到了解决方法，可是又报密码过于简单的错误。**

```bash
mysql> alter user 'root'@'localhost' identified by '123'; 
ERROR 1819 (HY000): Your password does not satisfy the current policy requirements
```

这个错误其实与validate_password_policy有关，mysql5.6版本后，推出了validate_password插件，加强了密码强度。
可以使用 mysql> show variables like "%vali%" 命令查看validate_password_policy值：

Variable_name | Value
---|---
validate_password_dictionary_file | 
validate_password_length | 8
validate_password_mixed_case_count | 1
validate_password_number_count | 1
validate_password_policy | MEDIUM
validate_password_special_char_count | 1

**validate_password_policy有以下取值：**

Policy | Tests Performed
---|---
0 or LOW | 	Length
1 or MEDIUM | Length; numeric, lowercase/uppercase, and special characters
2 or STRONG | Length; numeric, lowercase/uppercase, and special characters; dictionary file

**默认是1，即MEDIUM，所以刚开始设置的密码必须符合长度，且必须含有数字，小写或大写字母，特殊字符。
所以用alter user语句重设一个复杂的密码，发现设置成功。**

> 如果不想密码设置过于复杂，只想设置root的密码为123456，需要修改默认规则
set global validate_password_policy=0;
set global validate_password_length=1;
select @@validate_password_length;
方法详见http://www.cnblogs.com/ivictor/p/5142809.html


最后授权root远程登录权限：
```bash
mysql> Grant all privileges on *.* to 'root'@'%' identified by 'newpassword' with grant option;
```
