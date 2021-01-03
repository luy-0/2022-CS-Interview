> ES6中默认采用严格模式，所以this不会自动只想window对象

# 变量声明方式
- let
    - 在当前作用域中创建新的变量，变量只能够在当前作用域中使用
- const
    - 同样创建变量，但是不允许修改该变量的值
# 箭头函数
> 自动将函数中的this绑定在上一层非箭头函数的作用域中

> 同时，箭头函数也无法访问arguments对象，但是可以访问外围函数的arguments

> 无法通过new关键字调用

> 没有原型，super

# 模板字符串
使用 `` 将整个字符串包裹起来，而在其中使用 ${} 来包裹一个变量或者一个表达式

相当于使用更加简单的方式实现 a + "+" + b
```javascript
// es6
const a = 20;
const b = 30;
const string = `${a}+${b}=${a+b}`;

// es5
var a = 20;
var b = 30;
var string = a + "+" + b + "=" + (a + b);
```
# 解析结构

# class
> 实际上还是语法糖的一种的感觉

> class中的this指向实例时的对象
## constructor 构造方法
用来创建并初始化一个对象，可以通过super关键字，调用父类的constructor方法
## static 静态方法
可以通过调用类的方法，用classname.staticfunname 的方法调用
## extends 继承
```javascript
class A {
     constructor(){
            this.name = 'Marry'
            this.age= 18
        }
    read(){console.log(this.name+this.age)}
}
class B extends A {
    constructor(props) {
        super(props)
    }
    s(){
        console.log(this.name+this.age)
    }
}
var b = new B();
b.s()
```
extends指定了B的父类为A，同时在构造函数中调用了父类的构造函数

在b类中也创建出了name和age属性



# 展开运算符
```javascript
const arr1 = [1, 2, 3];
const arr2 = [...arr1, 10, 20, 30];

// 这样，arr2 就变成了[1, 2, 3, 10, 20, 30];
```

# Symbol

# for of

# promise
> 链接至本文目录

# ES2017
## async
> Generator 的语法糖
```javascript
// 使用 generator
var fetch = require('node-fetch');
var co = require('co');

function* gen() {
    var r1 = yield fetch('https://api.github.com/users/github');
    var json1 = yield r1.json();
    console.log(json1.bio);
}

co(gen);


// 使用 async
var fetch = require('node-fetch');

var fetchData = async function () {
    var r1 = await fetch('https://api.github.com/users/github');
    var json1 = await r1.json();
    console.log(json1.bio);
};

fetchData();
```




<hr>

# 参考资料

[前端基础进阶（十六）：es6常用基础合集](https://www.jianshu.com/p/cfb0893c34f1)

[ES6系列](https://github.com/mqyqingfeng/Blog)