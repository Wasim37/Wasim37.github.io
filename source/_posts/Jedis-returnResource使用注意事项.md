---
title: Jedis-returnResource使用注意事项
categories:
  - 错误集锦
tags:
  - redis
date: 2016-6-18 20:10:00
---

> 遇到过这样一个严重问题：
发布的项目不知从什么时候开始，每月会出现一两次串号问题。串号现象指的是，用户用账号A登录系统，然后某个时间，登录账号自动变成了B。
串号出现的时间不定，测试平台难以重现，且后台检测不到错误，难以定位。当时各种排查，最后发现问题果然是出在缓存redis上，JedisPool使用有问题。

### JedisPool使用注意事项：
1、每次从pool获取资源后，一定要try-finally释放，否则会出现很多莫名其妙的错误。
2、资源释放不能一致使用returnBrokenResource【项目问题就出在第二条注意事项上】。

### 相关代码
代码修改前大致如下:
```
public void closeResource(Jedis jedis) {  
    if (null != jedis) { 
         jedisPool.returnResource(jedis);  
    }  
} 
```
<!-- more -->

代码修改后大致如下【isOK正常设为true，捕获到异常如JedisConnectionException时传入false】:
```
public void closeResource(Jedis jedis, boolean isOK) {  
    if (null != jedis) {  
        if(!isOK){  
            LOG.error("do some things..");
            jedisPool.returnBrokenResource(jedis);  
        }else{  
            jedisPool.returnResource(jedis);  
        }   
    }  
}  
```
相关源码：

![图片1](1.png)
分析源代码，可以知道本来应该执行returnBrokenResourceObject方法，结果却执行了returnResourceObject，并且执行returnResourceObject过程中没有报错。

具体原因应该就在方法体里面，可惜点进去并没有分析出具体是哪几行代码导致了串号的出现  = =! 
不过当时项目return方面进行了修改后，错误确实没有再出现。

下面这篇文章也讲解了returnSource的相关注意事项，大家可以参考下
[http://www.codeweblog.com/jedis-returnresource使用注意事项/](http://www.codeweblog.com/jedis-returnresource使用注意事项/)

**PS：**当时项目使用的是Jedis2.7.0，不用通过图片1可以发现Jedis3.0后，returnResource就不使用了，建议用close替换。
即：jedisPool.returnResource(jedis) ---> jedis.close();
