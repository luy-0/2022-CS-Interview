
# JS的调用

### js在HTML中的添加方式

- 直接添加

- - 在head 和body中都可以使用
  - 使用\<script\> 标签进行声明使用

- 调取同目录文件

- - ```javascript
    <script src="myScript.js"></script>
    ```

    - myScript.js是保存了所需内容的js文件
    - 此处调用文件时需考虑文件路径，详情点击HTML文件路径

- - 分离了 HTML 和代码
  - 使 HTML 和 JavaScript 更易于阅读和维护
  - 已缓存的 JavaScript 文件可加速页面加载

**提示：**把脚本置于 **<body>** 元素的底部，可改善显示速度，因为脚本编译会拖慢显示。

### JS调用HTML中的元素

document.getElementById(id) 

```html
<p id="demo"></p>
#定义id为demo的html元素
<script>
 document.getElementById("demo").innerHTML = 5 + 6;
#通过命令找到并进行相应的修改
</script>
```

**提示：**更改 HTML 元素的 innerHTML 属性是在 HTML 中显示数据的常用方法。

# JS输出方案

JavaScript 能够以不同方式“显示”数据：

- 使用 ==window.alert()== 写入警告框
- 使用 ==document.write()== 写入 HTML 输出
  - 将删除所有已有的HTML
  - 仅用于测试
- 使用 ==innerHTML== 写入 HTML 元素
- 使用 ==console.log()== 写入浏览器控制台
  - 在控制台显示相关数据
- 使用 window.alert()
  - 用警告框来显示数据

# JS语句

- **在 HTML 中，JavaScript 语句是由 web 浏览器“执行”的“指令”。**
- 一般使用分号结束语句
- 忽略多个空格
- 折行并不影响
- 代码块
  -  {}  定义一同执行的语句

- Js注释
  - 双斜杠 // 或 /* 与 **/* 之间的代码被视为*注释*。
- 对大小写敏感

**总结：**总体风格其实有点类似c++

## 运算符

和C++类似

### 幂

- 取幂运算符（**）将第一个操作数提升到第二个操作数的幂。

### 递减

- *递减*运算符（--）对数值进行递减。

### 递增

- *递增*运算符（++）对数值进行递增

### 取模

- %

### 位运算

- 和C++相似

### 等号

#### ==

检查值相等，会进行类型转换

#### ===

检查值和类型相等，不进行转换



## 表达式

- 从左到右进行计算

## 循环分支

循环，分支等语法类似C语言
定义整数前面需要使用var代替int

### 循环

- 语法类似C++
  - while
  - for 语法类似C++
  - 同样有break等

### 条件

- 语法类似C++
  - if
  - else
  - else if 
  - switch

# JS变量

- 变量声明
  - 使用**var**声明变量
  - 一个变量可以被多次重定义，规则有些类似python
  - 变量名/标识符的命名规则和C++类似
  - var 类型转变类似python
- var num=12；
  - 前面不需要指定变量类型

## 数据类型

JS的类型为**动态类型**

在执行过程中，类型可变

### 可以直接定义之后自动全局

ES5新增严格模式使用“use stict”声明

不允许自动全局

定义变量必须使用var

### 类型转换

#### 显式



#### 隐式



### 数字

- 是否使用小数点均可
- 也可以使用科学计数法

### 字符串

- 定义方式
  - 直接通过原始值定义
  - 通过new对象来定义
  - 当使用 == 运算符时，相等字符串是不相等的，因为 \=== 运算符需要类型和值同时相等。

- 使用单引号或双引号均可
- 字符串支持增删改查操作，spilit，join等操作
- 转义字符

#### 字符串方法

- length 返回字符串长度

