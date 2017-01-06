---
title: MyBatis双数据源配置
categories:
  - WEB后端
date: 2016-10-20 18:53:00
toc: false

---

### 配置相关

#### jdbc 配置

```bash
#============================================================================
# MySQL
#============================================================================
jdbc.mysql.driver=com.mysql.jdbc.Driver
jdbc.mysql.url=jdbc:mysql://127.0.0.1:3306/test?useUnicode=true&characterEncoding=UTF-8&allowMultiQueries=true
jdbc.mysql.username=root
jdbc.mysql.password=root

#============================================================================
# MS SQL Server (JTDS)
#============================================================================
jdbc.sqlserver.driver=net.sourceforge.jtds.jdbc.Driver
jdbc.sqlserver.url=jdbc:jtds:sqlserver://127.0.0.1:1433/test
jdbc.sqlserver.username=sa
jdbc.sqlserver.password=sa


#============================================================================
# 通用配置
#============================================================================
jdbc.initialSize=5
jdbc.minIdle=5
jdbc.maxIdle=20
jdbc.maxActive=100
jdbc.maxWait=100000
jdbc.defaultAutoCommit=false
jdbc.removeAbandoned=true
jdbc.removeAbandonedTimeout=600
jdbc.testWhileIdle=true
jdbc.timeBetweenEvictionRunsMillis=60000
jdbc.numTestsPerEvictionRun=20
jdbc.minEvictableIdleTimeMillis=300000

jdbc.properties
```

<!-- more -->

#### 单数据源时的Spring配置文件
```bash
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xmlns:aop="http://www.springframework.org/schema/aop"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
    http://www.springframework.org/schema/beans/spring-beans-3.0.xsd
    http://www.springframework.org/schema/context
    http://www.springframework.org/schema/context/spring-context-3.0.xsd
      http://www.springframework.org/schema/aop
          http://www.springframework.org/schema/aop/spring-aop-3.0.xsd">
    <bean id="propertyConfigurer" class="org.springframework.beans.factory.config.PropertyPlaceholderConfigurer">
        <property name="location" value="classpath:jdbc.properties"/>
    </bean>
       <bean id="dataSource" class="org.apache.commons.dbcp.BasicDataSource" destroy-method="close">
        <property name="driverClassName" value="${jdbc.mysql.driver}"/>
        <property name="url" value="${jdbc.mysql.url}"/>
        <property name="username" value="${jdbc.mysql.username}"/>
        <property name="password" value="${jdbc.mysql.password}"/>
        <property name="initialSize" value="${jdbc.initialSize}"/>
        <property name="minIdle" value="${jdbc.minIdle}"/>
        <property name="maxIdle" value="${jdbc.maxIdle}"/>
        <property name="maxActive" value="${jdbc.maxActive}"/>
        <property name="maxWait" value="${jdbc.maxWait}"/>
        <property name="defaultAutoCommit" value="${jdbc.defaultAutoCommit}"/>
        <property name="removeAbandoned" value="${jdbc.removeAbandoned}"/>
        <property name="removeAbandonedTimeout" value="${jdbc.removeAbandonedTimeout}"/>
        <property name="testWhileIdle" value="${jdbc.testWhileIdle}"/>
        <property name="timeBetweenEvictionRunsMillis" value="${jdbc.timeBetweenEvictionRunsMillis}"/>
        <property name="numTestsPerEvictionRun" value="${jdbc.numTestsPerEvictionRun}"/>
        <property name="minEvictableIdleTimeMillis" value="${jdbc.minEvictableIdleTimeMillis}"/>
    </bean>
    <bean id="sqlSessionFactory" class="org.mybatis.spring.SqlSessionFactoryBean">
        <property name="dataSource" ref="dataSource"/>
    </bean>

    <!-- mybatis.spring自动映射 -->
    <bean class="org.mybatis.spring.mapper.MapperScannerConfigurer">
        <property name="basePackage" value="com.cnblogs.lzrabbit"/>
    </bean>

    <!-- 自动扫描，多个包以 逗号分隔 -->
    <context:component-scan base-package="com.cnblogs.lzrabbit"/>
    <aop:aspectj-autoproxy/>
</beans>

applicationContext.xml
```


