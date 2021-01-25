# Promise
- 返回一个Promise对象，使用该对象来注册处理结果和错误的回调
- 同时可以串联.then 和 .catch
## 本质
- 最终要被交付的结果的容器
- 可以注册监听器的对象（指运行resolve之后能够按需执行下来的代码）
### 例子
```javascript
function addAsync(x, y) {
  return new Promise(
    (resolve, reject) => { // (A)
      if (x === undefined || y === undefined) {
        reject(new Error('Must provide two parameters'));
        //将这个error对象传递给.catch
      } else {
        resolve(x + y);
        //将值传递给then
      }
    });
}

addAsync(3, 4)
  .then(result => { // success
    assert.equal(result, 7);
  })
  .catch(error => { // failure
    assert.fail(error);
  });
```
- 一个 Promise 中包含几个状态
  - Pending
  - fulfilled
  - rejected
  - 而resolve和reject的执行则会导致这些状态的变化
  - 具体可以参考[手写实现Promise](https://segmentfault.com/a/1190000023180502)
  - 个人觉得是写的最好的手写实现代码和相关解释了
### .then
- 返回一个新的Promise
### 回调返回一个非Promise值
- 直接作为值传递给下一个.then()
```javascript
Promise.resolve('abc')
.then(str => {
  return str + str; // (A)
})
.then(str2 => {
  assert.equal(str2, 'abcabc'); // (B)
});
```

### 回调返回一个Promise
```javascript
Promise.resolve('abc')
.then(str => {
  return Promise.resolve(123); // (A)
})
.then(num => {
  assert.equal(num, 123);
});
```
- 个人理解：替换原本执行 .then()创建的Promise而使用当前返回的这个值作为返回的Promise
- 非Promise返回值时，原本的.then()会对返回结果进行封装后返回

### 抛出异常

### .catch
- 和then的区别仅有，.catch由reject触发，将其回调的操作转换为Promise
### Promise.resolve()
- 创建一个被给定值履行的Promise
- 即一般Promise创建后状态默认为 pending
- 而以这样方式创建的promise状态为fulfill
```javascript
Promise.resolve(123)
.then(x => {
  //此处传入的x就是123，因为运行来resolve所以直接执行then
});
```
### Promise.reject()
- 大概同上

## Promise的优势
- 回调上更加清晰
- 链式调用更加清晰

## 举例
1. 对于需要获得返回文本的网络请求
### 传统的回调函数
```js
import * as fs from 'fs';
fs.readFile('person.json',
  (error, text) => {
    if (error) { // (A)
      // Failure
      assert.fail(error);
    } else {
      // Success
      try { // (B)
        const obj = JSON.parse(text); // (C)
        assert.deepEqual(obj, {
          first: 'Jane',
          last: 'Doe',
        });
      } catch (e) {
        // Invalid JSON
        assert.fail(e);
      }
    }
  });
```
### 使用Promise优化
```js
readFileAsync('person.json')
.then(text => { // (A)
  // Success
  const obj = JSON.parse(text);
  assert.deepEqual(obj, {
    first: 'Jane',
    last: 'Doe',
  });
})
.catch(err => { // (B)
  // Failure: file I/O error or JSON syntax error
  assert.fail(err);
});

//此处可以考虑一下如何实现 readFileAsync()
```
2. http

# async/await
async ： 异步的缩写
await ： async wait 的缩写
**await只能出现在async中**


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

[理解 JavaScript 的 async/await](https://segmentfault.com/a/1190000007535316)

[37.异步编程的 Promise](https://github.com/apachecn/impatient-js-zh/blob/master/docs/45.md)