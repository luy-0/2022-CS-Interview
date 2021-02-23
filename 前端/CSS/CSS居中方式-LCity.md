# CSS的居中方法



## 文本的情况
### line-height

> 适用于子元素为单行文本的情况

> 设置子元素的line-heighth值等于父元素的height /* 垂直 */

### text-align

```CSS
text-align : center; /* 水平 */

```
## 块级元素
```CSS
.center{
    margin:0 auto;
}
```
> 当上下被设置为auto时，会自动变成0

> top + margin-top + border-top-width + padding-top + height + padding-bottom + border-bottom-width + margin-bottom + bottom = height


## 通过不同的display所拥有的属性操作进行居中



### display:inline-block

```CSS
vertical-align:middle /*垂直 */
```

### displat: flex
> flex布局的使用

> flexbox更加灵活

> flex布局具体内容在这篇文章


```css
.out{
    display:flex;
}
.in{
    align-self:center; /*垂直 */
}
```

### display:table-cell

```css
.out{
    display:table;
}
.in{
    align-self:table-cell;
    vertical-align:middle; /*垂直 */
}
```
### 伪元素


## 比较暴力的通过直接移动进行的居中

### 通过隐藏结点,指定长度
```CSS
.hide {
    height:25%;
}
.in {
    height:50%;
}
```
### 通过绝对定位和transform进行移动
```CSS
.out {
    width: 300px ;
    height: 100%;

}
.in {
    position : relative;
    top:50%;      /*先进行移动，移动之后再向反方向移动一半的距离 */
                  /*刚好移动四分之一*/
    left:50%;
    transform : translateY(-50%);
    transform : translateX(-50%);
}
```

<br><br><hr/>
**参考资料**

[CSS垂直居中的8种方法](https://www.cnblogs.com/clj2017/p/9293363.html)

[css实现水平居中的几种方式](http://dengdongxia.com/2018/05/13/2018-05-13-Css-horizontal-centering-method/)

[绝对定位+margin auto垂直居中引发的思考](https://juejin.cn/post/6844904084114259976)




