# 概念
## 广义
- 资源跳转
- 资源嵌入
- 脚本请求：JS发起的ajax请求、dom和js对象的跨域操作
## 狭义
同源策略/SOP，浏览器最核心最基本的安全功能，包整浏览器免受xss，csfr等的攻击


> 同源指 "**协议+域名+端口**"三者相同，即便不同域名指向同一个IP也非同源

> 跨域是指在脚本代码中向非同源域发送HTTP请求

> 同源限制以下几种行为
- Cookie，LocalStorage和IndexDB无法读取
- Dom和JS对象无法获得
- AJAX请求不能发送

# 解决方式
1. JSONP
在页面上引入不同域的JS脚本是可以的，JSONP通过这个特性解决跨域问题

使用XMLHTTPRequest

2. document.domain 
通过修改document.domain的值，向上匹配自己的父域

3. 通过windows.name
# 参考资料
[js中几种实用的跨域方法原理详解](https://www.cnblogs.com/2050/p/3191744.html)