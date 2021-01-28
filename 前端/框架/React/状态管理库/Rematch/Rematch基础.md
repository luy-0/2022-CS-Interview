# 前置知识

[Redux]()

# Rematch：Redux 基础上的改进

- 更简洁的代码，避免大量的冗余
- 不用写 action.type,actionCreate
  - **其实就是把这些东西写到了 model 里而已**
  - 文档中的描述十分的棒，写的是真的好
    - 理解模型与回答几个问题一样简单：
    - 我的初始 state 是什么? state
    - 我如何改变 state？ reducers
    - 我如何处理异步 action？ effects with async/await
- 更加快速的调用 dispatch 的方法
  - 可以直接通过 dispatch[model][action](payload) 的方法调用
  - 或者直接手写对象 dispatch({ type: 'count/increment', payload: 1 })
- _个人理解；是对 Redux 结构的优化_
- 同时提供 async/await 的异步处理
  - 在model中加一个effects专门保存一步的操作
  - 然后在源码中进行区别处理

# 示例

- match

```ts
import { init } from "@rematch/core";

// 定义一个model，包含了之前redux中的一些内容
// 拥有对应的state和reducers

//model
const count = {
  state: 0,
  reducers: {
    upBy: (state, payload) => state + payload,
  },
};
// 使用init初始化
// 相当于Redux中的store
init({
  models: { count },
});
```

- View

```ts
import { connect } from "react-redux";

// Component
// 将count内容赋值给count
const mapStateToProps = (state) => ({
  count: state.count,
});
// 将指定动作传输给组件
const mapDispatchToProps = (dispatch) => ({
  countUpBy: dispatch.count.upBy,
});

connect(mapStateToProps, mapDispatchToProps)(Component);
// connect倒是没有怎么变
```

# Redux如何变成Rematch
- 将原有的state，action，reducer抽离，全部写入model
- init()之后将store传给Provider
- 看看代码，思考一下用Redux怎么写，就能够理解了
- [Rematch](https://codesandbox.io/s/mym2x8m7v9)


# API

## init

- 通过接收 config，返回对应的 store
- init（config）

# 参考资料

[Rematch 中文文档](https://rematch.gitbook.io/handbook/mu-de)
