---
title: Github+Hexo,搭建专属网站
tags:
  - github
  - hexo
categories:
  - 其他技术
date: 2016-6-1 22:22:00
toc: false

---

### 前言
记得从大二开始，就一直想搭个专属网站，当时使劲抠页面【前端页面是从QQ空间抠的，现在想抠估计没这么容易了】，写代码，忙活半天才把程序弄好。

![个人网站](http://7xvfir.com1.z0.glb.clouddn.com/Github+Hexo,%E6%90%AD%E5%BB%BA%E4%B8%93%E6%9C%89%E5%8D%9A%E5%AE%A2/2.png?imageView2/0/q/75|watermark/1/image/aHR0cDovLzd4dmZpci5jb20xLnowLmdsYi5jbG91ZGRuLmNvbS8lRTYlQjAlQjQlRTUlOEQlQjAvJUU1JThEJTlBJUU1JUFFJUEyJUU2JUIwJUI0JUU1JThEJUIwLnBuZw==/dissolve/100/gravity/SouthEast/dx/10/dy/10|imageslim)

可惜最终项目还是没上线，因为当时有两问题绕不开
- 需要购买服务器【服务器太贵，现在便宜的阿里云服务器每月都需100左右】。
- 需要运维管理【麻烦且危险，服务器宕了可能丢失数据】。

最近了解到 github + hexo 能完美解决上述问题，啥也不说了，直接开干 ^.^

---

### 相关网站
搭建教程网上比比皆是，此处不累赘，下面是搭建过程中用到的相关网站：

hexo中文网站：[https://hexo.io/zh-cn/docs/](https://hexo.io/zh-cn/docs/)  
hexo主题模板：[https://www.zhihu.com/question/24422335](https://www.zhihu.com/question/24422335)
hexo+github搭建过程：[http://www.jianshu.com/p/df3edc4286d2](http://www.jianshu.com/p/df3edc4286d2)
Markdown 语法说明：[http://www.appinn.com/markdown/](http://www.appinn.com/markdown/)
github绑定域名：[http://www.jianshu.com/p/1d427e888dda](http://www.jianshu.com/p/1d427e888dda)  

---

### HEXO如何优化部署及管理
**问题：使用hexo时，如果本地文件丢失或者想在其他电脑上修改博客怎么办？**
**方案：**简单地说，每个想建立GitHub Pages的仓库，至少两个分支，一个hexo分支用来存放网站的原始文件，一个master分支用来存放生成的静态网页。  

<!-- more -->

**步骤如下:**
1、创建仓库，Wasim37.github.io；
2、创建两个分支：master 与 hexo；
3、设置hexo为默认分支（因为我们只需要手动管理这个分支上的Hexo网站文件）；
4、使用git clone git@github.com:Wasim37/Wasim37.github.io.git拷贝仓库；
5、在本地Wasim37.github.io文件夹下通过Git bash依次执行npm install hexo、hexo init、npm install 和 npm install hexo-deployer-git（此时当前分支应显示为hexo）;
6、修改_config.yml中的deploy参数，分支应为master；
7、依次执行git add .、git commit -m “…”、git push origin hexo提交网站相关的文件；
8、执行hexo generate -d生成网站并部署到GitHub上。

**本地修改**
1、在本地对博客进行修改（添加新博文、修改样式等等）后，通过下面的流程进行管理：
依次执行git add .、git commit -m “…”、git push origin hexo指令将改动推送到GitHub（此时当前分支应为hexo）；
2、然后才执行hexo generate -d发布网站到master分支上。

**本地资料丢失或者想在其他电脑上修改博客**
1、使用git clone git@github.com:Wasim37/Wasim37.github.io.git拷贝仓库（默认分支为hexo）；
2、在本地新拷贝的Wasim37.github.io文件夹下通过Git bash依次执行下列指令：npm install hexo、npm install、npm install hexo-deployer-git（记得，不需要hexo init这条指令）。

---

### 安装错误记录
执行hexo d出现以下错误

![](http://7xvfir.com1.z0.glb.clouddn.com/Github+Hexo,%E6%90%AD%E5%BB%BA%E4%B8%93%E6%9C%89%E5%8D%9A%E5%AE%A2/4.png)

**解决方法：**
_config.yml ——> deploy ——> repository
https://github.com/{username}/{username}.github.io.git 修改为
git@github.com:{username}/{username}.github.io.git

---

### 文章编辑工具
文章编辑工具一开始我使用的是subline，但因为没有快捷键及预览功能，后来选择了MarkdownPad。可最近发现新版的有道云笔记支持Markdown语法，果断换成了有道。
**因为有道除了编辑功能，我更看重的是它对文章的二次备份.** 

有道云笔记MarkDown使用教程： [http://note.youdao.com/iyoudao/?p=1895](http://note.youdao.com/iyoudao/?p=1895)

![效果图](http://7xvfir.com1.z0.glb.clouddn.com/Github+Hexo,%E6%90%AD%E5%BB%BA%E4%B8%93%E6%9C%89%E5%8D%9A%E5%AE%A2/1.png?imageView2/0/q/75|watermark/1/image/aHR0cDovLzd4dmZpci5jb20xLnowLmdsYi5jbG91ZGRuLmNvbS8lRTYlQjAlQjQlRTUlOEQlQjAvJUU1JThEJTlBJUU1JUFFJUEyJUU2JUIwJUI0JUU1JThEJUIwLnBuZw==/dissolve/100/gravity/SouthEast/dx/10/dy/10|imageslim)

**其次文章图片如果不想托管在github，可以使用七牛云存储等图床工具。**

---

### 模板自定义
我使用的博客主题为 **icarus**，对比可以发现，我在展示细节上做了一些自己的修改。

比如页面展示可以分为左中右三个区域，分别为profile-column，main-column和sidebar-column。
源代码三者宽度比例为3:7:3。为了突出正文，我改为了 2.3：8.4：2.3。
源代码文件位置为：icarus\source\css\ _variables.styl

![](http://7xvfir.com1.z0.glb.clouddn.com/Github+Hexo,%E6%90%AD%E5%BB%BA%E4%B8%93%E6%9C%89%E5%8D%9A%E5%AE%A2/3.png)

---

### 文章目录
icarus主题模板的文章详细展示默认是不带有文章目录的
如果需要添加文章目录，可以参考http://www.jianshu.com/p/72408c410904

icarus主题添加文章目录，修改themes\icarus\layout\common\article.ejs文件即可。
```bash
<% if (!index && post.toc) { %>
修改为
<% if (!index && post.toc != false) { %>
```

每篇文章可以选择是否开放目录功能
```bash
...
title: Github+Hexo,搭建专属网站
categories:
  - demo
toc: false
...
```