# 前置知识

[Redux]('./Redux/React-redux.md')

# Rematch：Redux 基础上的改进

- 更简洁的代码，避免大量的冗余
- 不用写 action.type,actionCreate
  - **其实就是把这些东西写到了 model 里而已**
  - 文档中的描述十分的棒，写的是真的好
    - 理解模型与回答几个问题一样简单：
    - 我的初始 state 是什么? state
    - 我如何改变 state？ reducers
    - 我如何处理异步 action？ effects with async/await
  > 提一嘴，这里所谓的处理异步，实际上还是调用了reducers中的dispatch方法，只不过是特殊生成了异步函数
- 更加快速的调用 dispatch 的方法
  > 外部调用dispatch，可以先调用store文件中的store，然后使用store提供的dispatch进行以下调用
  - 可以直接通过 dispatch[model][action]\(payload) 的方法调用
  - 或者直接手写对象 dispatch({ type: 'count/increment', payload: 1 })
- _个人理解；Rematch是对 Redux 结构的优化_
- 同时提供 async/await 的异步处理
  - 在model中加一个effects专门保存一步的操作
  - 然后在源码中进行区别处理


# 一般文件结构
> 此处示例代码均可以参考官方文档的TS示例
## store.ts :和App.tsx 同级
- 获得一些常用的方法
- 相当于react-redux中的获得store一步

## models/index.ts 
- 整合各个model，将其整合为一个可以初始化的model
- 包含了一部分CombineReducers的作用
- models文件夹中的其他文件就是我们所需要的各个部分的文件
## Component部分
- 这里就需要把Component组件单独写出来
- 使用Component来显示State中的数据，也就是react-redux中的展示组件部分
- 然后再在另一个文件中，使用Connect将dispatch，state等内容和这个展示组件进行关联

> 
# API

## init

- 通过接收 config，返回对应的 store
- init（config）
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
- 将原有的state，action，reducer抽离，全部写入model，通过models的路径设置actionType
- init()之后将store传给Provider
- 看看代码，思考一下用Redux怎么写，就能够理解了
- [Rematch](https://codesandbox.io/s/mym2x8m7v9)

# 参考资料

[Rematch 中文文档](https://rematch.gitbook.io/handbook/mu-de)

[Rematch 大概是官方文档](https://rematchjs.org/docs/getting-started/installation/)
