---
title: Java解析word文档
categories:
  - 其他技术
tags:
  - word解析
date: 2016-9-10 18:53:00
toc: false
---

### 背景
在互联网K12领域，做题库项目经常碰到的一个问题就是如何解析word文档。

如果程序无法智能的将一套一套的试卷文档解析成相应的试题数据，那么老师就只能线下手动通过平台录入题目，这个过程及其繁琐而且存在一定的失误率。

---

### 实现难点
现在回想整个解析过程，遇到的困难主要集中在以下几个方面:
- word不开源，常规方法只能解析纯文本信息，解析的方案难以确定。
- word文档的图片如何读取，图片可能由其它地方复制粘贴过来，也可能用的是word自带的画图工具，不同来源处理方式不同。且读取的时候是否能有效获取图片的位置及大小信息？方便后期试题排版。
- word文档的公式如何读取，公式的来源可能是常规输入法，可能是MathType插件，可能是word的自带公式，不同来源处理方式也不同。
- word文档格式很不规范，比如试题的题序，格式可能就有四五种，肉眼还无法识别区分。程序只可能尽量覆盖绝大部分情况，考虑的情况越多，解析率越高。

<!-- more -->

---

### Java解决方案
前期考虑用Java来解析word，网上搜索方案主要有如下几种：
- [jacob](http://www.cnblogs.com/x_wukong/p/4270867.html)：网上资料较少，目前已经实现的是用jacob解析mathtype输入的公式，然后调用word宏命令转成latex，但jacob无法解析word自带的公式。jacob也可以定位word图片总数及word图片位置，但目前没找到将图片另存本地的方法。
- [poi](http://poi.apache.org/apidocs/index.html)：情况与jacob类似。
- [Aspose.Words](http://www.aspose.com/)：一个商业收费类库，可以使应用程序处理大量的文件任务，支持word、pdf等各种格式操作。但是看文档介绍没有关于公式的处理方案。

以下是定位word图片总数及其位置的代码，更多详情请戳 http://www.cnblogs.com/x_wukong/p/4270867.html
```bash
package com.latex.test;

import com.jacob.activeX.ActiveXComponent;
import com.jacob.com.Dispatch;
import com.jacob.com.Variant;

public class test {
	public static void main(String[] args) {
		long time1 = System.currentTimeMillis();
		ActiveXComponent word = new ActiveXComponent("Word.Application");
		Dispatch wordObject = (Dispatch) word.getObject();
		Dispatch.put((Dispatch) wordObject, "Visible", new Variant(false));
		Dispatch documents = word.getProperty("Documents").toDispatch();
		Dispatch document = Dispatch.call(documents, "Open", "D://test.docx").toDispatch();
		Dispatch wordContent = Dispatch.get(document, "Content").toDispatch();
		Dispatch paragraphs = Dispatch.get(wordContent, "Paragraphs").toDispatch();
		
		int paragraphCount = Dispatch.get(paragraphs, "Count").getInt();// 总行数
		for (int i = 1; i <= paragraphCount; i++) {
			Dispatch paragraph = Dispatch.call(paragraphs, "Item", new Variant(i)).toDispatch();
			Dispatch paragraphRange = Dispatch.get(paragraph, "Range").toDispatch();
			String paragraphContent = Dispatch.get(paragraphRange, "Text").toString();
			System.out.println(paragraphContent);//打印每行内容
			
			Dispatch imgDispatch = Dispatch.get(paragraphRange, "InlineShapes").toDispatch();//图片
			int imgCount = Dispatch.get(imgDispatch, "Count").getInt();
			System.out.println("第" + i +"行图片总数" + imgCount);
			
			for(int j=1;j<imgCount+1;j++){
				Dispatch shape = Dispatch.call(imgDispatch, "Item", new Variant(1)).toDispatch();
				Dispatch imageRange = Dispatch.get(shape, "Range").toDispatch();
				Dispatch.call(imageRange, "Copy");
				Dispatch.call(imageRange, "Paste");
			}
		}

		Dispatch.call(document, "SaveAs" , new Variant( "D://test1.docx"));
		Dispatch.call(document, "Close", new Variant(true));
		Dispatch.call(word, "Quit");
		long time2 = System.currentTimeMillis();
		double time3 = (time2 - time1)/1000;
		System.out.println(time3 + " 秒.");

	}
}
```

---

### .NET解决方案
Jacob等Java解决方案只能解决部分解析问题，后期程序是用点net解决的。详情此处略过，不便透露。

---

### 其他

菁优网、梯子网、猿题库的数学公式是如何实现的？
http://www.jianshu.com/p/285737195278
