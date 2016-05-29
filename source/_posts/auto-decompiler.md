---
title: Android自动化反编译脚本
tags:
  - android
  - 反编译
categories:
  - Android
date: 2016-5-15 13:22:00
---

作为Android开发人员，在开发过程中经常会因为某个原因去反编译某个app。为了方便，这里特意整理了一个反编译的自动化脚本，只需一个命令就可以获取apk文件里面的资源文件，并使用jd－gui工具打开生成的jar文件。省去每次都要手动敲每个工具的命令，有时候忘记了某个命令还得上网搜索，很麻烦。

这里只整理了Linux和Mac两个平台的自动化脚本，Win下的百度能搜索的到。

### 所需要的工具
1）apktool，功能：反编译出apk所需要的资源文件和布局设置文件等，
下载地址：http://ibotpeaches.github.io/Apktool/install/

2）dex2jar，功能：反编译出jar文件，即apk的源程序文件的字节码，
下载地址：http://code.google.com/p/dex2jar/downloads/list

3）jd-gui 功能：查看反编译出来的jar文件
下载地址：http://jd.benow.ca/

这些工具我都整理好了，下面附了Linux和Mac平台的工具下载链接，并且包含了自动化脚本工具，可以直接下载使用。

<!-- more -->

### Linux

自动化脚本：
```
#!/bin/sh  

# will be decompiled file
file_name=$1
export NAME=${file_name%.apk}
export APK_TOOLS=$PWD/tools/apktool-2.1.1
export DEX_JAR=$PWD/tools/dex2jar-0.0.9.15
export JD_GUI=$PWD/tools/jd-gui-0.3.5.linux.i686

#init  
rm -rf tmp

#apply apktool  
cd $APK_TOOLS
rm -rf ../../$NAME
./apktool d -f ../../${file_name}
mv $NAME ../../

#unzip  
cd $APK_TOOLS/../..
mkdir -p tmp
cp ${file_name} tmp/$NANME.zip
cd tmp
unzip $NANME.zip
cd ..
cp ./tmp/$NANME/classes.dex $NAME

#use dex2jar to get classes_dex2jar.jar  
$DEX_JAR/dex2jar.sh $NAME/classes.dex
rm -rf tmp

#prepre open classes_dex2jar.jar
$JD_GUI/jd-gui $NAME/classes_dex2jar.jar
```

Linux下反编译工具下载链接：http://download.csdn.net/detail/a476777389/9520707


### Mac

自动化脚本：
```
#!/bin/sh  

# will be decompiled file
file_name=$1
export NAME=${file_name%.apk}
export APK_TOOLS=$PWD/tools/apktool-2.1.1
export DEX_JAR=$PWD/tools/dex2jar-0.0.9.15
export JD_GUI=$PWD/tools/jd-gui-osx-1.4.0

#init  
rm -rf tmp
#apply apktool  
cd $APK_TOOLS
rm -rf ../../$NAME
./apktool d -f ../../${file_name}
mv $NAME ../../

#unzip  
cd $APK_TOOLS/../..
mkdir -p tmp
cp ${file_name} tmp/$NANME.zip
cd tmp
unzip $NANME.zip
cd ..
cp ./tmp/$NANME/classes.dex $NAME

#use dex2jar to get classes_dex2jar.jar  
$DEX_JAR/d2j-dex2jar.sh $NAME/classes.dex
rm -rf tmp 
mv classes-dex2jar.jar $NAME

#prepre open classes_dex2jar.jar
open -a $JD_GUI/JD-GUI.app $NAME/classes-dex2jar.jar
```

Mac下反编译工具下载链接：http://download.csdn.net/detail/a476777389/9520676




