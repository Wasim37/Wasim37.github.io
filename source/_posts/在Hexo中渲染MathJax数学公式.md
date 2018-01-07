---
title: 在Hexo中渲染MathJax数学公式
tags:
  - hexo
categories:
  - 其他
date: 2017-9-20 22:22:00
toc: false
mathjax: true
---

最近学机器学习涉及很多的数学公式，公式如果用截图显示，会比较low而且不方便。因此需要对Hexo做些配置，支持公式渲染。同时文末整理了各种公式的书写心得，比如矩阵、大小括号、手动编号、上下角标和多行对其等，有兴趣的可以看看。

---

## 通过hexo-math插件安装MathJax

有个插件hexo-math，可以给Hexo博客添加MathJax公式支持，GitHub地址 https://github.com/hexojs/hexo-math

安装方法可其他hexo插件一样，在博客根目录执行npm install hexo-math --save安装，配置见GitHub说明页，这里我没有通过这种方式安装，而是直接在主题配置中添加MathJax的js来安装的。

---

## 在主题中手动添加js安装MathJax

类似所有第三方js插件，js加载方式有两种：

- 第一种，通过连接CDN加载js代码。好处是省了本地配置js代码，并且每次加载都是最新的，缺点是一旦连接的CDN出问题，可能卡住页面的js加载。
- 第二种，将js代码下载下来，放到主题的js文件夹中，通过本地相对目录加载。优缺点和第一种方法正相反。

