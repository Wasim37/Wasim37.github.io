---
title: DelayQueue使用
categories:
  - WEB后端
tags:
  - concurrent
date: 2016-4-16 23:42:13
toc: false

---

>假设现有如下使用场景：
a) 关闭空闲连接。服务器中，有很多客户端的连接，空闲一段时间之后需要关闭之。 
b) 缓存。缓存中的对象，超过了空闲时间，需要从缓存中移出。
c) 任务超时处理。在网络协议滑动窗口请求应答式交互时，处理超时未响应的请求。

笨办法是，使用一个后台线程，遍历所有对象，挨个检查。
但对象数量过多时，存在性能问题，检查间隔时间不好设置，间隔时间过大，影响精确度，多小则存在效率问题。而且做不到按超时的时间顺序处理。

这场景，使用DelayQueue最适合了。
Delayed 元素的一个无界阻塞队列，只有在延迟期满时才能从中提取元素。
该队列的头部是延迟期满后保存时间最长的Delayed元素（即最想优先处理的元素）。如果延迟都还没有期满，则队列没有头部，并且 poll 将返回 null。
当一个元素的 getDelay(TimeUnit.NANOSECONDS) 方法返回一个小于等于 0 的值时，将发生到期。
即使无法使用take或poll移除未到期的元素，也不会将这些元素作为正常元素对待。例如，size方法同时返回到期和未到期元素的计数。此队列不允许使 null元素。

<!-- more -->

DelayQueue队列中保存的是实现了Delayed接口的实现类，里面必须实现getDelay()和compareTo()方法。前者用于取DelayQueue里面的元素时判断是否到了延时时间，否则不予获取，是则获取。  compareTo()方法用于进行队列内部的排序。compareTo 方法需提供与 getDelay 方法一致的排序。

DelayQueue = BlockingQueue + PriorityQueue + Delayed
PriorityBlockingQueue = BlockingQueue + PriorityQueue
DelayQueue的关键元素BlockingQueue、PriorityQueue、Delayed。
可以这么说，DelayQueue是一个使用优先队列（PriorityQueue）实现的BlockingQueue，优先队列的比较基准值是时间。通过PriorityQueue，可以优先处理最紧急的元素，利用BlockingQueue，能防止不必要的不断轮询，提高了性能。在很多需要回收对象的场景都能用上。

---

### 代码示例

#### 场景一
模拟一个考试的日子，考试时间为120分钟，30分钟后才可交卷，当时间到了，或学生都交完卷了考试结束。主要注意的：
1、考试时间为120分钟，30分钟后才可交卷，初始化考生完成试卷时间最小应为30分钟
2、对于能够在120分钟内交卷的考生，如何实现这些考生交卷
3、对于120分钟内没有完成考试的考生，在120分钟考试时间到后需要让他们强制交卷
4、在所有的考生都交完卷后，需要将控制线程关闭

