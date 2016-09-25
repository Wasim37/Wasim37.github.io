---
title: Code Templates设置
categories:
  - WEB后端
date: 2016-5-18 19:13:52
---

### IDE配置地址：
Window->Preferences->Java->Code Style->Code Templates

### 我的默认配置：
**comments-->files:**
```
/**
 * @Project Name:${project_name}
 * @File Name:${file_name}
 * @Package Name:${package_name}
 * @Date:${date}${time}
 */
```

**comments-->types:**
```
/**
 * @ClassName: ${type_name}
 * @Description: ${todo}
 * @author Wasim
 * @Date: ${date} ${time}
 */
```
<!-- more -->
**comments-->methods:**
```
/**
 * @Title: ${enclosing_method}
 * @author Wasim
 * @Date: ${date} ${time}
 * @param ${tags}
 * @return ${return_type}
 */
```

**code-->New Java files:**
```
/** 
 * Project Name:${project_name} 
 * File Name:${file_name} 
 * Package Name:${package_name} 
 * Date:${date}${time} 
 * Copyright (c) ${year}, wasim37@163.com All Rights Reserved. 
*/  
${filecomment}  
  
${package_declaration} 

/**
 * @ClassName: ${type_name}
 * @Description: ${todo}
 * @author Wasim
 * @Date: ${date} ${time}
 */
${typecomment}  
${type_declaration}  
```
