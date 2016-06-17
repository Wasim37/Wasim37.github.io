---
title: countDownLatch和cyclicBarrier
categories:
  - WEB后端
tags:
  - countDownLatch
  - cyclicBarrier
  - concurrent
date: 2016-4-16 23:16:16
---

《 Effecit In Java 》说过，从java 1.5发现版本开始, 就不建议使用wait和notify，它们使用比较困难，可以使用更高级并发工具来替代。

![图片1](1.png)

图一所说的同步器是指那些能使线程等待另一个线程的对象，常用的有cyclicBarrier和倒计数锁存器CountDownLatch和semaphore。

### CountDownLatch
一个同步辅助类，在完成一组正在其他线程中执行的操作之前，它允许一个或多个线程一直等待。它的倒计数类似于AutomicInteger的getAndDecrement()。但它还有另一个主要作用类似于 wait和notify。
<!-- more -->
**代码示例**：
```
package com.bbk.u001.handle;

import java.util.concurrent.CountDownLatch;

import javax.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.stereotype.Component;

/**
 * CountDownLatch的使用
 * @ClassName: StatsSimilarKnowledgeHandle 
 * @Description: TODO
 * @author wasim
 * @create at 2015-8-12 下午8:44:51
 *  
 */
@Component
public class CountDownLatchHandle {
	
	@Autowired
	ThreadPoolTaskExecutor executor;
	
	@PostConstruct
	public void handleStatsQuestionKnowledge(){
		
		CountDownLatch startSignal = new CountDownLatch(12);
		
		//导出文件 
		executor.execute(new ExportStats(startSignal));
		
		//导出文件前，需要先循环下面12个线程
		for(int i=0;i<12;i++){
			executor.execute(new similarKnowledgeHandle(startSignal));
		}
		
	}
	
	
	public class similarKnowledgeHandle implements Runnable{
		CountDownLatch startSignal;
		
		public similarKnowledgeHandle(CountDownLatch startSignal) {
			this.startSignal =startSignal;
		}
		
		@Override
		public void run() {
			startSignal.countDown();
			System.out.println(startSignal.getCount()); //显示当前计数
		}
	}
	
	
	public class ExportStats implements Runnable{
		
		CountDownLatch startSignal;
		
		public ExportStats(CountDownLatch startSignal) {
			this.startSignal =startSignal;
		}
		
		@Override
		public void run() {
			try {
				startSignal.await(); //当计数为0前，导出文件的线程一直处于等待状态
				System.out.println("start export.......");
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
		}
		
	}
}

```
<br/>

### cyclicBarrier 
一个同步辅助类，它允许一组线程互相等待，直到到达某个公共屏障点 (common barrier point)。在涉及一组固定大小的线程的程序中，这些线程必须不时地互相等待，此时 CyclicBarrier 很有用。因为该 barrier 在释放等待线程后可以重用，所以称它为循环 的 barrier。

**代码示例：**
```
class Solver {
   final int N;
   final float[][] data;
   final CyclicBarrier barrier;
   
   class Worker implements Runnable {
     int myRow;
     Worker(int row) { myRow = row; }
     public void run() {
       while (!done()) {
         processRow(myRow);

         try {
           barrier.await(); 
         } catch (InterruptedException ex) { 
return; 
         } catch (BrokenBarrierException ex) { 
return; 
         }
       }
     }
   }

   public Solver(float[][] matrix) {
     data = matrix;
     N = matrix.length;
     barrier = new CyclicBarrier(N, 
                                 new Runnable() {
                                   public void run() { 
                                     mergeRows(...); 
                                   }
                                 });
     for (int i = 0; i < N; ++i) 
       new Thread(new Worker(i)).start();

     waitUntilDone();
   }
 }
```


### cyclicBarrier 和  CountDownLatch 的区别

![图片2](2.png)