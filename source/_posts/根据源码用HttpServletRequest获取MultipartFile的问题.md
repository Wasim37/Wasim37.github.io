---
title: 根据源码用HttpServletRequest获取MultipartFile的问题
categories:
  - 错误集锦
date: 2016-11-10 18:24:17
---

### 问题
由于某些原因，现在需要这样的一个文件上传接口，这个接口type(String)是必传参数，photoFile(MultipartFile)是非必传参数，即一般情况下需要接受两个参数，分别为photoFile和type，但是偶尔只接受type参数，不需要起到上传作用。

按常规写法，photoFile参数的required配置设置为了false。

奈何调试时发现，photoFile的required配置是失效的。即下面的接口写法，photoFile成了必传参数。

```bash
@ResponseBody
@RequestMapping(value = "/upload")
public String uploadPics(@RequestPart(value = "photoFile", required = false) MultipartFile photoFile,
		@RequestParam(value = "type", required = true) String type, HttpServletRequest request) throws Exception {
		。。。
}
```

<!-- more -->

当模拟upload接口请求时，如果不携带photoFile参数，如上接口写法报错如下
```bash
org.springframework.web.multipart.MultipartException: The current request is not a multipart request
	at org.springframework.web.servlet.mvc.method.annotation.RequestPartMethodArgumentResolver.assertIsMultipartRequest(RequestPartMethodArgumentResolver.java:178) ~[spring-webmvc-4.0.2.RELEASE.jar:4.0.2.RELEASE]
	at org.springframework.web.servlet.mvc.method.annotation.RequestPartMethodArgumentResolver.resolveArgument(RequestPartMethodArgumentResolver.java:116) ~[spring-webmvc-4.0.2.RELEASE.jar:4.0.2.RELEASE]
	at org.springframework.web.method.support.HandlerMethodArgumentResolverComposite.resolveArgument(HandlerMethodArgumentResolverComposite.java:79) ~[spring-web-4.0.2.RELEASE.jar:4.0.2.RELEASE]
	at org.springframework.web.method.support.InvocableHandlerMethod.getMethodArgumentValues(InvocableHandlerMethod.java:157) ~[spring-web-4.0.2.RELEASE.jar:4.0.2.RELEASE]
	at org.springframework.web.method.support.InvocableHandlerMethod.invokeForRequest(InvocableHandlerMethod.java:124) ~[spring-web-4.0.2.RELEASE.jar:4.0.2.RELEASE]
	at org.springframework.web.servlet.mvc.method.annotation.ServletInvocableHandlerMethod.invokeAndHandle(ServletInvocableHandlerMethod.java:104) ~[spring-webmvc-4.0.2.RELEASE.jar:4.0.2.RELEASE]
	at org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter.invokeHandleMethod(RequestMappingHandlerAdapter.java:749) ~[spring-webmvc-4.0.2.RELEASE.jar:4.0.2.RELEASE]
	at org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter.handleInternal(RequestMappingHandlerAdapter.java:690) ~[spring-webmvc-4.0.2.RELEASE.jar:4.0.2.RELEASE]
	at org.springframework.web.servlet.mvc.method.AbstractHandlerMethodAdapter.handle(AbstractHandlerMethodAdapter.java:83) ~[spring-webmvc-4.0.2.RELEASE.jar:4.0.2.RELEASE]
	at org.springframework.web.servlet.DispatcherServlet.doDispatch(DispatcherServlet.java:945) ~[spring-webmvc-4.0.2.RELEASE.jar:4.0.2.RELEASE]
	...
```

---

### 方案
required配置失效，估计是没有走required的相关流程。
我们根据所报的第三行错误，进入RequestPartMethodArgumentResolver.class的源码的116行查看。
```bash
111		@Override
112		public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer,
113				NativeWebRequest request, WebDataBinderFactory binderFactory) throws Exception {
114
115			HttpServletRequest servletRequest = request.getNativeRequest(HttpServletRequest.class);
116			assertIsMultipartRequest(servletRequest);
117
118			MultipartHttpServletRequest multipartRequest =
119				WebUtils.getNativeRequest(servletRequest, MultipartHttpServletRequest.class);
120
121			String partName = getPartName(parameter);
122			Object arg;
123
124			if (MultipartFile.class.equals(parameter.getParameterType())) {
125				Assert.notNull(multipartRequest, "Expected MultipartHttpServletRequest: is a MultipartResolver configured?");
126				arg = multipartRequest.getFile(partName);
			}
		  .....
```

再点击116行，进入assertIsMultipartRequest方法
```bash
175		private static void assertIsMultipartRequest(HttpServletRequest request) {
176			String contentType = request.getContentType();
177			if (contentType == null || !contentType.toLowerCase().startsWith("multipart/")) {
178				throw new MultipartException("The current request is not a multipart request");
179			}
		}
```

很明显，错误就是178行触发的。而且在上层的几个调用中也没有涉及到required的流程。
那么问题来了, 接口偶尔需要起到上传作用，如果不改变接口传参形式，就只能改源码了，很明显，这不是好的方案。

**那答案肯定就在源码里了，我们很容易就想到可以在接口处完全去掉photoFile(MultipartFile)参数，然后把模仿源码，从request里去获取MultipartFile对象。**

下面是根据源码118-126行、176-179行修改的接口，经测试是可行的：
```bash
@ResponseBody
@RequestMapping(value = "/upload")
public String uploadPics(@RequestParam(value = "type", required = true) String type,
		HttpServletRequest request) {
	....
	// 检测是否为上传请求
	String contentType = request.getContentType();
	if (contentType != null && contentType.toLowerCase().startsWith("multipart/")) {
		MultipartHttpServletRequest multipartRequest =
				WebUtils.getNativeRequest(request, MultipartHttpServletRequest.class);
		MultipartFile file = multipartRequest.getFile("file");   
		....
	}
	....
}
```
---

### 后记
问题的处理其实很简单，但是这边文章的记录是为了另一件事。

当时实现这个功能时，发现常规写法走不通，又不好改源码，内心是有草泥马奔腾而过的。

知道答案可能在源码里，猜想可以去用request获取MultipartFile对象，但是又觉得麻烦，不想去干这事，想着可能有更好的办法，然后这事就拖着。

到后来问同事怎么解决，同事说那就从request获取MultipartFile对象咯。:-O

**其实工作经常碰到这类事情，但是很多时候那些 “貌似遥远的路途” 才是真正的捷径 ~**