#### 多数据源时Spring配置文件
```bash
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xmlns:aop="http://www.springframework.org/schema/aop"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
    http://www.springframework.org/schema/beans/spring-beans-3.0.xsd
    http://www.springframework.org/schema/context
    http://www.springframework.org/schema/context/spring-context-3.0.xsd
      http://www.springframework.org/schema/aop
          http://www.springframework.org/schema/aop/spring-aop-3.0.xsd">
    <bean id="propertyConfigurer" class="org.springframework.beans.factory.config.PropertyPlaceholderConfigurer">
        <property name="location" value="classpath:jdbc.properties"/>
    </bean>
    <bean id="sqlServerDataSource" class="org.apache.commons.dbcp.BasicDataSource" destroy-method="close">
        <property name="driverClassName" value="${jdbc.sqlserver.driver}"/>
        <property name="url" value="${jdbc.sqlserver.url}"/>
        <property name="username" value="${jdbc.sqlserver.username}"/>
        <property name="password" value="${jdbc.sqlserver.password}"/>
        <property name="initialSize" value="${jdbc.initialSize}"/>
        <property name="minIdle" value="${jdbc.minIdle}"/>
        <property name="maxIdle" value="${jdbc.maxIdle}"/>
        <property name="maxActive" value="${jdbc.maxActive}"/>
        <property name="maxWait" value="${jdbc.maxWait}"/>
        <property name="defaultAutoCommit" value="${jdbc.defaultAutoCommit}"/>
        <property name="removeAbandoned" value="${jdbc.removeAbandoned}"/>
        <property name="removeAbandonedTimeout" value="${jdbc.removeAbandonedTimeout}"/>
        <property name="testWhileIdle" value="${jdbc.testWhileIdle}"/>
        <property name="timeBetweenEvictionRunsMillis" value="${jdbc.timeBetweenEvictionRunsMillis}"/>
        <property name="numTestsPerEvictionRun" value="${jdbc.numTestsPerEvictionRun}"/>
        <property name="minEvictableIdleTimeMillis" value="${jdbc.minEvictableIdleTimeMillis}"/>
    </bean>
    <bean id="mySqlDataSource" class="org.apache.commons.dbcp.BasicDataSource" destroy-method="close">
        <property name="driverClassName" value="${jdbc.mysql.driver}"/>
        <property name="url" value="${jdbc.mysql.url}"/>
        <property name="username" value="${jdbc.mysql.username}"/>
        <property name="password" value="${jdbc.mysql.password}"/>
        <property name="initialSize" value="${jdbc.initialSize}"/>
        <property name="minIdle" value="${jdbc.minIdle}"/>
        <property name="maxIdle" value="${jdbc.maxIdle}"/>
        <property name="maxActive" value="${jdbc.maxActive}"/>
        <property name="maxWait" value="${jdbc.maxWait}"/>
        <property name="defaultAutoCommit" value="${jdbc.defaultAutoCommit}"/>
        <property name="removeAbandoned" value="${jdbc.removeAbandoned}"/>
        <property name="removeAbandonedTimeout" value="${jdbc.removeAbandonedTimeout}"/>
        <property name="testWhileIdle" value="${jdbc.testWhileIdle}"/>
        <property name="timeBetweenEvictionRunsMillis" value="${jdbc.timeBetweenEvictionRunsMillis}"/>
        <property name="numTestsPerEvictionRun" value="${jdbc.numTestsPerEvictionRun}"/>
        <property name="minEvictableIdleTimeMillis" value="${jdbc.minEvictableIdleTimeMillis}"/>
    </bean>
    <bean id="multipleDataSource" class="com.cnblogs.lzrabbit.MultipleDataSource">
        <property name="defaultTargetDataSource" ref="mySqlDataSource"/>
        <property name="targetDataSources">
            <map>
                <entry key="mySqlDataSource" value-ref="mySqlDataSource"/>
                <entry key="sqlServerDataSource" value-ref="sqlServerDataSource"/>
            </map>
        </property>
    </bean>
    <bean id="sqlSessionFactory" class="org.mybatis.spring.SqlSessionFactoryBean">
        <property name="dataSource" ref="multipleDataSource"/>
    </bean>

    <!-- mybatis.spring自动映射 -->
    <bean class="org.mybatis.spring.mapper.MapperScannerConfigurer">
        <property name="basePackage" value="com.cnblogs.lzrabbit"/>
    </bean>

    <!-- 自动扫描，多个包以 逗号分隔 -->
    <context:component-scan base-package="com.cnblogs.lzrabbit"/>
    <aop:aspectj-autoproxy/>
</beans>

```

#### MultipleDataSource实现
```bash
package com.cnblogs.lzrabbit;

import org.springframework.jdbc.datasource.lookup.AbstractRoutingDataSource;

/**
 * Created by rabbit on 14-5-25.
 */
public class MultipleDataSource extends AbstractRoutingDataSource {
    private static final ThreadLocal<String> dataSourceKey = new InheritableThreadLocal<String>();

    public static void setDataSourceKey(String dataSource) {
        dataSourceKey.set(dataSource);
    }

    @Override
    protected Object determineCurrentLookupKey() {
        return dataSourceKey.get();
    }
}
```

#### 手动数据源切换调用
```bash
package com.cnblogs.lzrabbit;

import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

/**
 * Created by rabbit on 14-5-25.
 */
public class Main {
    public static void main(String[] args) {
        //初始化ApplicationContext
        ApplicationContext applicationContext = new ClassPathXmlApplicationContext("applicationContext.xml");

        MySqlMapper mySqlMapper = applicationContext.getBean(MySqlMapper.class);

        SqlServerMapper sqlServerMapper = applicationContext.getBean(SqlServerMapper.class);
        
        //设置数据源为MySql,使用了AOP测试时请将下面这行注释
        MultipleDataSource.setDataSourceKey("mySqlDataSource");
        mySqlMapper.getList();
        //设置数据源为SqlServer,使用AOP测试时请将下面这行注释
        MultipleDataSource.setDataSourceKey("sqlServerDataSource");
        sqlServerMapper.getList();
    }
}
```

