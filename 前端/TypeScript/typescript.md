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
- 理解为 python 中的 
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