- indexOf("字符”)返回字符串中指定文本首次出现的位置

  - lastIndesOf（）返回最后一次的
  - 没有找到的返回-1
  - 开始位置从0开始计算
  
- 提取部分字符串的方法
  
  - slice(*start*, *end*)
      - 提取字符串的某个部分，并在新字符串中返回被提取的部分
  - substring(*start*, *end*)
      - 和上面的类似，但是不接受负索引
  - substr(*start*, *length*)
      - 不同之处在于第二个参数是长度

- 替换字符串的内容
  - replace（）
    - 用另一个值替换字符串中指定的值
    - 大小写敏感

- 大小写转换
  - 通过 toUpperCase() 把字符串转换为大写
  - 通过 toLowerCase() 把字符串转换为小写：
- concat（）方法
  - 链接两个或多个字符串
  - 或者直接使用“+”
  
  
  



### 布尔

- 表示真假，直接使用true或false声明即可

### 数组

- 用方括号熟悉些，项目由都好分隔开 

- ```
  var fruits = ["Banana", "Orange", "Apple", "Mango"];
  ```

#### 数组方法

- toString（）将数组转化为带有"，“的字符串·

- join（）将所有数组元素结合为一个字符串，可以自己定义分隔符

- pop（）删除最后一个元素

- push（）在末尾添加一个元素，返回新数组的长度
- filter(callback) 返回一个数组，包含了所有使用调用函数返回了真值的元素，回调函数的返回值是boolean
- map（callback） 同样是返回一个数组，包含对每个元素进行一次操作的元素，返回值是元素的类型
- foreach() 仅仅是将元素作为值传入进行运行

- 可以通过下标修改，同时也可以通过下标添加元素 fruits[fruits.length] = "Kiwi";  

- shift（）删除第一个元素

- 可以使用concat（）的方法连接两个数组

- slice（）切片操作，可以切对应位置的数组，返回新的数组

- 数组序列操作

  - 有点类似python
  - sort直接对数组元素排序
  - reverse直接反转内部内容

- forEach() 方法为每个数组元素调用一次函数（回调函数）

  **注：**更多请参考Array特性

### 对象

- 使用花括号声明和定义

- 对象属性使用**name：value**（被称为对象的**属性**），由逗号分隔

  - 对象也可以声明函数

  -  ```
    var person = {firstName:"Bill", lastName:"Gates", age:62, eyeColor:"blue"};
    ```

- 您能够以两种方式访问属性：

  - ```
    objectName.propertyName
    person.lastName;
    ```
  ```
  - ```
  objectName["propertyName"]
  person["lastName"];
  ```



### typedef

- 用来确定变量的类型

- ```
  typeof 0                   // 返回 "number"
  typeof 314                 // 返回 "number"
  typeof 3.14                // 返回 "number"
  typeof (7)                 // 返回 "number"
  typeof (7 + 8)             // 返回 "number"
  typeof ""                  // 返回 "string"
  typeof "Bill"              // 返回 "string"
  typeof "Bill Gates"          // 返回 "string"
  ```



## 强制类型转化

int型自带 Tostring（a.Tostring())，对于不带的类型直接使用string
Boolean

parseFloat，parseInt转换成浮点型和整型



### 方法

- `pop()` 方法，删除并返回数组的最后一个元素。
- `push()` 方法，向数组的末尾添加一个或更多元素，并返回新的长度。
- `reverse()` 方法，颠倒数组的顺序。直接对本来的数组进行操作

- `shift()` 方法，删除并返回数组的第一个元素。

- `unshift()` 方法，向数组的开头添加一个或更多元素，并返回新的长度。

- `slice()` 方法，从某个已有的数组返回选定的元素。语法为：

  左闭右开，取此区间内的内容多维数组

- arrayObject.sort(sortby);



### 多维数组







# JS函数

函数设定方法如下：

```javascript
function functionName(parameters) {
  // 执行的代码
}

```

使用上面的例子，toCelsius 引用的是函数对象，而 toCelsius() 引用的是函数结果。

## 作用域 ##

- 作用域等规则和C++类似

- 变量会被提升

### 词法作用域

#### 欺骗词法

会导致无法优化，运行时间减少



##### eval

直接将导入的字符串视作文本进行解析

###### with

可以看作引用

我觉得还有点像命名空间，可以快捷的处理对象的属性

#### 函数作用域

###### 函数表达式

被绑定在函数表达式自身的函数中，只有在这个作用域中才能调用

###### 函数声明

函数被绑定在声明所在的作用域中，可以直接调用

可以看作记忆并在函数运行完毕后继续访问这个函数作用域



#### 块作用域

部分语句创建的作用域

##### 作用

- 垃圾收集
- let循环：将let绑定在具体作用域中（比如for）

- if：在if和else里面都能够使用
- try/catch：catch会创建一个块作用域，从而声明的变量仅在catch内部有效

##### let

- 除var之外的另一种变量分类方式
- 可以将变量绑定道所在的任意作用域中
- 同时使用let的声明也不会在块作用域中进行提升

###### const

#### 提升

- 变量和函数的声明会被在代码执行前被首先处理
- 每个作用域都会进行提升操作，大作用域被提升的同时，下属的作用域也会进行提升

### 查询

- 作用域查找回在找到第一个匹配的标识符时停止

#### 当变量出现在赋值操作的左侧时进行LHS查询

试图找到变量的容器本身，从而对其进行赋值

需要对这个变量的容器做出改变

非严格模式时，如果最终没有找到这个变量，全局作用域就会创建一个具有该名称的变量

严格模式时，会抛出ReferenceError



#### 当变量出现在赋值操作的右侧时进行RHS查询

查找变量的值，仅仅需要变量的值进行使用

### 作用域嵌套

- 对变量的查询会沿着作用域逐层上升查找
- 多层嵌套的作用域中可以定义同名的标识符，叫做（遮蔽效应）
- 全局变量会自动成为全局对象（比如window对象）的属性



## 匿名函数

不设定函数名，直接绑定在事件上

var myButton = document.querySelector("button");

myButton.onclick = function () {
  alert("hello");
};

#### 缺点

- 没有有意义的函数明，调试困难
- 调用一次方便，多次调用需要用过期的arguments.callee引用



## 作为值的函数

函数本身可以作为变量向其他函数传递（函数指针？）

### 立即调用函数表达式

**（function IIFE（）{}）（）**




# 对象

## 语法

### 定义

* `` var myobj={key:value ....};``

* ``` var myobj= new Object();
  myobj.key=value;
  ```

### 访问

* ``myobj.key;``
* ``myobj[“key”]``
* 第二种访问方式，访问的键中可以使用空格等字符
* ES6 可计算属性名 将变量作为属性名提供访问


### 类型

* 基础类型
* string，number，boolean，null，undefined，object
* 内置对象
* String，Number，Boolean，Object，Function，Array，Date，RegExp，Error
* 大部分操作都会将基础类型转化为对应的内置对象

### 复制

* 浅复制 只是引用
* 深复制

### 属性描述符

ES5提供检测属性的方法

* Writable 是否可以修改
* Configurable 是否可配置，可以使用``defineProperty（）``来修改属性描述符，默认并且强制设置为false，并且Configurable这个属性不允许删除
* Enumerable 是否会出现在对象的属性枚举当中

#### 如何实现属性的不变性

* 对象常量:设置writable为false
* 禁止扩展：preventExtensions（），在非严格模式下，创建属性b会静默失败
* 密封 
  *  .seal 创建一个密封的对象，在一个现有对象上调用
  * preventExtensions 将所有现有属性标记为configurable：false
  * 密封之后不仅不能添加新属性，也不能重新配置或者删除任何现有属性
* 冻结
  * freez 糊穿见一个冻结对象，在一个现有对象上调用seal，并把数据方位属性标记为writable：false
  * 会禁止对于对象本身及其任意直接属性的修改
  * 深度冻结，对当前对象所有引用的对象进行冻结

#####  [[GET]]

每一次对属性的调用，都是一次Get操作，如果访问当前词法作用域中不存在的变量，会抛出ReferenceError异常

##### [[PUT]]

给对象的属性赋值会触发put，触发之后会进行下列的检查

- 属性是否是访问描述符？如果是并且存在setter
- 检查writable是否是false
- 如果都不是，设置该值为属性的值

##### Getter & Setter

ES5中可以使用这两个对属性进行调用，

#### 存在性

- hasOwnProperty（），在不访问

- “属性名称” in myObject ， 

##### 枚举

当enumerable为true的时候，变量才会出现在for(var c in object)中

同时也可以使用propertyIsEnumerable（）检查属性名是否直接存在于对象中

### 遍历

ES5增加了数组辅助迭代器，包括forEach（），every（），some（），各种辅助迭代器可以接受一个回调函数并把它应用到数组的每个元素上，唯一的区别就是他们对于回调函数返回值的处理方式不同

- forEach 忽略会回调函数的返回值
- every      运行直到回调函数返回false
- some      运行指导回调函数返回true
- 特殊的返回值类似于break
- 

#  JS错误

**try 语句使您能够测试代码块中的错误。**

**catch 语句允许您处理错误。**

**throw 语句允许您创建自定义错误。**

**finally 使您能够执行代码，在 try 和 catch 之后，无论结果如何。**







# JSON

JSON是JS的子集，JS对象表示法，用来传输由属性值或者序列性的值组成的数据对象，和其他程序进行交互

## 语法



当前很多编程语言都支持 JSON 格式数据的生成和解析。

- **只包含数据，不包含方法**
- **属性需要通过双引号引起来**

- **两头有{}来使其合法**

- 



# JS事件

## HTML事件

- HTML 网页完成加载
- HTML 输入字段被修改
- HTML 按钮被点击

通常，当事件发生时，用户会希望做某件事。

JavaScript 允许您在事件被侦测到时执行代码。

通过 **JavaScript 代码**，HTML 允许您向 HTML 元素添加事件处理程序。

```
<element event="一些 JavaScript">
```

```
<button onclick='document.getElementById("demo").innerHTML=Date()'>现在的时间是？</button>
```

## 常见的 HTML 事件

下面是一些常见的 HTML 事件：

| 事件        | 描述                         |
| :---------- | :--------------------------- |
| onchange    | HTML 元素已被改变            |
| onclick     | 用户点击了 HTML 元素         |
| onmouseover | 用户把鼠标移动到 HTML 元素上 |
| onmouseout  | 用户把鼠标移开 HTML 元素     |
| onkeydown   | 用户按下键盘按键             |
| onload      | 浏览器已经完成页面加载       |



# 常用函数

- **console.log（）**在控制台输出对应日志
- **alert()**   弹出对应错误
- **document.write("“)**  产出对应文本



## 常用内置对象

### Array



### Math

1. Math 对象的常用属性：

- E ：返回常数 e (2.718281828...)。
- LN2 ：返回 2 的自然对数 (ln 2)。
- LN10 ：返回 10 的自然对数 (ln 10)。
- LOG2E ：返回以 2 为底的 e 的对数 (log2e)。
- LOG10E ：返回以 10 为底的 e 的对数 (log10e)。
- PI ：返回 π（3.1415926535...)。
- SQRT1_2 ：返回 1/2 的平方根。
- SQRT2 ：返回 2 的平方根。

1. Math 对象的常用方法：

- `abs(x)` ：返回 x 的绝对值。
- `round(x)` ：返回 x 四舍五入后的值。
- `sqrt(x)` ：返回 x 的平方根。
- `ceil(x)` ：返回大于等于 x 的最小整数。
- `floor(x)` ：返回小于等于 x 的最大整数。
- `sin(x)` ：返回 x 的正弦。
- `cos(x)` ：返回 x 的余弦。
- `tan(x)` ：返回 x 的正切。
- `acos(x)` ：返回 x 的反余弦值（余弦值等于 x 的角度），用弧度表示。
- `asin(x)` ：返回 x 的反正弦值。
- `atan(x)` ：返回 x 的反正切值。
- `exp(x)` ：返回 e 的 x 次幂 (e^x)。
- `pow(n, m)` ：返回 n 的 m 次幂 (nm)。
- `log(x)` ：返回 x 的自然对数 (ln x)。
- `max(a, b)` ：返回 a, b 中较大的数。
- `min(a, b)` ：返回 a, b 中较小的数。
- `random()` ：返回大于 0 小于 1 的一个随机数。



## 参考资料



