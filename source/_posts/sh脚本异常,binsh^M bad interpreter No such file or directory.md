---
title: sh脚本异常,binsh^M bad interpreter No such file or directory
categories:
  - 错误集锦
date: 2016-6-18 18:24:17
toc: false
---

### 错误
在Linux中执行.sh脚本，出现如下异常
```bash
/bin/sh^M: bad interpreter: No such file or directory
```

### 原因
在windows系统中编辑的.sh文件可能有不可见字符，所以在Linux系统下执行会报以上异常信息。

--- 

### 解决

#### 在windows下转换： 
利用一些编辑器如UltraEdit或EditPlus等工具先将脚本编码转换，再放到Linux中执行。
转换方式如下（UltraEdit）：File-->Conversions-->DOS->UNIX即可。 

#### 在Linux下转换： 
首先要确保文件有可执行权限
```bash
chmod a+x filename
```

然后修改文件格式
利用如下命令查看文件格式 
```bash
vi filename
:set ff 或 :set fileformat 
```

可以看到如下信息
```bash
fileformat=dos 或 fileformat=unix 
```

利用如下命令修改文件格式 
```bash
:set ff=unix 或 :set fileformat=unix 
:wq (存盘退出)
```
最后再执行文件 

```bash
./filename
```