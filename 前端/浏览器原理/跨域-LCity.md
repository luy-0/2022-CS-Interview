# 概念
## 广义
- 资源跳转
- 资源嵌入
- 脚本请求：JS发起的ajax请求、dom和js对象的跨域操作
## 狭义
同源策略/SOP，浏览器最核心最基本的安全功能，保证浏览器免受xss，csfr等的攻击

> 一般情况下经常通过添加origin(domain)上的准许访问，允许发起跨域请求
> 同源指 "**协议+域名+端口**"三者相同，即便不同域名指向同一个IP也非同源

> 跨域是指在脚本代码中向非同源域发送HTTP请求

> 同源限制以下几种行为
- Cookie，LocalStorage和IndexDB无法读取
- Dom和JS对象无法获得
- AJAX请求不能发送

# 解决方式
## 主要解决方式
服务端通过添加可信任的域，访问时添加额外的请求头，得到准许
- 简单请求
    - 方法为GET，POST，HEAD，Content-Type
    - 仅需要添加Origin:表明来源
    - 服务端会返回 Access-Control-Allow-Origin 字段说明允许访问的域地址
- 预检请求
    - 首先需要发送携带OPTIONS的预检请求包，询问是否允许该实际请求
        - 需要包含 Access-Control-Request-Method，Access-Control-Request-Headers说明请求情况
        - 服务器会返回提供的访问方法等
    - 然后根据需求发送实际的请求包
- 附带身份凭证的请求

## 其它解决方式
1. JSONP
在页面上引入不同域的JS脚本是可以的，JSONP通过这个特性解决跨域问题

使用XMLHTTPRequest

2. document.domain 
通过修改document.domain的值，向上匹配自己的父域

3. 通过windows.name


# 参考资料
[js中几种实用的跨域方法原理详解](https://www.cnblogs.com/2050/p/3191744.html)
[MDN中对跨域的描述](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/%E8%B7%A8%E5%9F%9F%E8%B5%84%E6%BA%90%E5%85%B1%E4%BA%AB(CORS)_)