**下面是自己修改了的代码：**
```
package com.bbk.demo;

import java.util.Iterator;
import java.util.Random;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.DelayQueue;
import java.util.concurrent.Delayed;
import java.util.concurrent.TimeUnit;

/**
 * DelayQueue
 * @author wasim
 * @project Demo
 * @create at 2015-10-6 下午4:37:31
 */
public class Exam {

    public static void main(String[] args) throws InterruptedException {
        
        int studentNumber = 20;
        CountDownLatch countDownLatch = new CountDownLatch(studentNumber+1);
        DelayQueue< Student> students = new DelayQueue<Student>();
        Random random = new Random();
        for (int i = 0; i < studentNumber; i++) {
            students.put(new Student("student"+(i+1), 30+random.nextInt(120),countDownLatch));
        }
        Thread teacherThread =new Thread(new Teacher(students)); 
        students.put(new EndExam(students, 120,countDownLatch,teacherThread));
        teacherThread.start();
        countDownLatch.await();
        System.out.println(" 考试时间到，全部交卷！");  
    }

}

class Student implements Runnable,Delayed{

    private String name;
    private long workTime;
    private long submitTime;
    private boolean isForce = false;
    private CountDownLatch countDownLatch;
    
    public Student(){}
    
    public Student(String name,long workTime,CountDownLatch countDownLatch){
        this.name = name;
        this.workTime = workTime;
        //提交时间 = 当前时间 + 作答时间
        this.submitTime = TimeUnit.NANOSECONDS.convert(workTime, TimeUnit.NANOSECONDS)+System.nanoTime();
        this.countDownLatch = countDownLatch;
    }
    
    @Override
    public int compareTo(Delayed o) {
        // 按照作答时长正序排序（队头放的是你认为最先需要处理的元素，在这里体现为需要最先交卷，所以是正序）
        if(o == null || ! (o instanceof Student)) return 1;
        if(o == this) return 0;
        Student s = (Student)o;
        if (this.workTime > s.workTime) {
            return 1;
        }else if (this.workTime == s.workTime) {
            return 0;
        }else {
            return -1;
        }
    }

    @Override
    public long getDelay(TimeUnit unit) {
    	// 提交时间 - 当前时间  用来判断延迟是否到期（即是否可以提交试卷，可以进行take或者poll）
        // 返回正数：延迟还有多少时间到期。负数：延迟已经在多长时间前到期。负数代表可以take或者poll
        return unit.convert(submitTime - System.nanoTime(),  TimeUnit.NANOSECONDS);
    }

    @Override
    public void run() {
        if (isForce) {
            System.out.println(name + " 交卷, 希望用时" + workTime + "分钟"+" ,实际用时 120分钟" );
        }else {
            System.out.println(name + " 交卷, 希望用时" + workTime + "分钟"+" ,实际用时 "+workTime +" 分钟");  
        }
        countDownLatch.countDown();
    }

    public boolean isForce() {
        return isForce;
    }

    public void setForce(boolean isForce) {
        this.isForce = isForce;
    }

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public long getWorkTime() {
		return workTime;
	}

	public void setWorkTime(long workTime) {
		this.workTime = workTime;
	}

	public long getSubmitTime() {
		return submitTime;
	}

	public void setSubmitTime(long submitTime) {
		this.submitTime = submitTime;
	}
    
}

class EndExam extends Student{

    private DelayQueue<Student> students;
    private CountDownLatch countDownLatch;
    private Thread teacherThread;
    
    public EndExam(DelayQueue<Student> students, long workTime, CountDownLatch countDownLatch,Thread teacherThread) {
        super("强制收卷", workTime,countDownLatch);
        this.students = students;
        this.countDownLatch = countDownLatch;
        this.teacherThread = teacherThread;
    }
    
    
    
    @Override
    public void run() {
        teacherThread.interrupt();
        Student tmpStudent;
        for (Iterator<Student> iterator2 = students.iterator(); iterator2.hasNext();) {
            tmpStudent = iterator2.next();
            tmpStudent.setForce(true);
            System.out.println(tmpStudent.getName()+"==="+tmpStudent.getDelay(TimeUnit.NANOSECONDS));
            tmpStudent.run();
        }
        countDownLatch.countDown();
    }
    
}

class Teacher implements Runnable{

    private DelayQueue<Student> students;
    public Teacher(DelayQueue<Student> students){
        this.students = students;
    }
    
    @Override
    public void run() {
        try {
            System.out.println(" test start");
            while(!Thread.interrupted()){
            	Student s = students.take();
            	System.out.println(s.getName()+"==="+s.getDelay(TimeUnit.NANOSECONDS));
                s.run();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    
}
```

#### 场景二
向缓存添加内容时，给每一个key设定过期时间，系统自动将超过过期时间的key清除。需要注意的是：
1、当向缓存中添加key-value对时，如果这个key在缓存中存在并且还没有过期，需要用这个key对应的新过期时间
2、为了能够让DelayQueue将其已保存的key删除，需要重写实现Delayed接口添加到DelayQueue的DelayedItem的hashCode函数和equals函数
3、当缓存关闭，监控程序也应关闭，因而监控线程应当用守护线程

