# 缓存机制概述
## 缓存机制存在的意义
在请求数据的时候，和本地缓存进行对比，如果是已经拥有的数据就可以直接使用缓存数据而不用再进行数据的发送，徒劳的消耗时间
## 分类
### 强缓存
直接放在本地，比较也是在本地进行，如果不行再进行请求
### 协商缓存
比较在服务端进行，比较时发送数据生成的E-tag，通过hash的比较，如果数据都没有发生变化的话，发送302状态码，表明数据可以继续使用
# 控制方法
## Cache-control头
- no:store,不进行存储

# 参考资料
[http缓存及Etag记录](https://segmentfault.com/a/1190000018621167)

[MDN-HTTP 缓存](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Caching_FAQ)
