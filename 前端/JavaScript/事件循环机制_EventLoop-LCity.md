# 前置知识
- 执行上下文（Execution context）
- 函数调用栈（call stack）
- 队列数据结构（queue）
- Promise

# 开始
> 首先请先清楚**JavaScript是单线程**，这个线程中有唯一的一个事件循环

在代码执行过程中，代码通过函数调用栈和任务队列来确定代码的运行顺序

任务队列又可以进一步细分为
- 宏任务（macro-task，新标准中被称为task)
    - 宏任务包括
    - 整体代码
    - setTimeout
    - setInterval
    - serImmediate
    - DOM事件回调
    
- 微任务（micro-task，新标准中被称为jobs）
    - 微任务包括
    - Promise

- 任务源：serTimeout/Promise等操作，**进入任务队列的是他们指定的具体执行任务**

# 事件循环的顺序

- 首先，从整体开始循环，全局上下文进入函数调用栈，直到调用栈清空
- 其次，开始执行所有micro-task
- 再其次，执行完所有micro-task之后，循环从macro-task开始，
- 以此往复，执行完毕后，再从micro-task开始执行

**举个栗子**（假装有个表情包）
```javascript
setTimeout(function() {
    console.log('timeout1');
})
console.log('global0');
new Promise(function(resolve) {
    console.log('promise1');
    for(var i = 0; i < 1000; i++) {
        i == 99 && resolve();
    }
    console.log('promise2');
}).then(function() {
    console.log('then1');
})
console.log('global1');
```

- 首先，进行第一个宏任务 ， 从 script 开始，碰到 setTimeout 将 timeout1 放入宏队列
- 之后，碰到 new Promise,构造函数的第一个参数在 new 的时候执行，直接执行，输出promise1和promise2
- 后续的then放入 micro-task 队列，
- 将global压入调入栈，输出global
- 然后 执行所有的micro-task，输出then1
- 然后 执行macro-task

> 聪明的你看到这儿一定会觉得 “就这”，好了，我要加速了

不常见API说明
- setImmediate ： 将任务分发到对应的任务队列中，并且将会在setTimeout后面执行
- nextTick：会比Promise限制想，直到队列中的可执行任务执行完毕，才执行Promise队列中的内容
```javascript

console.log('golb1');

setTimeout(function() {
    console.log('timeout1');
    process.nextTick(function() {
        console.log('timeout1_nextTick');
    })
    new Promise(function(resolve) {
        console.log('timeout1_promise');
        resolve();
    }).then(function() {
        console.log('timeout1_then')
    })
})

setImmediate(function() {
    console.log('immediate1');
    process.nextTick(function() {
        console.log('immediate1_nextTick');
    })
    new Promise(function(resolve) {
        console.log('immediate1_promise');
        resolve();
    }).then(function() {
        console.log('immediate1_then')
    })
})

process.nextTick(function() {
    console.log('glob1_nextTick');
})
new Promise(function(resolve) {
    console.log('glob1_promise');
    resolve();
}).then(function() {
    console.log('glob1_then')
})

setTimeout(function() {
    console.log('timeout2');
    process.nextTick(function() {
        console.log('timeout2_nextTick');
    })
    new Promise(function(resolve) {
        console.log('timeout2_promise');
        resolve();
    }).then(function() {
        console.log('timeout2_then')
    })
})

process.nextTick(function() {
    console.log('glob2_nextTick');
})
new Promise(function(resolve) {
    console.log('glob2_promise');
    resolve();
}).then(function() {
    console.log('glob2_then')
})

setImmediate(function() {
    console.log('immediate2');
    process.nextTick(function() {
        console.log('immediate2_nextTick');
    })
    new Promise(function(resolve) {
        console.log('immediate2_promise');
        resolve();
    }).then(function() {
        console.log('immediate2_then')
    })
})

```

> setTimeout中调用setTimeout的时候，依旧会放入setTimeout，只不过会在下一次循环中进行

> 其余情况同理

<br/><br/>

**Doctor，还不能休息哟(＾Ｕ＾)ノ~ＹＯ**
```javascript
    /*
    宏: []
    微: []
    */
    const first = () => (new Promise((resolve, reject) => {
      console.log(3)
      let p = new Promise((resolve, reject) => {
        console.log(7)
        setTimeout(() => {
          console.log(5)
          resolve(6)
        //会被忽略，因为会先执行微队列里的resolve(1)，此时状态已经改变过了，且状态只能改变一次
        }, 0)
        resolve(1)
      })
      resolve(2)
      p.then((arg) => {
        console.log(arg)
      })
    }))

    first().then((arg) => {
      console.log(arg)
    })
    console.log(4)
```
<hr>

```javascript
    
    setTimeout(() => { //time1
      console.log("0")
    }, 0)
    new Promise((resolve, reject) => {
      console.log("1")    //pro1
      resolve()
    }).then(() => {
      console.log("2")   //then2
      new Promise((resolve, reject) => {
        console.log("3")  //pro3
        resolve()
      }).then(() => {
        console.log("4")  //then4
      }).then(() => {
        console.log("5") //then5
      })
    }).then(() => {
      console.log("6") //then6
    })

    new Promise((resolve, reject) => {
      console.log("7") //pro7
      resolve()
    }).then(() => {
      console.log("8")  //then8
    })
```

> 答案一： 3 7 4 1 2 5

> 答案二： 1 7 2 3 8 4 6 5 0 
对答案二的解释：
- 为了区分内容对所有输出语句进行了标记
- 第一遍： 宏[time1] 微[then2,then8] 立即输出 pro1 ，pro7
- 第二遍： 微不为0，故运行微，运行 then2，输出then2，pro3，然后将then4 入微队列，然后pro3的回调结束，进行then2的下一个回调，即then6
- then2运行结束，微[then8,then4,then6],输出then2，pro3
- 队列还是没有输出结束，运行 then8 ，直接输出 then8 ，微队列变为[then4,then6]
- 继续运行，then4运行，输出then4，then5入队，微队列变为[then6,then5]
- 运行then6，输出 then6 结束，没有新的入队
- 运行then5，输出 then5 结束，没有新的入队
- 微队列 为空，所以执行宏队列，输出 time0

# 参考资料
[前端基础进阶（十四）：深入核心，详解事件循环机制](https://www.jianshu.com/p/12b9f73c5a4f)