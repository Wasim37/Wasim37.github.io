---
title: Java集合类从属关系
categories:
  - WEB后端
tags:
  - 集合
  - 疑难杂症
date: 2016-6-11 21:18:00
toc: false

---

> 有些东西不整理，实在太容易忘了。

### 1、集合关系图

![图片1](1.png)
![图片2](2.png)
<!-- more -->
![图片3](3.png)
![图片4](4.png)

**Java的集合分为了四类：List Set Queue Map**，每类都有不同的实现，有基于数组实现的，有基于链表实现的，有基于xx树实现的，不同的实现虽在功能上可以相互替代但都有各自的应用场景，如基于数组的实现擅长快速遍历，基于链表的实现擅长随机写，基于树的实现可排序等等。

JDK1.5及以后还添加了很多实用的功能，如ConcurrentMap、CopyOnWriteArray、ListBlockingQueue、BlockingDeque、CopyOnWriteArraySet等等，另外，Collections工具类也提供了很多方便的API，如 synchronizedCollection、binarySearch、checkedCollection、copy、indexOfSubList、reverse、singletonList等等，这给我们提供了非常多的选择。

多线程下使用，需要保证线程安全，读操作远大与写操作，例如缓存系统，使用CopyOnWriteArray...也许会是不错的选择，此外Concurrent...也不错。
如果在多线程间还需要协作通信等，那么阻塞队列BlockingQueue、BlockingDeque（双端队列，既可以在队列的前端进行插入删除操作，也可以在队列的后端进行插入删除操作，具有队列和栈的特征）会是最合适的选择。
如果这还不够，可以使用带优先级的PriorityBlockingQueue更秒的地方我们还可以使用DelayQueue延迟队列，如果你的创造力够强的话，用DelayQueue来实现一些超时管理（如Session超时处理、请求超时处理）会有非常优雅和奇妙的效果 。

如果不会涉及多线程并发访问，如方法内部、同步访问区等，如果有随机写的需求可以考虑LinkedList或LinkedHashSet
如果需要快速检索元素是否已经存在于集合内可以考虑使用HashMap、HashSet
如果我们需要非常频繁且高效的遍历则应该采用ArrayList
如果我们需要排序，那么就必需要选择TreeMap、TreeSet喽
另外，LinkedList同时实现了List、Deque、Queue接口，用其来实现Stack也是可以的。

### 2、《编程思想》相关概念
![图片5](5.png)
![图片6](6.png)

#### 3、集合类为什么也称为容器类？
![图片7](7.png)
