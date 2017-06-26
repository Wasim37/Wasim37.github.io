---
title: redis凌晨删库事件
categories:
  - 数据库
tags:
  - redis
date: 2017-5-27 21:18:00
toc: true

---

#### 背景
5月25号凌晨，错误操作导致线上redis库被清空。
Redis主要作用：缓存、队列。

#### 操作过程
线上redis搭建了主从，持久化方式为RDB，RDB没有使用定时备份，AOF没有开启。
考虑到AOF开启会使Redis更耐久，
