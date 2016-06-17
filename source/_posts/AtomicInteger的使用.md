---
title: AtomicInteger的使用
categories:
  - WEB后端
tags:
  - AtomicInteger
  - concurrent
date: 2016-4-16 22:41:19
---

### JDK API 1.7相关介绍
可以用原子方式更新的 int 值。有关原子变量属性的描述，请参阅 java.util.concurrent.atomic 包规范。AtomicInteger 可用在应用程序中（如以原子方式增加的计数器），并且不能用于替换 Integer。但是，此类确实扩展了 Number，允许那些处理基于数字类的工具和实用工具进行统一访问。

![图片1](1.png)

<!-- more -->
![图片2](2.png)

**AtomicInteger 是线程安全的，多线程对同一个数加100次，结果一定是100.  相关代码示例：**


```
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicInteger;

import javax.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.stereotype.Component;

/**
 * @ClassName: AtomicIntegerHandle 
 * @Description: AtomicInteger的使用
 * @author wasim
 * @create at 2015-8-12 下午8:44:51
 *  
 */
@Component
public class AtomicIntegerHandle {
	
	@Autowired
	ThreadPoolTaskExecutor executor;
	
	@PostConstruct
	public void handleQuestionKnowledge(){
		
		AtomicInteger atomicInteger = new AtomicInteger();
		
		int round = 15; //要执行的线程总数
		
		//导出文件 
		executor.execute(new ExportStats(atomicInteger, round));
		
		//导出文件前，需要先循环下面12个线程
		for(int i=0;i<round;i++){
			executor.execute(new similarKnowledgeHandle(atomicInteger));
		}
		
	}
	
	
	public class similarKnowledgeHandle implements Runnable{
		AtomicInteger atomicInteger;
		
		public similarKnowledgeHandle(AtomicInteger atomicInteger) {
			this.atomicInteger =atomicInteger;
		}
		
		@Override
		public void run() {
			System.out.println("do some thing....");
			atomicInteger.getAndIncrement();
			System.out.println(atomicInteger.get()); //显示当前计数
		}
	}
	
	
	public class ExportStats implements Runnable{
		
		AtomicInteger atomicInteger;
		int round;
		
		public ExportStats(AtomicInteger atomicInteger, int round) {
			this.atomicInteger =atomicInteger;
			this.round = round;
		}
		
		@Override
		public void run() {
			try {
				boolean flag = true;
				while(flag){
					if(atomicInteger.get() == round){
						flag = false;
						System.out.println("预处理完成,开始执行相关...");
					} else {
						System.out.println("wait...");
						Thread.sleep(1000);
					}
				}
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
		
	}
}
```
