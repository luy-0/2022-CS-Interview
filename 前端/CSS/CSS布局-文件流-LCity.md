# 文档流
> 正常流动方向，从左到右，从上到下
## 文件流特点
- 空白折叠现象
> 换行时会添加空白

- 高矮不齐，底部对齐。
> 高度不同时，按照底部对齐
## 块级元素和行内元素
### 块级元素
- 霸占一行,不和其他任何元素并列
- 能接受宽高
- 不设置宽度，默认和父亲一样宽

### 行内元素
- 和其他元素并列
- 不能设置宽、高，默认宽度就是文字的宽度

> 延申开来
在HTML中，标签分为：文本级和容器级；
- 文本级：p、span、a、b、i、u、em
- 容器级：div、h系列、li、dt、dd

- 所有的文本级标签都是行内元素，除了p； p是个文本级，但是是个块级元素；

- 所有的容器级标签都是块级元素

### display
display属性就是对行内元素和块级元素进行转换的方法
## overflow
溢出文件流时的处理方式，通过设置overflow解决
- overflow:auto;
> 超出部分显示滚动条，不超出时不显示
- overflow:hidden;
> 超出部分直接隐藏
- overflow:scroll;
> 滚动条会一直存在

# position

> CSS position属性用于指定一个元素在文档中的定位方式。top、right、bottom、left 属性则决定了该元素的最终位置

## static (默认)
元素在文档常规流中当前的布局位置，此时top，right，bottom，left属性无效

元素按照正常的顺序排列

## relative
元素先放置在未添加定位时的位置，在不改变页面布局的前提下调整元素位置

对 table-*-group, table-row, table-column, table-cell, table-caption 元素无效

个人理解：依旧按照static中的位置进行布局，会占据对应的空间，可以使用left等调整位置
## absolute
根据除static以外的第一个父元素的位置进行定位，直到找到window为止 **脱离normal flow**
可以设置外边距margin，且不会与其他边距合并

## fixed

相对于窗口位置不动，固定在窗口位置，不随滚动等操作移动，**脱离normal flow**

## sticky
不常用
## inherit
直接继承父元素position属性的值

<br><br><br><hr>
[CSS标准文档流](https://www.jianshu.com/p/4921ba9e101d)

[css 文档流](https://zhuanlan.zhihu.com/p/102140158)