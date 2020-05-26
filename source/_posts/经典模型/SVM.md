---
title: SVM
tags:
  - SVM
categories:
  - 经典模型
date: 2017-10-22 22:22:00
toc: true
mathjax: true

---

持续更新中。。。

<!-- more -->

- [示例代码](https://github.com/Wasim37/machine_learning_code/tree/master/04%20%E6%94%AF%E6%8C%81%E5%90%91%E9%87%8F%E6%9C%BA%20SVM/notebook)
- [SVM目标函数推导](#SVM目标函数推导)
- [大边界的直观理解与数学解释](#大边界的直观理解与数学解释)
- [核函数](#核函数)
- [常用核函数及核函数的条件](#常用核函数及核函数的条件)
- [逻辑回归、SVM和神经网络使用场景](#逻辑回归、SVM和神经网络使用场景)
- [吴恩达SVM视频笔记](http://www.ai-start.com/ml2014/html/week7.html)
- [支持向量机通俗导论（理解SVM的三层境界）](#支持向量机通俗导论（理解SVM的三层境界）)
- [带核的SVM为什么能分类非线性问题](#带核的SVM为什么能分类非线性问题)
- [SVM常见问题](https://blog.csdn.net/yanhx1204/article/details/79481003)

---

### <h2 id="SVM目标函数推导">SVM目标函数推导</h2>
**SVM就是寻找一个超平面，将所有的数据点尽可能的分开，而且数据点离超平面距离越远越好。**
相对逻辑回归和神经网络，SVM在学习复杂的**非线性方程**时提供了一种更为清晰，更加强大的方式。

SVM 模型可以由 LR 模型推导而来，下面是 LR 的直观理解：

![](https://hexo-blog-wasim.oss-cn-shenzhen.aliyuncs.com/SVM/SVM_0.png)

LR 单个样本的损失函数：

![](https://hexo-blog-wasim.oss-cn-shenzhen.aliyuncs.com/SVM/SVM_1.png)

接着我们对 LR 的代价函数（所有样本）进行转换，首先去掉 1/m 这一项，这也会得出同样的 $\theta$ 最优值，然后令 $C=1/\lambda$

![](https://hexo-blog-wasim.oss-cn-shenzhen.aliyuncs.com/SVM/SVM_2.png)

得到代价函数：
$$\min_\limits{\theta}C\sum_\limits{i=1}^{m}\left[y^{(i)}{\cos}t_{1}\left(\theta^{T}x^{(i)}\right)+\left(1-y^{(i)}\right){\cos}t\left(\theta^{T}x^{(i)}\right)\right]+\frac{1}{2}\sum_\limits{i=1}^{n}\theta^{2}_{j}$$

我们最小化这个代价函数，令第一项为0，获得包含参数 $\theta$ 的第二项，SVM就是用第二项来直接预测值等于0还是1。**其实支持向量机做的全部事情，就是极小化参数向量范数的平方，或者说长度的平方。学习参数 $\theta$ 就是支持向量机假设函数的形式，这就是支持向量机数学上的定义。**

根据逻辑回归 $h_\theta \left( x \right)$ 的公式，我们知道当 $\theta^Tx$ 大于0的话，模型代价函数值为1，类似地，如果你有一个负样本，则仅需要 $\theta^Tx$ 小于0就会将负例正确分离 。

![](https://hexo-blog-wasim.oss-cn-shenzhen.aliyuncs.com/SVM/SVM_3.png)

但是，**支持向量机的要求更高**，不仅仅要能正确分开输入的样本，即不仅仅要求大于0，我们需要的是比0值大很多，比如大于等于1，我也想这个比0小很多，比如我希望它小于等于-1，这就相当于在支持向量机中嵌入了一个额外的安全因子，或者说**安全的间距因子**。

![](https://hexo-blog-wasim.oss-cn-shenzhen.aliyuncs.com/SVM/SVM_4.png)

所以最小化问题可以转换为：

![](https://hexo-blog-wasim.oss-cn-shenzhen.aliyuncs.com/SVM/SVM_5.png)

这就是 SVM 的最终目标函数。

---

### <h2 id="大边界的直观理解与数学解释">大边界的直观理解与数学解释</h2>
SVM 不仅需要能分类，还需要较高的鲁棒性，需要努力寻找一个最大间距（下图中的黑色超平面）来分离样本。所以 SVM 有时被称为**大间距分类器**。

![](https://hexo-blog-wasim.oss-cn-shenzhen.aliyuncs.com/SVM/SVM_8.png)

可是**为什么 SVM 能得到最大间距分类器**呢？我们仍然从 SVM 的目标函数进行分析。

在这之前首先说下 [向量内积的相关知识](http://www.ai-start.com/ml2014/html/week7.html#header-n132)， $\left\|| u |\right\|$表示 u 的范数，即 u 的长度，即向量 u 的欧几里得长度，并且 $\left\|| u \right\||=\sqrt{u_{1}^{2}+u_{2}^{2}}$。我们将向量 v 投影到向量 u 上，做一个直角投影，接下来我度量这条红线的长度。我称这条红线的长度为 p ，因此内积 $u^Tv=p\centerdot \left\|| u |\right\|$。注意，如果 u 和 v 之间的夹角大于90度，内积是个负数。
![](https://hexo-blog-wasim.oss-cn-shenzhen.aliyuncs.com/SVM/SVM_6.png)

SVM 的目标函数为：

![](https://hexo-blog-wasim.oss-cn-shenzhen.aliyuncs.com/SVM/SVM_5.png)

根据向量内积的知识对目标函数进行转换，同时假设只有两个样本，每个样本只有两个维度，令 $\theta_0 = 0$，$n = 2$

![](https://hexo-blog-wasim.oss-cn-shenzhen.aliyuncs.com/SVM/SVM_7.png)

得到

![](https://hexo-blog-wasim.oss-cn-shenzhen.aliyuncs.com/SVM/SVM_10.png)

现在我们假设有如上图所示的样本分布，那么 SVM 会选择怎样的决策边界呢？

**SVM 在分类的时候，为了不让模型过于复杂，会让 $\theta$ 的范数需要尽可能小，那么相应的，P也就是投影需要尽可能的大。我们知道 SVM 选择的参数 $\theta$ 的方向是和决策界是90度正交的，所以很明显，下图中，右边的绿色决策边界更理想，因为此刻样本在 $\theta$ 方向上的投影大很多。这就是为什么支持向量机最终会找到大间距分类器的原因。**

![](https://hexo-blog-wasim.oss-cn-shenzhen.aliyuncs.com/SVM/SVM_11.png)


$$\min_\limits{\theta}C\sum_\limits{i=1}^{m}\left[y^{(i)}{\cos}t_{1}\left(\theta^{T}x^{(i)}\right)+\left(1-y^{(i)}\right){\cos}t\left(\theta^{T}x^{(i)}\right)\right]+\frac{1}{2}\sum_\limits{i=1}^{n}\theta^{2}_{j}$$

**但是最大间距分类只有当参数 C 是非常大的时候才起效，回顾 $C=1/\lambda$ ，因此：**
**（1）C 较大时，相当于 $\lambda$ 较小，可能会导致过拟合，高方差。**
**（2）C 较小时，相当于 $\lambda$ 较大，可能会导致低拟合，高偏差。**

![](https://hexo-blog-wasim.oss-cn-shenzhen.aliyuncs.com/SVM/SVM_9.png)

比如你加了上图这个异常样本，为了将样本用最大间距分开，SVM 会将参数 C 设置的非常大，得到红色的决策边界，这是非常不明智的。但是**<font color="red"> 如果 C 设置的小一点，你最终会得到这条黑线。当 C 不是非常非常大的时候，它可以忽略掉一些异常点的影响，得到更好的决策界</font>**。甚至当你的数据不是线性可分的时候，支持向量机也可以给出好的结果。

---

### <h2 id="核函数">核函数</h2>

**SVM 在处理非线性可分问题时，会使用核函数。核函数具体怎么来的，可以概括为以下三点：**
（1）实际中，我们会经常遇到线性不可分的样例，此时，我们的常用做法是把样例特征映射到高维空间中去
（2）但是如果凡是遇到线性不可分的样例，一律映射到高维空间，那么这个维度大小高到可怕，几乎不可计算。
（3）此时，核函数隆重登场。核函数的价值在于它虽然也是将特征从低维映射到高维，但<font color="red">核函数绝就绝在它事先在低维上进行计算，而将实质上的分类效果表现在了高维上</font>。

下面进行详细说明。

假设有两个样本 X1 和 X2，它们是二维平面的两个坐标。样本分布如图所示

![](https://hexo-blog-wasim.oss-cn-shenzhen.aliyuncs.com/SVM/SVM_12.png)

此刻为了线性可分，我们想到一个方法，把样本投射到高纬空间，如图所示

![](https://hexo-blog-wasim.oss-cn-shenzhen.aliyuncs.com/SVM/SVM_14.png)

我们知道一条二次曲线（圆圈是二次曲线的一种特殊情况）的方程可以写作这样的形式：

![](https://hexo-blog-wasim.oss-cn-shenzhen.aliyuncs.com/SVM/SVM_13.png)

那么对一个二维空间做映射，选择的新空间是原始空间的所有一阶和二阶的组合，会得到五个维度，所以需要映射到五维空间，即R2→R5。假设新的空间的五个坐标的值分别为 Z1=X1, Z2=X1^2, Z3=X2, Z4=X2^2, Z5=X1X2，那么上面的方程在新的坐标系下可以写作
![](https://hexo-blog-wasim.oss-cn-shenzhen.aliyuncs.com/SVM/SVM_15.png)

这个过程其实涉及了两个步骤：
（1）首先使用一个非线性映射将数据变换到一个高纬特征空间F，
（2）然后在高纬特征空间使用内积的公式进行计算，进行线性分类。

**但是这里有一个很大的问题**，我们对一个二维空间做映射，选择的新空间是原始空间的所有一阶和二阶的组合，得到了五个维度；如果原始空间是三维，那么我们会得到 19 维的新空间，这个数目是呈爆炸性增长的，这给计算带来了非常大的困难，而且如果遇到无穷维的情况，就根本无从计算。

那么怎么办呢？我们首先来看下高纬空间的内积计算（尖括号代表内积计算，$ϕ$ 代表低纬到高纬的映）：

![](https://hexo-blog-wasim.oss-cn-shenzhen.aliyuncs.com/SVM/SVM_16.png)

另外，我们又注意到：

![](https://hexo-blog-wasim.oss-cn-shenzhen.aliyuncs.com/SVM/SVM_17.png)

二者有很多相似的地方，实际上，我们只要把某几个维度线性缩放一下，然后再加上一个常数维度，具体来说，上面这个式子的计算结果实际上和映射

![](https://hexo-blog-wasim.oss-cn-shenzhen.aliyuncs.com/SVM/SVM_18.png)

之后的内积![](https://hexo-blog-wasim.oss-cn-shenzhen.aliyuncs.com/SVM/SVM_19.png)的结果是相等的，**那么区别在于什么地方呢？**
**1. 一个是映射到高维空间中，然后再根据内积的公式进行计算；**
**2. 而另一个则直接在原来的低维空间中进行计算，而不需要显式地写出映射后的结果。**

**我们把这里的计算两个向量在隐式映射过后的空间中的内积的函数叫做核函数。核函数能简化映射空间中的内积运算——刚好“碰巧”的是，在我们的 SVM 里需要计算的地方数据向量总是以内积的形式出现的。**

常用的核函数：
![](https://hexo-blog-wasim.oss-cn-shenzhen.aliyuncs.com/SVM/SVM_20.png)

刚才所举例子用的就是多项式核（R = 1，d = 2），但是 [高斯核](http://www.ai-start.com/ml2014/html/week7.html#header-n197) 相对而言用的最广泛，**注意高斯核与正态分布没什么实际上的关系，只是看上去像而已**。

至于线性核，这实际上就是原始空间中的内积。这个核存在的主要目的是使得“映射后空间中的问题”和“映射前空间中的问题”两者在形式上统一起来了(意思是说，我们有时候写代码，或写公式的时候，只要写个通用模板或表达式，然后再代入不同的核，不必要分别写一个线性的和一个非线性的)。

---

### <h2 id="逻辑回归、SVM和神经网络使用场景">逻辑回归、SVM和神经网络使用场景</h2>

由逻辑回归的目标函数可以近似推导出不带核函数的 SVM 的目标函数，所以**逻辑回归和不带核函数的 SVM 是非常相似的算法，它们通常会做相似的事情，并给出相似的结果**。但当模型的复杂度上升，比如当你有多达1万的样本时，也可能是5万，你的**特征变量数量就会非常大**。在这样一个非常常见的体系里，**不带核函数的 SVM 就会表现得尤其突出**。

**那么如何在 LR 和 SVM 之间进行选择呢？下面是一些普遍使用的准则：**
n 为特征数，m 为训练样本数。
（1）如果相较于 m 而言，n 要大许多，即训练集数据量不够支持我们训练一个复杂的非线性模型，我们选用逻辑回归模型或者不带核函数的支持向量机。
（2）如果 n 较小，而且 m 大小中等，例如 n 在 1-1000 之间，而 m 在10-10000之间，使用高斯核函数的支持向量机。
（3）如果 n 较小，而 m 较大，例如 n 在1-1000之间，而 m 大于50000，则使用支持向量机会非常慢，解决方案是创造、增加更多的特征，然后使用逻辑回归或不带核函数的支持向量机。

**值得一提的是，<font color="red">神经网络在以上三种情况下都可能会有较好的表现</font>，但是训练神经网络可能<font color="red">非常慢</font>，选择支持向量机的原因主要在于它的代价函数是凸函数，不存在局部最小值。**

**但是通常更加重要的是**：你有多少数据，你有多熟练是否擅长做误差分析和排除学习算法，指出如何设定新的特征变量和找出其他能决定你学习算法的变量等方面，这些方面会比你使用 SVM，LR 还是神经网络更加重要。

---

### <h2 id="支持向量机通俗导论（理解SVM的三层境界）">支持向量机通俗导论（理解SVM的三层境界）</h2>
在线阅读链接：http://blog.csdn.net/v_july_v/article/details/7624837
网盘下载地址：https://pan.baidu.com/s/1htfvbzI 密码：qian
建议下载网盘里的pdf阅读，文档附带完整书签。

---

### <h2 id="常用核函数及核函数的条件">常用核函数及核函数的条件</h2>

推荐一篇文章： [svm核函数的理解和选择](https://blog.csdn.net/leonis_v/article/details/50688766)

![](https://hexo-blog-wasim.oss-cn-shenzhen.aliyuncs.com/SVM/https://hexo-blog-wasim.oss-cn-shenzhen.aliyuncs.com/%E6%9C%BA%E5%99%A8%E5%AD%A6%E4%B9%A0%E7%9F%A5%E8%AF%86%E7%82%B9%E9%9B%86%E9%94%A6/71.png)

---

### <h2 id="带核的SVM为什么能分类非线性问题">带核的SVM为什么能分类非线性问题</h2> 

**核函数的本质是两个函数的內积，通过核函数，SVM将低维数据隐射到高维空间，在高维空间，非线性问题转化为线性问题**，详见 [核函数](#核函数)。
![](https://hexo-blog-wasim.oss-cn-shenzhen.aliyuncs.com/SVM/SVM_14.png)



---