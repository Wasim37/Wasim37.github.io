---
title: API文档工具-Swagger的集成
categories:
  - 运维部署
tags:
  - Swagger
date: 2016-9-16 18:24:17
toc: false

---

> 最近安装了API文档工具swagger，因为Github上已有详细安装教程，且安装过程中没有碰到大的阻碍，所以此文仅对这次安装做一份大致记录

### 相关网站

Swagger 官方地址： 
http://swagger.wordnik.com 

Github安装详解【springmvc集成swagger】:
https://github.com/rlogiacco/swagger-springmvc

网上安装教程【可配合Github安装教程使用】：
http://www.jianshu.com/p/5cfbe62a1569
http://blog.csdn.net/fengspg/article/details/43705537

Swagger注解详解：
https://github.com/swagger-api/swagger-core/wiki/Annotations#apimodel
http://www.cnblogs.com/java-zhao/p/5348113.html 【springboot + swagger】

<font style="color:red">API文档工具 RAML、Swagger和Blueprint三者的比较：</font>
http://www.cnblogs.com/softidea/p/5728952.html

<!-- more -->

---

### 错误记录

配置完并成功启动项目后，报如下错误：

![](1.png)

**原因**：在修改配置文件index.html时，ip和端口中间多了一个斜杠，去掉斜杠即可。

![](2.png)

PS：果不是以上原因造成，请移步 https://github.com/swagger-api/swagger-ui 查看此错误详细介绍:

![](3.png)





