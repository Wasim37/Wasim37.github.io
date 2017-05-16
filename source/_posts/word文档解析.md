---
title: word文档解析
categories:
  - 其他技术
tags:
  - word解析
  - Open XML SDK 2.0 Productivity Tool
date: 2016-9-10 18:53:00
toc: true
---

### 背景
在互联网教育行业，做内容相关的项目经常碰到的一个问题就是如何解析word文档。
因为系统如果无法智能的解析word，那么就只能通过其他方式手动录入word内容，效率低下，而且人工成本和录入出错率都较高。

---

### 疑难点
word解析可以预见的困难主要有以下几个方面:
- **word 结构问题** —— word不开源，且含有很多非文本内容，比如图表，而已知的常规方法只能解析纯文本内容，所以如果不知道word内部层级结构，解析将难以进行。
- **word 公式问题** —— word公式来源并非单一，可能是用MathType插件生成的latex公式，也可能是用word自带公式编辑器生成的公式，还有可能公式部分手敲，部分使用搜狗输入法或者其它编辑器输入。不同来源处理方式是否一样？且能否有效读取文档各种上下脚标？方便后期展示？
- **word 非文本问题** —— word含有很多的非文本内容，比如图表。来源也多样，图表可能是用word自带的画图工具生成的，也有可能是复制粘贴的，不同来源解析方式是否一样？且读取的时候是否能有效获取图片的位置及大小信息？方便文档内容后期在PC端和移动端展示。无论最终方案是什么，肯定是将所有的且需要的非文本信息转换为文本信息。
- **word 版本问题** —— word有03、07等好几个版本，还有WPS版本，解析是否要全部兼容？后缀名有docx和doc，是否全部兼容？当然，前提是已经成功解析一种类型。
- **word 规范问题** —— 有些word可能是早期制作的，返工代价太大，所以格式内容多样化。而且就算制定word格式规范，新制作的word也无法保证格式一定正确，除非是程序自动生成的文档。举个例子，试题的题序，肉眼无法区分的格式就有好几种。程序只可能尽量覆盖绝大部分情况，考虑的情况越多，解析正确率越高，当然程序也更复杂。

![MathType公式编辑器](http://7xvfir.com1.z0.glb.clouddn.com/word%E6%96%87%E6%A1%A3%E8%A7%A3%E6%9E%90/1.png)
![word自带公式编辑器](http://7xvfir.com1.z0.glb.clouddn.com/word%E6%96%87%E6%A1%A3%E8%A7%A3%E6%9E%90/2.png)
![word自带图表](http://7xvfir.com1.z0.glb.clouddn.com/word%E6%96%87%E6%A1%A3%E8%A7%A3%E6%9E%90/3.png)

<!-- more -->

---

### Java解析word
以前曾用Java解析过word文档，所以最先考虑用Java来解决问题，网上搜索方案主要有如下几种：
- [jacob](http://www.cnblogs.com/x_wukong/p/4270867.html)：网上资料较少，目前已经实现的是用jacob解析mathtype输入的公式，然后调用word宏命令转成latex，但jacob无法解析word自带的公式。jacob也可以定位word图片总数及word图片位置，但目前没找到将图片另存本地的方法。
- [poi](http://poi.apache.org/apidocs/index.html)：情况与jacob类似。
- [Aspose.words](http://www.aspose.com/)：一个商业收费类库，可以使应用程序处理大量的文件任务，支持word、pdf等各种格式操作。但是看文档介绍没有关于公式的处理方案。

Java使用以上几种方案的确解决了部分问题，但很多异常情况还是无法处理，比如无法定位word的批注等。
以下是使用Java定位word图片总数及其位置的代码，更多解决方案请戳 http://www.cnblogs.com/x_wukong/p/4270867.html
```bash
package com.latex.test;

import com.jacob.activeX.ActiveXComponent;
import com.jacob.com.Dispatch;
import com.jacob.com.Variant;

public class test {
	public static void main(String[] args) {
		long time1 = System.currentTimeMillis();
		ActiveXComponent word = new ActiveXComponent("word.Application");
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

### 问题分析
用Java预研一段时间后，进展缓慢，很多非文本内容无法解析，归根结底是不知道word内部层级结构。
如果能像html页面那样知道各个节点的构成，那么word解析成功按道理就只是时间问题。
但是word是微软的项目，不开源，所以得去搜索下微软本身是否提供了解析word层级结构的插件。
然后发现了个好东东，名为 [Open XML SDK 2.0 Productivity Tool](https://www.microsoft.com/en-us/download/details.aspx?id=5124)。
下载安装后，把一个word文档拖进面板，就可以看见word层级结构了 ~(～￣▽￣)～

![](http://7xvfir.com1.z0.glb.clouddn.com/word%E6%96%87%E6%A1%A3%E8%A7%A3%E6%9E%90/4.png)

知道层级结构就可以着手解决解析问题了，其它核心细节这里不方便透露，感兴趣的可以私聊，哈哈 ~~

---

### 其他

最后分享一篇不错的文章 —— [菁优网、梯子网、猿题库的数学公式是如何实现的？](http://www.jianshu.com/p/285737195278)

