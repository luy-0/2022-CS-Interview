# 文件流布局
基本布局方式，直接按照文件流顺序进行布局

# 浮动布局
使用float属性，使文件脱离文件流，进行布局

# 定位布局
使用position属性进行定位，调整元素位置

# flex布局
使用flex属性进行复杂布局
- 首先设置 ```display：flex```
> 设置之后子元素的```float，clear，vertical-align ```属性将会失效

> 如果是Webkit内核的浏览器，必须加上 ```-webkit ```，即 ```flex: - webkit -flex ```
- 然后就可以通过flex提供的几种属性愉快的更改页面布局了



# 参考资料
[CSS 常见布局方式](https://juejin.cn/post/6844903491891118087)