---
title: Java虚拟机原理
categories:
  - JAVA
tags:
  - 虚拟机
date: 2016-9-10 21:18:00
toc: false

---

### 1、编译机制
![](http://7xvfir.com1.z0.glb.clouddn.com/Java%E8%99%9A%E6%8B%9F%E6%9C%BA%E5%8E%9F%E7%90%86/1.png)
 
- 分析和输入到符号表：
词法分析：将代码转化为token序列
语法分析：由token序列生成抽象语法树
输入到符号表：将类中出现的符号输入到类的符号表

- 注解处理：
处理用户自定义注解，之后继续第一步

- 根据符号表进行语义分析并生成class文件，并进行相关优化

<!-- more -->

虚拟机数据类型、字节码文件格式、虚拟机指令集
![](http://7xvfir.com1.z0.glb.clouddn.com/Java%E8%99%9A%E6%8B%9F%E6%9C%BA%E5%8E%9F%E7%90%86/2.png)
 
 
### 2、执行机制

![](http://7xvfir.com1.z0.glb.clouddn.com/Java%E8%99%9A%E6%8B%9F%E6%9C%BA%E5%8E%9F%E7%90%86/3.png)
 
#### 2.1、加载、链接、初始化

![](http://7xvfir.com1.z0.glb.clouddn.com/Java%E8%99%9A%E6%8B%9F%E6%9C%BA%E5%8E%9F%E7%90%86/4.png)

##### 2.1.1、加载
 
![](http://7xvfir.com1.z0.glb.clouddn.com/Java%E8%99%9A%E6%8B%9F%E6%9C%BA%E5%8E%9F%E7%90%86/5.png)

双亲委派、线程上下文类加载器、Web容器、OSGi：
http://www.ibm.com/developerworks/cn/java/j-lo-classloader/

##### 2.1.2、链接

校验：校验二进制字节码格式是否符合Java Class File Format规范
准备：为类的静态属性分配内存和默认值，并加载引用的类或接口
解析：将运行时常量池中的符号引用替换为直接引用(静态绑定)

##### 2.1.3、初始化

类的初始化时机：
1) 创建类的实例
2) 初始化某个类的子类（满足主动调用，即访问子类中的静态变量、方法）
3) 反射（Class.forName()会触发，ClassLoader.loadClass()及X.class不会触发）
4) 访问类或接口的静态变量（static final常量除外，static final变量可以）
5) 调用类的静态方法
6) java虚拟机启动时被标明为启动类的类

初始化顺序：
 父类静态成员、静态代码块—>子类静态成员、静态代码块—>父类和子类实例成员内存分配—>父类实例成员、代码块—>父类构造函数—>子类实例成员、代码块—>子类构造函数

#### 2.2、内存结构

运行时数据区：

