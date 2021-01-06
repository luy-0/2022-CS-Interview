# async/await


# 方法
## Promise.all()
Promise.all可以将多个Promise实例包装成一个新的Promise实例，同时执行多个异步任务

同时，成功和失败的返回值是不同的，成功的时候返回的是一个结果数组，而失败的时候则返回最先被reject失败状态的值。

```javascript
let p1 = new Promise((resolve, reject) => {
  resolve('成功了')
})

let p2 = new Promise((resolve, reject) => {
  resolve('success')
})

let p3 = Promise.reject('失败')
let p4 = Promise.reject('fail')
Promise.all([p1, p2]).then((result) => {
  console.log(result)               //['成功了', 'success']
}).catch((error) => {
  console.log(error)
})

Promise.all([p1,p4,p3,p2]).then((result) => {
  console.log(result)
}).catch((error) => {
  console.log(error)      // 失败了，打出 '失败'
})
```
**返回的数组顺序和Promise接收到的数据顺序一致，即使p2比p1先获得结果，在数组中，p1还是在p2的前面**
## Promise.race()
和all()类似，接收Promise集合作为但是race中成功和失败状态都是返回最先获得的那个

# async
> 题目描述：<br/>代码执行时，立即输出 0，之后每隔 1 秒依次输出 1,2,3,4，循环结束后在大概第 5 秒的时候输出 5（这里使用大概，是为了避免钻牛角尖的同学陷进去，因为 JS 中的定时器触发时机有可能是不确定的

```javascript
// 模拟其他语言中的 sleep，实际上可以是任何异步操作
const sleep = (timeountMS) => new Promise((resolve) => {
    setTimeout(resolve, timeountMS);
});

(async () => {  // 声明即执行的 async 函数表达式
    for (var i = 0; i < 5; i++) {
        await sleep(1000);
        console.log(new Date, i);
    }

    await sleep(1000);
    console.log(new Date, i);
})();



```
# 参考资料
[理解和使用Promise.all和Promise.race](https://www.jianshu.com/p/7e60fc1be1b2)
[80% 应聘者都不及格的 JS 面试题](https://juejin.cn/post/6844903470466629640)