这里我选择通过CDN加载，因为把代码下载下来后发现有好多js，搞不清楚其中的引用关系，还是直接用官方给出的通过CDN加载的简便方法吧：[Getting Started with MathJax](http://docs.mathjax.org/en/latest/start.html)

<!-- more -->

又综合了网上其他人给出的一些配置，最终代码如下。

在themes/free2mind/layout/_partial 目录中新建mathjax.ejs，填入如下js代码：
```bash
<!-- MathJax配置，可通过单美元符号书写行内公式等 -->
<script type="text/x-mathjax-config">
    MathJax.Hub.Config({
    "HTML-CSS": { 
        preferredFont: "TeX", 
        availableFonts: ["STIX","TeX"], 
        linebreaks: { automatic:true }, 
        EqnChunk: (MathJax.Hub.Browser.isMobile ? 10 : 50) 
    },
    tex2jax: { 
        inlineMath: [ ["$", "$"], ["\\(","\\)"] ], 
        processEscapes: true, 
        ignoreClass: "tex2jax_ignore|dno",
        skipTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
    },
    TeX: {  
        equationNumbers: { autoNumber: "AMS" },
        noUndefined: { attributes: { mathcolor: "red", mathbackground: "#FFEEEE", mathsize: "90%" } }, 
        Macros: { href: "{}" } 
    },
    messageStyle: "none"
    }); 
</script>
<!-- 给MathJax元素添加has-jax class -->
<script type="text/x-mathjax-config">
    MathJax.Hub.Queue(function() {
        var all = MathJax.Hub.getAllJax(), i;
        for(i=0; i < all.length; i += 1) {
            all[i].SourceElement().parentNode.className += ' has-jax';
        }
    });
</script>
<!-- 通过连接CDN加载MathJax的js代码 -->
<script type="text/javascript" async
  src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/MathJax.js?config=TeX-MML-AM_CHTML">
</script>
```

---

## 只在有公式的页面才加载MathJax
有公式才加载MathJax，这点比较重要，没有公式仍然加载js渲染公式，会影响页面加载速度。

在所有有公式的文章的front-matter中增加一项配置 mathjax: true，例如：
```bash
---
title: 结构化机器学习项目
tags:
  - 机器学习
categories:
  - 机器学习
date: 2017-10-9 22:22:00
toc: false
mathjax: true
---
```

然后在themes/free2mind/layout/_partial/footer.ejs 中通过此配置变量决定是否加载mathjax.ejs ：
```bash
<!-- 根据页面mathjax变量决定是否加载MathJax数学公式js -->
<% if (page.mathjax){ %>
<%- partial('mathjax') %>
<% } %>
```

---

## 解决MarkDown与MathJax渲染冲突

添加MathJax后写几个公式发现渲染出了很多问题，原因是Hexo默认先使用hexo-renderer-marked引擎渲染MarkDown，然后再交给MathJax渲染。hexo-renderer-marked会把一些特殊的markdown符号转换为相应的html标签，比如在markdown语法中，下划线 _ 代表斜体，会被转化为< em\>标签，\\也会被转义成一个\。而类Latex格式书写的数学公式下划线 _ 表示角标，\\表示公式换行，有特殊的含义，所以MathJax引擎在渲染数学公式的时候就会出错。

解决方法有人提出更换Hexo的MarkDown渲染引擎，用hexo-renderer-kramed 替换默认的hexo-renderer-marked引擎，但我看了下hexo-renderer-kramed的文档说明，如果用这个引擎的话，要改变我的MarkDown书写习惯，还是不用了，并且换了这个引擎还是没有完全解决问题。

最终解决方法是参考一篇博文中修改hexo-renderer-marked渲染引擎的js脚本，去掉对 _ 和\\的转义。
Hexo默认的MarkDown渲染引擎hexo-renderer-marked会调用marked模块的marked.js脚本进行最终的解释，这个脚本在Hexo安装后的node_modules\marked\lib\目录中。
有两点修改：

针对下划线的问题，取消_作为斜体转义，因为marked.js中\*也是斜体的意思，所以取消掉_的转义并不影响使用markdown，我平时一般不用斜体，就是用也更习惯用\*作为斜体标记。
针对marked.js与Mathjax对于个别字符二次转义的问题，我们只要不让marked.js去转义\\,\{,\}在MathJax中有特殊用途的字符就行了。
编辑node_modules\marked\lib\marked.js 脚本，

```
【第一步】
将451行的escape: /^\\([\\`*{}\[\]()# +\-.!_>])/,
替换为
escape: /^\\([`*\[\]()# +\-.!_>])/,
这一步取消了对\\,\{,\}的转义(escape)

【第二步】
将459行的em: /^\b_((?:[^_]|__)+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
替换为
em:/^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
这一步取消了对斜体标记_的转义
```
这样带来一个问题就是，以后每次更换电脑，在新电脑上安装完Hexo环境后，都要手动修改marked.js文件。

--- 

## MathJax公式书写
公式书写依然按照MarkDown语法来，基本上也和LaTeX相同，单\$符引住的是行内公式，双\$符引住的是行间公式。

- MathJax公式书写参考
http://meta.math.stackexchange.com/questions/5020/mathjax-basic-tutorial-and-quick-reference


#### <font color='blue'>MathJax行内公式
含下划线_的公式\$x_mu\$ : $x_mu$
希腊字符\$\sigma\$ : $\sigma$
行内公式\$y=ax+b\$ : $y=ax+b$
行内公式\$\cos 2\theta = \cos^2 \theta - \sin^2 \theta = 2 \cos^2 \theta\$ : $\cos 2\theta = \cos^2 \theta - \sin^2 \theta = 2 \cos^2 \theta$
行内公式\$M(\beta^{\ast}(D),D) \subseteq C\$ : $M(\beta^{\ast}(D),D) \subseteq C$


#### <font color='blue'>MathJax行间公式
行间公式 \$\$ \sum_{i=0}^n i^2 = \frac{(n^2+n)(2n+1)}{6} \$\$：
$$ \sum_{i=0}^n i^2 = \frac{(n^2+n)(2n+1)}{6} $$

行间公式 \$\$ x = \dfrac{-b \pm \sqrt{b^2 - 4ac}}{2a} \$\$：
$$ x = \dfrac{-b \pm \sqrt{b^2 - 4ac}}{2a} $$

#### <font color='blue'>MathJax大括号右多行赋值
双\\公式内换行，cases实现大括号右多行赋值，&用来对齐
```bash
$$
f(n) =
\begin{cases}
n/2,  & \text{if $n$ is even} \\
3n+1, & \text{if $n$ is odd}
\end{cases}
$$
```
$$
f(n) =
\begin{cases}
n/2,  & \text{if $n$ is even} \\
3n+1, & \text{if $n$ is odd}
\end{cases}
$$

#### <font color='blue'>MathJax多行公式对齐
比如多行公式推导中常用的等号对齐
begin{split} 表示开始多行公式，end{split}表示结束；公式中用\\表示回车到下一行，&表示对齐的位置。
```bash
$$
\begin{equation}
\begin{split}
\frac{\partial^2 f}{\partial{x^2}} &= \frac{\partial(\Delta_x f(i,j))}{\partial x} = \frac{\partial(f(i+1,j)-f(i,j))}{\partial x} \\
&= \frac{\partial f(i+1,j)}{\partial x} - \frac{\partial f(i,j)}{\partial x} \\
&= f(i+2,j) -2f(f+1,j) + f(i,j)
\end{split}
\nonumber
\end{equation}
$$
```
$$
\begin{equation}
\begin{split}
\frac{\partial^2 f}{\partial{x^2}} &= \frac{\partial(\Delta_x f(i,j))}{\partial x} = \frac{\partial(f(i+1,j)-f(i,j))}{\partial x} \\
&= \frac{\partial f(i+1,j)}{\partial x} - \frac{\partial f(i,j)}{\partial x} \\
&= f(i+2,j) -2f(f+1,j) + f(i,j)
\end{split}
\nonumber
\end{equation}
$$

#### <font color='blue'>MathJax公式自动编号
要想MathJax支持公式编号，需添加AMS支持，在脚本中添加如下MathJax配置项：
```bash
<script type="text/x-mathjax-config">
MathJax.Hub.Config({
  TeX: { equationNumbers: { autoNumber: "AMS" } }
});
</script>
```
<script type="text/x-mathjax-config">
MathJax.Hub.Config({
  TeX: { equationNumbers: { autoNumber: "AMS" } }
});
</script>

我上面mathjax.ejs脚本中已加入公式编号的配置。
书写时只要使用begin{equation}环境就会自动编号：
```bash
$$
\begin{equation}
\end{equation}
$$
```
注意此时会自动将文档内的所有begin{equation}公式连续编号，例如：
```bash
$$
\begin{equation}
\sum_{i=0}^n F_i \cdot \phi (H, p_i) - \sum_{i=1}^n a_i \cdot ( \tilde{x_i}, \tilde{y_i}) + b_i \cdot ( \tilde{x_i}^2 , \tilde{y_i}^2 )
\end{equation}
$$
$$
\begin{equation}
\beta^*(D) = \mathop{argmin} \limits_{\beta} \lambda {||\beta||}^2 + \sum_{i=1}^n max(0, 1 - y_i f_{\beta}(x_i)) 
\end{equation}
$$
```
$$
\begin{equation}
\sum_{i=0}^n F_i \cdot \phi (H, p_i) - \sum_{i=1}^n a_i \cdot ( \tilde{x_i}, \tilde{y_i}) + b_i \cdot ( \tilde{x_i}^2 , \tilde{y_i}^2 )
\end{equation}
$$
$$
\begin{equation}
\beta^*(D) = \mathop{argmin} \limits_{\beta} \lambda {||\beta||}^2 + \sum_{i=1}^n max(0, 1 - y_i f_{\beta}(x_i)) 
\end{equation}
$$

#### <font color='blue'>禁止自动编号
在end{equation}前加\nonumber可禁止对此公式自动编号，例如：
```bash
$$
\begin{equation}
\sum_{i=0}^n F_i \cdot \phi (H, p_i) - \sum_{i=1}^n a_i \cdot ( \tilde{x_i}, \tilde{y_i}) + b_i \cdot ( \tilde{x_i}^2 , \tilde{y_i}^2 )
\nonumber
\end{equation}
$$
$$
\begin{equation}
\beta^*(D) = \mathop{argmin} \limits_{\beta} \lambda {||\beta||}^2 + \sum_{i=1}^n max(0, 1 - y_i f_{\beta}(x_i)) 
\end{equation}
$$
```
$$
\begin{equation}
\sum_{i=0}^n F_i \cdot \phi (H, p_i) - \sum_{i=1}^n a_i \cdot ( \tilde{x_i}, \tilde{y_i}) + b_i \cdot ( \tilde{x_i}^2 , \tilde{y_i}^2 )
\nonumber
\end{equation}
$$
$$
\begin{equation}
\beta^*(D) = \mathop{argmin} \limits_{\beta} \lambda {||\beta||}^2 + \sum_{i=1}^n max(0, 1 - y_i f_{\beta}(x_i)) 
\end{equation}
$$

#### <font color='blue'>MathJax公式手动编号
可以在公式书写时使用\tag{手动编号}添加手动编号，例如：
```bash
$$
\begin{equation}
\sum_{i=0}^n F_i \cdot \phi (H, p_i) - \sum_{i=1}^n a_i \cdot ( \tilde{x_i}, \tilde{y_i}) + b_i \cdot ( \tilde{x_i}^2 , \tilde{y_i}^2 ) \tag{1.2.3}
\end{equation}
$$
```
$$
\begin{equation}
\sum_{i=0}^n F_i \cdot \phi (H, p_i) - \sum_{i=1}^n a_i \cdot ( \tilde{x_i}, \tilde{y_i}) + b_i \cdot ( \tilde{x_i}^2 , \tilde{y_i}^2 ) \tag{1.2.3}
\end{equation}
$$


```bash
不加\begin{equation}, \end{equation}也可以，例如：

$$
\beta^*(D) = \mathop{argmin} \limits_{\beta} \lambda {||\beta||}^2 + \sum_{i=1}^n max(0, 1 - y_i f_{\beta}(x_i)) \tag{我的公式3}
$$
```
$$
\beta^*(D) = \mathop{argmin} \limits_{\beta} \lambda {||\beta||}^2 + \sum_{i=1}^n max(0, 1 - y_i f_{\beta}(x_i)) \tag{我的公式3}
$$

行内公式加\tag{}后会自动成为行间公式，例如：
```python
$z = (p_0, ..... , p_n) \tag{公式21} $
```
$z = (p_0, ..... , p_n) \tag{公式21} $

又如：
```bash
$ s = r cos(a+b) = r cos(a) cos(b) - r sin(a) sin(b) \tag{1.1} $
$ t = r sin(a+b) = r sin(a) cos(b) - r cos(a) sin(b) \tag{1.2} $
```
$ s = r cos(a+b) = r cos(a) cos(b) - r sin(a) sin(b) \tag{1.1} $
$ t = r sin(a+b) = r sin(a) cos(b) - r cos(a) sin(b) \tag{1.2} $

- 参考Automatic Equation Numbering
http://docs.mathjax.org/en/latest/tex.html#automatic-equation-numbering


#### <font color='blue'>将下标放到正下方
1、如果是数学符号，那么直接用\limits命令放在正下方，如Max函数下面的取值范围，需要放在Max的正下方。可以如下实现：
```bash
$ \max \limits_{a<x<b}\{f(x)\} $
```
$ \max \limits_{a<x<b}\{f(x)\} $

2、若是普通符号，那么要用\mathop先转成数学符号再用\limits，如
```bash
$ \mathop{a}\limits_{i=1} $
```
$ \mathop{a}\limits_{i=1} $

#### <font color='blue'>MathJax矩阵输入
无括号矩阵：
```bash
$$
\begin{matrix}
1 & x & x^2 \\
1 & y & y^2 \\
1 & z & z^2 \\
\end{matrix}
$$
```
$$
\begin{matrix}
1 & x & x^2 \\
1 & y & y^2 \\
1 & z & z^2 \\
\end{matrix}
$$

矩阵运算：
```bash
$$
\left(
    \begin{array}{c}
      s \\
      t
    \end{array}
\right)
=
\left(
    \begin{array}{cc}
      cos(b) & -sin(b) \\
      sin(b) & cos(b)
    \end{array}
\right)
\left(
    \begin{array}{c}
      x \\
      y
    \end{array}
\right)
$$
```
$$
\left(
    \begin{array}{c}
      s \\
      t
    \end{array}
\right)
=
\left(
    \begin{array}{cc}
      cos(b) & -sin(b) \\
      sin(b) & cos(b)
    \end{array}
\right)
\left(
    \begin{array}{c}
      x \\
      y
    \end{array}
\right)
$$

有括号有竖线矩阵：
```bash
$$
\left[
    \begin{array}{cc|c}
      1&2&3\\
      4&5&6
    \end{array}
\right] 
$$
```
$$
\left[
    \begin{array}{cc|c}
      1&2&3\\
      4&5&6
    \end{array}
\right] 
$$

行内小矩阵：
```bash
$\bigl( \begin{smallmatrix} a & b \\ c & d \end{smallmatrix} \bigr)$
```
这是一个行内小矩阵$\bigl( \begin{smallmatrix} a & b \\ c & d \end{smallmatrix} \bigr)$，直接嵌入行内。