![](http://7xvfir.com1.z0.glb.clouddn.com/Java%E8%99%9A%E6%8B%9F%E6%9C%BA%E5%8E%9F%E7%90%86/6.png)

##### 2.2.1、Java堆

![](http://7xvfir.com1.z0.glb.clouddn.com/Java%E8%99%9A%E6%8B%9F%E6%9C%BA%E5%8E%9F%E7%90%86/7.png)
 
JVM在Eden区分配一块内存为TLAB，在TLAB创建对象时不需要加锁，所以JVM首先在TLAB上创建对象，不够则在堆上创建。
 
##### 2.2.2、方法区

![](http://7xvfir.com1.z0.glb.clouddn.com/Java%E8%99%9A%E6%8B%9F%E6%9C%BA%E5%8E%9F%E7%90%86/8.png)
 
静态绑定、动态绑定：
http://hxraid.iteye.com/blog/428891
 
##### 2.2.3、JVM栈
 
![](http://7xvfir.com1.z0.glb.clouddn.com/Java%E8%99%9A%E6%8B%9F%E6%9C%BA%E5%8E%9F%E7%90%86/9.png)

#### 2.3、垃圾回收

##### 2.3.1、对象结构
对象：对象头、对象体、字节填充

对象头：
http://blog.csdn.net/bingjing12345/article/details/8642595

![](http://7xvfir.com1.z0.glb.clouddn.com/Java%E8%99%9A%E6%8B%9F%E6%9C%BA%E5%8E%9F%E7%90%86/10.png)
 
对象头的MarkWord用于存储对象的各种标记信息，实现锁、 哈希算法、垃圾回收等。
后续为指向类方法区的引用及数组长度（若为数组）。

##### 2.3.2、对象分配方式
a. 堆上分配：指针碰撞、间隙列表
b. 栈上分配：基于逃逸分析
c. 堆外分配：Unsafe.allocateMemory()、DirectByteBuffer、ByteBuffer.allocateDicrect()或MappedByteBuffer
d. TLAB分配：Thread Local Allocation Buffer，多线程环境中JVM在Eden区分配一块内存为TLAB，在TLAB创建对象时不需要加锁，所以JVM首先在TLAB上创建对象，不够则在堆上创建。可通过-XX:TLABWasteTargetPercent设置TLAB和Eden的比例，可通过-XX:+PrintTLAB查看TLAB的使用情况。

##### 2.3.3、垃圾回收算法

引用计数器：为每个对象分配一个引用计数器，当计数器为0时回收对象，缺点：循环引用问题

复制：从根集合扫描存活对象，复制到一块全新内存空间，缺点：需要2倍内存空间，存活对象较多时开销较大

![](http://7xvfir.com1.z0.glb.clouddn.com/Java%E8%99%9A%E6%8B%9F%E6%9C%BA%E5%8E%9F%E7%90%86/11.png)

标记-清除：从根集合扫描并标记存活对象，扫描完成后清除未标记对象，缺点：存活对象较少时内存碎片较多 
 
![](http://7xvfir.com1.z0.glb.clouddn.com/Java%E8%99%9A%E6%8B%9F%E6%9C%BA%E5%8E%9F%E7%90%86/12.png)

标记-清除-压缩：从根集合扫描并标记存活对象，扫描完成后将存活对象移动并对齐

![](http://7xvfir.com1.z0.glb.clouddn.com/Java%E8%99%9A%E6%8B%9F%E6%9C%BA%E5%8E%9F%E7%90%86/13.png)

分代回收：根据生命周期长短，把JVM堆分成新生代、老年代。

说明：根集合范围为Java堆中的对象(Card Table/Remember Set)、方法区中的静态对象、Java栈中的局部变量表和JNI句柄指向的对象。

##### 2.3.4、JVM内存及垃圾回收配置

-Xmx：设置最大堆内存，即新生代、老年代之和的最大值，该参数设置过小会触发OOM
-Xms：设置最小堆内存，即JVM启动时的初始堆大小，一般设置和-Xmx相同，避免垃圾回收后JVM内存重分配
-XX:NewSize：设置新生代的初始值
-XX:MaxNewSize：设置新生代最大值
-Xmn：等同于设置相同的-XX:NewSize和-XX:MaxNewSize，该参数设置过小会频繁GC
-XX:PermSize：设置持久代初始值
-XX:MaxPermSize：设置持久代最大值
-Xss：设置线程栈大小
-XX:NewRatio：设置老年代与新生代的比例
-XX:SurvivorRatio：设置Eden区与S区的比例

-XX:MaxTenuringThreshold：设置垃圾回收最大年龄，即新生代中的对象经过多少次复制进入老年代
-XX:PretenureSizeThreshold：设置大于指定大小的较大对象直接进行老年代
 -XX:TargetSurvivorRatio：设置S区的可使用率，当S区的空间使用率达到这个数值，会将对象送入老年代
 -XX:MinHeapFreeRatio：设置堆空间的最小空闲比例，当堆空间的空闲内存小于这个数值时，JVM便会扩展堆空间
 -XX:MaxHeapFreeRatio：设置堆空间的最大空闲比例，当堆空间的空闲内存大于这个数值时，JVM便会压缩堆空间

![](http://7xvfir.com1.z0.glb.clouddn.com/Java%E8%99%9A%E6%8B%9F%E6%9C%BA%E5%8E%9F%E7%90%86/14.png)
 
![](http://7xvfir.com1.z0.glb.clouddn.com/Java%E8%99%9A%E6%8B%9F%E6%9C%BA%E5%8E%9F%E7%90%86/15.png)

新生代串行GC：使用复制算法，单线程STW
新生代并行回收GC：使用复制算法，多线程STW，吞吐量优先：自动调整新生代Eden、S0、S1大小
新生代并行GC：使用复制算法，多线程STW，新生代串行GC的多线程版本
老年代串行GC：使用标记压缩算法，单线程STW
老年代并行回收GC：使用标记压缩算法，多线程STW ，压缩方式比较特别，内存按线程数划分成不同区域，压缩时根据区域存活对象比例决定是否整块压缩
老年代并发GC：使用标记清除算法。问题：① 占用更多CPU；② 浮动垃圾；③ 内存碎片：支持Full GC后的碎片整理清除，多线程不STW，但是碎片整理是STW；

![](http://7xvfir.com1.z0.glb.clouddn.com/Java%E8%99%9A%E6%8B%9F%E6%9C%BA%E5%8E%9F%E7%90%86/16.png)
 
说明：
① -XX:+UserSerialGC为client默认方式，-XX:+UseParallelOldGC为server默认方式；
② 分存分配方式：指针碰撞(bump-the-pointer)、空闲列表(free list)、TLAB；
③ 根集合扫描加速：Card Table、Mod Union Table、Remembered Set；
④ 新生代并行回收GC没有对Mod Union Table进行处理，因此不能和老年代并发GC一起工作；
⑤ 使用 -XX:+HeapDumpOnOutOfMemoryError开启堆Dump；

优化方案：
① 给新生代分配较大空间，因为Full GC比Mirror GC成本高；
② 新生代进入老年代的年龄设置较大值，原因同上；
③ 设置大对象直接进入老年代，因为新生代使用复制算法，并且占用两倍空间，大对象成本高；
④ 最大和最小堆大小设置成一样，避免堆的调整；
⑤ 吞吐量优先模式：并行回收GC；
⑥ 响应时间优先模式：并发GC；

#### 2.4、执行机制

##### 2.4.1、解释执行
1) 栈顶缓存：将操作数栈顶中值直接缓存在寄存器上，计算后放回操作数栈
2) 部分栈帧共享：调用方法时，后一方法可将前一方法的操作数栈作为当前方法的局部变量，节省数据拷贝消耗

##### 2.4.2、编译执行

对频繁执行的代码编译为机器码，对不频繁执行的代码继续使用解释方式，可通过CompileThreshold、OnStackReplacePercentage两个计数器进行配置

 1) client编译（C1）：
方法内联：方法较短时，将被调用方法的指令直接植入当前方法
去虚拟化：如发现类中的方法只提供一个实现类，则对调用方进行内联
冗余削除：根据运行时状况对代码进行折叠或削除

2) server编译（C2）：
通过运行时信息，如分支判断（优先执行频率高的分支）和逃逸分析（变量是否被外部读取）等进行优化

标量替换：未用到对象的全部变量时，用标量替换聚合量，避免创建对象，节省内存，优化执行
栈上分配：对象未逃逸时，直接在栈上创建对象，优化执行
同步削除：对象未逃逸时，C2直接去掉同步

3) OSR编译（On-Stack Replacement）：
只在循环代码体部分编译，其它部分仍然是解释执行
 
##### 2.4.3、逆优化
C1、C2不满足优化条件时，进行逆优化回到解释执行模式

##### 2.4.4、反射执行
1) 由于权限校验、所有方法扫描及Method对象的复制，getMethod()方法比较消耗性能，应该缓存返回的Method对象；
2) Method.invoke()的性能瓶颈：参数的数组包装、方法可见性检查、参数的类型检查。可通过JDK7的MethodHandle提高性能；

