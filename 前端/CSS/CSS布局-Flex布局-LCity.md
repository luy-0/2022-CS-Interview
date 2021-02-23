# 基本概念
首先了解flex的一些基本概念
> 默认存在两根轴：水平的主轴（main axis）和垂直的交叉轴（cross axis）

> 主轴开始的位置称为 main start，主轴结束的位置称为 main end

> 交叉轴开始的位置称为 cross start，交叉轴结束的位置称为 cross end

> 使用 flex 的子元素中，占据的主轴空间叫做 main size，占据的交叉轴空间叫做 cross size
    - 其次了解flex的一些基本属性

<br/><br/><br/>

其次我们来了解flex的一些基本属性

# flex属性
因为较为常用，并且十分方便，所以单独列出来，进行记忆
flex:1 被当作flex-basic
flex:auto 相当于 flex:1 1 auto ,flex-grow | flex-shrink | flex-basis
- basis:主轴方向的初始大小
- grow:获得剩余空间
- shrink:超出范围的收缩规则

# 父容器属性

父容器上有六个属性

- flex-direction：主轴的方向
```javascript
.ele {
  flex-direction: row;                // 默认值，主轴为水平方向，起点在左端。
  flex-direction: row-reverse;        // 主轴为水平方向，起点在右端。
  flex-direction: column;             // 主轴为垂直方向，起点在上。
  flex-direction: column-reverse;     // 主轴为垂直方向，起点在下。
}
```
- flex-wrap：超出父容器子容器的排列样式。
```javascript
.ele {
 flex-wrap: nowrap;          // 默认，不换行
 flex-wrap: wrap;            // 换行，第一行在上方。
 flex-wrap: wrap-reverse     // 换行，第一行在下方。
```
- flex-flow：flex-direction 属性和 flex-wrap 属性的简写形式。
```javascript
.ele{
    justify-content: flex-start;      // 默认，左对齐
    justify-content: flex-end;        // 右对齐
    justify-content: center;          // 居中
    justify-content: space-between;   // 两端对齐，项目之间的间隔都相等。
    justify-content: space-around;    // 每个项目两侧的间隔相等。所以，项目之间的间隔比项目与边框的间隔大一倍。

}
```
- justify-content：子容器在主轴的排列方向。
```javascript
.ele{
    justify-content: flex-start;      // 默认，左对齐
    justify-content: flex-end;        // 右对齐
    justify-content: center;          // 居中
    justify-content: space-between;   // 两端对齐，项目之间的间隔都相等。
    justify-content: space-around;    // 每个项目两侧的间隔相等。所以，项目之间的间隔比项目与边框的间隔大一倍。

}
```
- align-items：子容器在交叉轴的排列方向。
```javascript
.ele{
    align-items: flex-start;    // 交叉轴的起点对齐。
    align-items: flex-end;      // 交叉轴的终点对齐。
    align-items: center;        // 交叉轴的中点对齐。
    align-items: baseline;      // 项目的第一行文字的基线对齐。
    align-items: stretch;       // 默认，如果项目未设置高度或设为auto，将占满整个容器的高度。
}
```
- align-content：多根轴线的对齐方式
```javascript
.ele{
    align-content: flex-start;   // 与交叉轴的起点对齐
    align-content; flex-end;     // 与交叉轴的终点对齐。
    align-content: center;       // 与交叉轴的中点对齐。
    align-content: space-between;// 与交叉轴两端对齐，轴线之间的间隔平均分布。
    align-content: space-around; // 每根轴线两侧的间隔都相等。所以，轴线之间的间隔比轴线与边框的间隔大一倍。
    align-content: stretch;     // 默认 轴线占满整个交叉轴。
}
```
# 子容器属性
- order：子容器的排列顺序
- flex-grow：子容器剩余空间的拉伸比例
- flex-shrink：子容器超出空间的压缩比例
- flex-basis：子容器在不伸缩情况下的原始尺寸
- flex：子元素的 flex 属性是 flex-grow,flex-shrink 和  flex-basis 的简写
- align-self


# 参考资料
[CSS 常见布局方式](https://juejin.cn/post/6844903491891118087)