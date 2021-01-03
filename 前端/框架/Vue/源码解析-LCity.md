# 如何监听变化
- 使用Object.defineProperty()重新定义对象的get和set函数

- 将对象属性的值和其他变量关联起来，从而能够监测变化

> 以下为监测单个属性的代码
```javascript
let user = {
    type: 1;
}
let content = 2;
object.defineProperty(user,'type',{
enumrable:true, //定义此属性是否出现在for in 循环，以及Object.keys()的遍历中
configurable:true, //定义此属性是否可以配置和删除
//取数据的描述符
//eg：let tmp = user.type
get(){
    return content
}
//存数据的描述符
//eg：user.type = 3
set(newValue){
    content = newValue
}
)
```
> 通过定义一个数组对应内容，循环设置一个对象的所有属性
```javascript
class Observer{
    constructor(value){
        this.value = value;
        if(Array.isArray(value))
        {
                //数组的侦听方式
        }
        else
        {
            this.walk(value)
        }
    }
    walk(obj){
        //获取对象的属性列表
        const key = object.keys(obj)
        for(let  i=0 ; i < keys.length ;i++ )
        {
            defineReactive(obj,key[i])
        }
    }
}
function defineReactive(obj,key,val)
{
    if(arguments.length == 2)
    {
        val = obj[key]
    }
    if(typeof val === 'object')
    {
        new Observer(val)
    }
    object.defineProperty(user,'type',{
        enumrable:true, //定义此属性是否出现在for in 循环，以及Object.keys()的遍历中
        configurable:true, //定义此属性是否可以配置和删除
        //取数据的描述符
        //eg：let tmp = user.type
        get(){
            return val
        }
        //存数据的描述符
        //eg：user.type = 3
        set(newValue){
            if(val === newValue)
                {
                    return;
                }
            val = newValue
        }
    )
}
``` 
> 对数组更改的检测方法是通过修改原型的push方法来得到，当进行push等方法对数组进行更改的时候，都可以在新方法中进行监测

> 数组方法的拦截器

```javascript
let arr = [1,2,3]
const arrayProto = Array.prototype;
//保存原有的原型对象
const arrayMethods = Object.create(arrayProto)
//创建1个新的对象，并将获取到的数据原型对象防止到新的对象的原型__proto__上
//将改变数组自身内容的七个方法放置到数组
const methodsToPatch = ['push', 'pop','shift','unshift','splice','sort','reverse']
methodsToPatch.forEach(function(method){
    const original = arrayProto[method]
    Object.defineProperty(arrayMethods,method,{
        enumerable:false,
        configureable:true,
        writable:true,
        value:function(...args)
        {
            //侦听设置数组的操作
            console.log(`通过${method}方法修改数组`)
            //调用原先数组的方法，并返回结果
            const res = original.apply(this,args)
            return res
        }
    })
})
console.log(arrayMethods)
arr.__proto__= arrayMethods;
arr.push(1)
```
# 如何实现依赖收集
> eg:在视图中，当msg发生改变的时候，视图中的msg也会相应的发生改变，以下为实现的讲解
```javascript
<div id = 'app'>
    {{msg}}
<div>
```
**如何实现依赖的收集，如何实现依赖的更改**

```javascript
//依赖管理 dep =>[]
class Dep{
    constructor(){
        this.subs = []
    }
    //添加依赖的方法
    addSub(subs){
        this.subs.push(sub)
    }
    //删除依赖的方法
    removeSub(sub){
        remove(this.subs,sub)
    }
    //添加依赖，定义在window.target 
    //全局变量
    depend(){
        if(window.target){
            this.addSub()
        }
    }
    //定义统治所有依赖更新的方法
    notify(){
        const subs = this.subs.slice()
        for(let i=0,l=subs.length;i<l;i++){
            subs[i].update()
        }
    }
    function remove(arr,item)
    {
        if(arr.length)
        {
            const index = arr.indexOf(item)
            if(index)!=-1
            {
                return 
            }

    }
}

```


# 参考资料
[深入解读Vue源码-架构师必备技能【老陈打码】](https://www.bilibili.com/video/BV1oK4y1e7E3)
