---
title: 使用Post方法模拟登陆爬取网页
categories:
  - WEB后端
tags:
  - 爬虫
date: 2016-12-19 22:10:00
toc: false

---

最近弄爬虫，遇到的一个问题就是如何使用post方法模拟登陆爬取网页。下面是极简版的代码：

![](http://7xvfir.com1.z0.glb.clouddn.com/%E4%BD%BF%E7%94%A8Post%E6%96%B9%E6%B3%95%E6%A8%A1%E6%8B%9F%E7%99%BB%E9%99%86%E7%88%AC%E5%8F%96%E7%BD%91%E9%A1%B5/QQ%E6%88%AA.jpg)

<!-- more -->

```bash

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;

import java.net.HttpURLConnection;
import java.net.URL;

import java.util.HashMap;

public class test {

	//post请求地址
	private static final String POST_URL = "";
	
	//模拟谷歌浏览器请求
	private static final String USER_AGENT = "";
	
	//用账号登录某网站后 请求POST_URL链接获取cookie
	private static final String COOKIE = "";
	
	//用账号登录某网站后 请求POST_URL链接获取数据包
	private static final String REQUEST_DATA =  "";
	
	public static void main(String[] args) throws Exception {
		HashMap<String, String> map = postCapture(REQUEST_DATA);
		String responseCode = map.get("responseCode");
		String value = map.get("value");
		
		while(!responseCode.equals("200")){
			map =  postCapture(REQUEST_DATA);
			responseCode = map.get("responseCode");
			value = map.get("value");
		}
		
		//打印爬取结果
		System.out.println(value);
	}
	
	private static HashMap<String, String> postCapture(String requestData) throws Exception{
		HashMap<String, String> map = new HashMap<>();
		
		URL url = new URL(POST_URL);
		HttpURLConnection httpConn = (HttpURLConnection) url.openConnection();
		httpConn.setDoInput(true); // 设置输入流采用字节流
		httpConn.setDoOutput(true); // 设置输出流采用字节流
		httpConn.setUseCaches(false); //设置缓存
		httpConn.setRequestMethod("POST");//POST请求
		httpConn.setRequestProperty("User-Agent", USER_AGENT);
		httpConn.setRequestProperty("Cookie", COOKIE);
		
		PrintWriter out = new PrintWriter(new OutputStreamWriter(httpConn.getOutputStream(), "UTF-8"));
		out.println(requestData);
		out.close();

		int responseCode = httpConn.getResponseCode();
		StringBuffer buffer = new StringBuffer();
		if (responseCode == 200) {
			BufferedReader reader = new BufferedReader(new InputStreamReader(httpConn.getInputStream(), "UTF-8"));
			String line = null;
			while ((line = reader.readLine()) != null) {
				buffer.append(line);
			}
			reader.close();
			httpConn.disconnect();
		}
		
		map.put("responseCode", new Integer(responseCode).toString());
		map.put("value", buffer.toString());
		return map;
	}

}

```