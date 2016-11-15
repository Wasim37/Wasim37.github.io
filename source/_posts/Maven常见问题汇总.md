---
title: Maven常见问题汇总
tags:
  - Maven
categories:
  - 错误集锦
date: 2016-5-20 22:22:00
toc: false

---

_最近使用maven过程中，遇到一些问题，记录如下，方便日后查询所用_

**问题1：执行package命令报错,提示source-1.5不支持diamond运算符，建议换成1.7**
**原因：**编译版本出了问题，在pom.xml相应位置添加1.7或1.7以上的source和target即可
```bash
<plugins> 
  <plugin> 
    <groupId>org.apache.maven.plugins</groupId> 
	<artifactId>maven-compiler-plugin</artifactId> 
	<configuration> 
	  <source>1.7</source> 
	  <target>1.7</target> 
	</configuration> 
  </plugin> 
</plugins>
```

* * *

**问题2：执行package命令报错，提示编码GBK的不可映射字符**
**原因：**字符编码错误，在问题1的target代码下增加下面一行即可
```bash
<encoding>utf8</encoding>
```
<!-- more -->
* * *

**问题3：执行package命令报错，某个xml文件提示如下错误**
```bash
nested exception is com.sun.org.apache.xerces.internal.impl.io.MalformedByteSequenceException: Invalid byte 2 of 3-byte UTF-8 sequence 
```
**原因：**xml文件中声明的编码与xml文件本身保存时的编码不一致。比如你的声明是UTF-8，但是却以ANSI格式编码保存。尽管文件没有出现乱码，但xml解析器仍无法解析。有些人建议把xml改为GBK，这并不可取。解决方法为：用记事本打开xml文件，重新save。

* * *

**问题4：将svn的maven项目checkout至Eclipse，有时报如下错误**
```bash
java.lang.NoClassDefFoundError: Lorg/apache/log4j/Logger错误
```
**原因：**maven install生成的jar包没有自动引入，按下图配置即可

![图片1](http://7xvfir.com1.z0.glb.clouddn.com/Maven%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98%E6%B1%87%E6%80%BB/1.jpg)

