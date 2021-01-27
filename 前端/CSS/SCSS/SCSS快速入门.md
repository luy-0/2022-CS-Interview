
# 编写，编写完之后编译为css文件

- 首先需要安装以下的编译组件
```js
npm install css-loader style-loader --save-dev
npm install node-sass sass-loader --save-dev
```
- 在cli中设置，实现对应的loader的加载
- 

# 语法
## 变量
- 使用$开头进行定义和使用 
```scss
$border-color:#aaa; //声明变量
.container {
    $border-width:1px;
    border:$border-width solid $border-color; //使用变量
}
```
- 使用‘-’和‘_'等价
- 优先使用新定义的变量
## 嵌套

### 嵌套选择器
- 使后代选择器可以通过大括号定义，更加直观
### 嵌套属性
- 对类似border等属性的设置进行进一步简化
```scss
/*scss*/
li {
    border:1px solid #aaa {
        left:0;
        right:0;
    }
}

//结果
/*css*/
li {
    border:1px solid #aaa;
    border-left:0;
    border-right:0;
}
```
## 混合器（函数）
### 使用@mixin指令声明一个函数

### 使用@include指令使用函数
# 导入scss文件


# 参考资料
[scss快速入门](https://juejin.cn/post/6844903859010158600)