**网上搜到的相关代码：**
```
/**
 *Cache.java
 *
 * Created on 2014-1-11 上午11:30:36 by sunzhenchao mychaoyue2011@163.com
 */
public class Cache<K, V> {

    public ConcurrentHashMap<K, V> map = new ConcurrentHashMap<K, V>();
    public DelayQueue<DelayedItem<K>> queue = new DelayQueue<DelayedItem<K>>();
    
    
    public void put(K k,V v,long liveTime){
        V v2 = map.put(k, v);
        DelayedItem<K> tmpItem = new DelayedItem<K>(k, liveTime);
        if (v2 != null) {
            queue.remove(tmpItem);
        }
        queue.put(tmpItem);
    }
    
    public Cache(){
        Thread t = new Thread(){
            @Override
            public void run(){
                dameonCheckOverdueKey();
            }
        };
        t.setDaemon(true);
        t.start();
    }
    
    public void dameonCheckOverdueKey(){
        while (true) {
            DelayedItem<K> delayedItem = queue.poll();
            if (delayedItem != null) {
                map.remove(delayedItem.getT());
                System.out.println(System.nanoTime()+" remove "+delayedItem.getT() +" from cache");
            }
            try {
                Thread.sleep(300);
            } catch (Exception e) {
                // TODO: handle exception
            }
        }
    }
    
    /**
     * TODO
     * @param args
     * 2014-1-11 上午11:30:36
     * @author:孙振超
     * @throws InterruptedException 
     */
    public static void main(String[] args) throws InterruptedException {
        Random random = new Random();
        int cacheNumber = 10;
        int liveTime = 0;
        Cache<String, Integer> cache = new Cache<String, Integer>();
        
        for (int i = 0; i < cacheNumber; i++) {
            liveTime = random.nextInt(3000);
            System.out.println(i+"  "+liveTime);
            cache.put(i+"", i, random.nextInt(liveTime));
            if (random.nextInt(cacheNumber) > 7) {
                liveTime = random.nextInt(3000);
                System.out.println(i+"  "+liveTime);
                cache.put(i+"", i, random.nextInt(liveTime));
            }
        }

        Thread.sleep(3000);
        System.out.println();
    }

}

class DelayedItem<T> implements Delayed{

    private T t;
    private long liveTime ;
    private long removeTime;
    
    public DelayedItem(T t,long liveTime){
        this.setT(t);
        this.liveTime = liveTime;
        this.removeTime = TimeUnit.NANOSECONDS.convert(liveTime, TimeUnit.NANOSECONDS) + System.nanoTime();
    }
    
    @Override
    public int compareTo(Delayed o) {
        if (o == null) return 1;
        if (o == this) return  0;
        if (o instanceof DelayedItem){
            DelayedItem<T> tmpDelayedItem = (DelayedItem<T>)o;
            if (liveTime > tmpDelayedItem.liveTime ) {
                return 1;
            }else if (liveTime == tmpDelayedItem.liveTime) {
                return 0;
            }else {
                return -1;
            }
        }
        long diff = getDelay(TimeUnit.NANOSECONDS) - o.getDelay(TimeUnit.NANOSECONDS);
        return diff > 0 ? 1:diff == 0? 0:-1;
    }

    @Override
    public long getDelay(TimeUnit unit) {
        return unit.convert(removeTime - System.nanoTime(), unit);
    }

    public T getT() {
        return t;
    }

    public void setT(T t) {
        this.t = t;
    }
    @Override
    public int hashCode(){
        return t.hashCode();
    }
    
    @Override
    public boolean equals(Object object){
        if (object instanceof DelayedItem) {
            return object.hashCode() == hashCode() ?true:false;
        }
        return false;
    }
    
}
```