#### MyBatis接口Mapper定义，直接使用注解方式实现
```bash
public interface MySqlMapper {
    @Select("select * from MyTable")
    List<Map<String,Object>> getList();
}

public interface SqlServerMapper {
        @Select("select * from MyTable")
        List<Map<String,Object>> getList();
}
```


#### 使用SpringAOP方式实现自动切换
```bash
package com.cnblogs.lzrabbit;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

@Component
@Aspect
public class MultipleDataSourceAspectAdvice {

    @Around("execution(* com.cnblogs.lzrabbit.*.*(..))")
    public Object doAround(ProceedingJoinPoint jp) throws Throwable {
        if (jp.getTarget() instanceof MySqlMapper) {
            MultipleDataSource.setDataSourceKey("mySqlDataSource");
        } else if (jp.getTarget() instanceof SqlServerMapper) {
            MultipleDataSource.setDataSourceKey("sqlServerDataSource");
        }
        return jp.proceed();
    }
}
```
---

### 配置详解

这里就上面的实现做个简单解释，在我们配置单数据源时可以看到数据源类型使用了org.apache.commons.dbcp.BasicDataSource，而这个代码实现了javax.sql.DataSource接口

配置sqlSessionFactory时org.mybatis.spring.SqlSessionFactoryBean注入参数dataSource类型就是javax.sql.DataSource

实现多数据源的方法就是我们自定义了一个MultipleDataSource，这个类继承自AbstractRoutingDataSource，而AbstractRoutingDataSource继承自AbstractDataSource ，AbstractDataSource 实现了javax.sql.DataSource接口，所以我们的MultipleDataSource也实现了javax.sql.DataSource接口，可以赋值给sqlSessionFactory的dataSource属性

```bash
public abstract class AbstractRoutingDataSource extends AbstractDataSource implements InitializingBean {
}

public abstract class AbstractDataSource implements DataSource {
}
```


再来说下MultipleDataSource的实现原理，MultipleDataSource实现AbstractRoutingDataSource抽象类，然后实现了determineCurrentLookupKey方法，这个方法用于选择具体使用targetDataSources中的哪一个数据源
```bash
<bean id="multipleDataSource" class="com.cnblogs.lzrabbit.MultipleDataSource">
        <property name="defaultTargetDataSource" ref="mySqlDataSource"/>
        <property name="targetDataSources">
            <map>
                <entry key="mySqlDataSource" value-ref="mySqlDataSource"/>
                <entry key="sqlServerDataSource" value-ref="sqlServerDataSource"/>
            </map>
        </property>
    </bean>
```

可以看到Spring配置中multipleDataSource设置了两个属性defaultTargetDataSource和targetDataSources，这两个属性定义在AbstractRoutingDataSource，当MyBatis执行查询时会先选择数据源，选择顺序时现根据determineCurrentLookupKey方法返回的值到targetDataSources中去找，若能找到怎返回对应的数据源，若找不到返回默认的数据源defaultTargetDataSource，具体参考AbstractRoutingDataSource的源码
```bash
public abstract class AbstractRoutingDataSource extends AbstractDataSource implements InitializingBean {

    private Map<Object, Object> targetDataSources;

    private Object defaultTargetDataSource;

    
    /**
     * Retrieve the current target DataSource. Determines the
     * {@link #determineCurrentLookupKey() current lookup key}, performs
     * a lookup in the {@link #setTargetDataSources targetDataSources} map,
     * falls back to the specified
     * {@link #setDefaultTargetDataSource default target DataSource} if necessary.
     * @see #determineCurrentLookupKey()
     */
    protected DataSource determineTargetDataSource() {
        Assert.notNull(this.resolvedDataSources, "DataSource router not initialized");
        Object lookupKey = determineCurrentLookupKey();
        DataSource dataSource = this.resolvedDataSources.get(lookupKey);
        if (dataSource == null && (this.lenientFallback || lookupKey == null)) {
            dataSource = this.resolvedDefaultDataSource;
        }
        if (dataSource == null) {
            throw new IllegalStateException("Cannot determine target DataSource for lookup key [" + lookupKey + "]");
        }
        return dataSource;
    }

    /**
     * Determine the current lookup key. This will typically be
     * implemented to check a thread-bound transaction context.
     * <p>Allows for arbitrary keys. The returned key needs
     * to match the stored lookup key type, as resolved by the
     * {@link #resolveSpecifiedLookupKey} method.
     */
    protected abstract Object determineCurrentLookupKey();
　　
　　.............

}
```
在动态切换数据源方法时选择了AOP方式实现，这里实现的简单粗暴，具体应用时根据实际需要灵活变通吧