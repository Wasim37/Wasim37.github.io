---
title: 外部无法捕捉Realm的doGetAuthenticationInfo方法抛出的异常
categories:
  - 错误集锦
tags:
  - shiro
date: 2016-9-19 22:41:19
toc: false
---

shiro权限框架，用户登录方法的subject.login(token)会进入自定义的UserNamePasswordRealm类的doGetAuthenticationInfo身份验证方法

通常情况，doGetAuthenticationInfo写法如下：

```bash
@Override
protected AuthenticationInfo doGetAuthenticationInfo(AuthenticationToken authcToken) throws AuthenticationException {
	UsernamePasswordToken token = (UsernamePasswordToken) authcToken;
	User loginUser = userService.getUserByName(token.getUsername());
	if (ObjectUtils.isEmpty(loginUser)) {
		throw new UnknownAccountException();
	}
	if(!loginUser.getPassWord().equals(MD5Util.md5s(String.valueOf(token.getPassword())))){
		throw new IncorrectCredentialsException();
	}
	//其他各种验证
	。。。
}

```

login登录方法：
```bash
@ResponseBody
@RequestMapping(value = "/login", method = RequestMethod.POST)
public String doUserLogin(User user, HttpServletRequest request, Model model) {
	...
	Subject subject = SecurityUtils.getSubject();
	UsernamePasswordToken token = new UsernamePasswordToken(user.getUserName(), user.getPassWord());
	try {
		subject.login(token);
	} catch (UnknownAccountException uae) {
		
	} catch (IncorrectCredentialsException ice) {
		
	} catch (LockedAccountException lae) {
		
	} catch (ExcessiveAttemptsException eae) {
		
	} catch (AuthenticationException ae) {
		
	}
	...
}
```

---

<font style="color:red">可是最近一次项目，发现通用的方法行不通了，doGetAuthenticationInfo方法抛出的各种异常如UnknownAccountException(包括自定义的异常)，外部都无法准确捕捉。

<!-- more -->

外部login捕捉的异常统一被改写为 AuthenticationException异常(IncorrectCredentialsException等异常的父类)，且异常的msg内容也被改写。内容如下：</font>


![图1](http://7xvfir.com1.z0.glb.clouddn.com/%E5%A4%96%E9%83%A8%E6%97%A0%E6%B3%95%E6%8D%95%E6%8D%89Realm%E7%9A%84doGetAuthenticationInfo%E6%96%B9%E6%B3%95%E6%8A%9B%E5%87%BA%E7%9A%84%E5%BC%82%E5%B8%B8/1.png?imageView2/0/q/75|watermark/1/image/aHR0cDovLzd4dmZpci5jb20xLnowLmdsYi5jbG91ZGRuLmNvbS8lRTYlQjAlQjQlRTUlOEQlQjAvJUU1JThEJTlBJUU1JUFFJUEyJUU2JUIwJUI0JUU1JThEJUIwLnBuZw==/dissolve/100/gravity/SouthEast/dx/10/dy/10|imageslim)

原因在subject.login(token)的源码里，源码有这么一段：

![图2](http://7xvfir.com1.z0.glb.clouddn.com/%E5%A4%96%E9%83%A8%E6%97%A0%E6%B3%95%E6%8D%95%E6%8D%89Realm%E7%9A%84doGetAuthenticationInfo%E6%96%B9%E6%B3%95%E6%8A%9B%E5%87%BA%E7%9A%84%E5%BC%82%E5%B8%B8/2.png?imageView2/0/q/75|watermark/1/image/aHR0cDovLzd4dmZpci5jb20xLnowLmdsYi5jbG91ZGRuLmNvbS8lRTYlQjAlQjQlRTUlOEQlQjAvJUU1JThEJTlBJUU1JUFFJUEyJUU2JUIwJUI0JUU1JThEJUIwLnBuZw==/dissolve/100/gravity/SouthEast/dx/10/dy/10|imageslim)

我们进入doSingleRealmAuthentication方法，可以看见方法里面外抛了UnknownAccountException等异常。
所以如果项目中只定义了一个realm，比如用来进行登录的身份验证，外部是可以正常捕捉的。

![图3](http://7xvfir.com1.z0.glb.clouddn.com/%E5%A4%96%E9%83%A8%E6%97%A0%E6%B3%95%E6%8D%95%E6%8D%89Realm%E7%9A%84doGetAuthenticationInfo%E6%96%B9%E6%B3%95%E6%8A%9B%E5%87%BA%E7%9A%84%E5%BC%82%E5%B8%B8/3.png?imageView2/0/q/75|watermark/1/image/aHR0cDovLzd4dmZpci5jb20xLnowLmdsYi5jbG91ZGRuLmNvbS8lRTYlQjAlQjQlRTUlOEQlQjAvJUU1JThEJTlBJUU1JUFFJUEyJUU2JUIwJUI0JUU1JThEJUIwLnBuZw==/dissolve/100/gravity/SouthEast/dx/10/dy/10|imageslim)

<font style="color:red">但是此次项目我定义了两个realm，一个用来进行登录的身份验证，另一个用来登录后，验证各种请求携带的的token。</font>
我们进入doMultiRealmAuthentication方法，内容如下

![图4](http://7xvfir.com1.z0.glb.clouddn.com/%E5%A4%96%E9%83%A8%E6%97%A0%E6%B3%95%E6%8D%95%E6%8D%89Realm%E7%9A%84doGetAuthenticationInfo%E6%96%B9%E6%B3%95%E6%8A%9B%E5%87%BA%E7%9A%84%E5%BC%82%E5%B8%B8/4.png?imageView2/0/q/75|watermark/1/image/aHR0cDovLzd4dmZpci5jb20xLnowLmdsYi5jbG91ZGRuLmNvbS8lRTYlQjAlQjQlRTUlOEQlQjAvJUU1JThEJTlBJUU1JUFFJUEyJUU2JUIwJUI0JUU1JThEJUIwLnBuZw==/dissolve/100/gravity/SouthEast/dx/10/dy/10|imageslim)

再进入afterAllAttempts的实现类，如图5。
发现抛出的异常都被统一改为AuthenticationException异常，且msg也被改写，正如图1所示。

![图5](http://7xvfir.com1.z0.glb.clouddn.com/%E5%A4%96%E9%83%A8%E6%97%A0%E6%B3%95%E6%8D%95%E6%8D%89Realm%E7%9A%84doGetAuthenticationInfo%E6%96%B9%E6%B3%95%E6%8A%9B%E5%87%BA%E7%9A%84%E5%BC%82%E5%B8%B8/5.png?imageView2/0/q/75|watermark/1/image/aHR0cDovLzd4dmZpci5jb20xLnowLmdsYi5jbG91ZGRuLmNvbS8lRTYlQjAlQjQlRTUlOEQlQjAvJUU1JThEJTlBJUU1JUFFJUEyJUU2JUIwJUI0JUU1JThEJUIwLnBuZw==/dissolve/100/gravity/SouthEast/dx/10/dy/10|imageslim)


### 结论

外部无法捕捉doGetAuthenticationInfo方法抛出的异常，原因在于源码，而不是自己的代码有问题。
如果没有改写源码的本事，那么外部想要捕捉各种异常，并在前端显示各种提示语，怎么办？

我的临时解决方法是，doGetAuthenticationInfo只用来验证用户名和密码，
外部直接捕捉AuthenticationException异常，其他的各种验证从doGetAuthenticationInfo方法移至login。