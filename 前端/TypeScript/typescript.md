# 概念
- JS的超集，因为JS原有的类型是弱类型，导致变量能够被多次赋值，在编写和运行过程中产生各种不必要的问
- 而 TypeScript 通过增加类型设定的方法很好的解决了这个问题
- 使得变量重新拥有了类型，更容易找出错误
- 甚至通过这种增添类型的方式，让JS拥有了一种
- 这玩意儿好像更能面向对象的错觉 
- （事实上他确实能支持面向对象，甚至还能写模版类）

# 语法
## 断言

``` 值 as 类型     <类型>值```
### 处理问题
- 联合类型传递参数时无法调用具体属性
### 作用
- 将传入参数断言为联合属性中的某一属性，就可以调用转换类型中的任意属性
- 将父类断言为更加具体的子类，使其能够使用子类的属性和方法
- 将任意一个类型断言为any，逃避报错，在运行中减少错误（我怎么觉得这种情况要慎用一不注意要爆呢。。）
- 将any断言为具体的一个属性
- **个人理解**：结合上面几个作用来看，断言的作用其实有点像强制类型转换，但是他的这种转换是在有关联的互相兼容的类之间的转换。


# 新类型
## 元组（Tuple）
```ts
// Declare a tuple type
let x: [string, number];
// Initialize it
x = ["hello", 10]; // OK
// Initialize it incorrectly
x = [10, "hello"]; // Error
```
## 枚举（Enum）

## 未知（Unknown）

## 任意（Any）
- 常见与类型推断
## void

## null and Undefined

## nerver

## object

# interface
- 指定对象内容的类型和对象的内容
- 个人理解：一个检查对象内容的模版
```ts
interface example<T>
{
    name:string;
    nickname?:string;
    add:(obj:T)=>void;
}
```
- ?可选
# class
## public
## implents
- 从接口生成类
- 多重继承
## 元素
- 可以定义类成员，同时必须定义类成员的类型
- 类成员和类函数在作为实参传入函数时，也是可以进行接口判断
> 个人理解：TS的所谓接口，不过就是在对应对象中查找是否存在此类型属性，只要记住这一点，其他的问题都不大


# 语法
## 函数
- 函数的返回值和参数可以指定类型 
```ts
function getUser():User{

}

function addUser(user:User){

}
```
- 当传入的实参对象的属性多与指定接口时，会将多余的属性进行擦除(Erased)，然后作为对应形参传入
```ts
interface Pointlike {
  x: number;
  y: number;
}
interface Named {
  name: string;
}

function logPoint(point: Pointlike) {
  console.log("x = " + point.x + ", y = " + point.y);
}

function logName(x: Named) {
  console.log("Hello, " + x.name);
}

const obj = {
  x: 0,
  y: 0,
  name: "Origin",
};

logPoint(obj);
logName(obj);
```
## 变量
- 可以指定变量的类型,如果不指定，则会根据初始值自己确定
- 

## 合成类
type yourTypeName = element1 | element2 | element3;
- 通过将已有的几种内容进行合并创建自己的类型
- 同时也可以直接使用，而不使用typeName保存
```ts
function getLength(obj: string | string[]) {
  return obj.length;
}
```

# 泛型（Generics）
- 可以回想一下C++ stl中的 vector\<int>
- TS中的Array就是支持这种操作的
- TS中也支持自己去设置，这不就是模版类么（摔）
- declare

# 断言 （as）


# declare（声明文件）
- 对外部引入的函数进行判断，判断是否合规
# 参考资料
[TS官方文档](https://www.typescriptlang.org/docs/handbook/)