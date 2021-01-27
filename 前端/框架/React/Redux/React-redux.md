# React 和 Redux 的连接


# 数据流
> 进行一次数据的传递来再次描述整个过程
1. store.dispatch(action)
    - 向store传递action，描述发生事件
    - {type:  , payload:   }
2. store调用传入的reducer
    - store收到action之后，会将当前的state树和action传给reducer
3. 根reducer 将state传入之后，运行各个子reducer，将返回值拼接成**新的，单一的**state树
    - redux原生的 conbineReducers() 能够完成这个任务
4. Redux store 保存 根reducer返回的完成state树
- 所有定于store.subscribe(lister)的监听器都将被调用
- 同时可以使用新的state来更新视图


# Action

- 设置 Action 创建函数
- Action 包括 type 和 payload，通过 Action 创建函数，可以更快速的创建所需的 Action
- 将创建出的 Action 传递给 dispatch(),就能够发起一次 diapatch
- react-redux 中提供了 store.dispatch()函数
- 使用 connect()调用 dispatch 方法更多

## connect

- mapStateToProps(state, ownProps) 方法
  - 如何将当前Redux store state 映射到展示组件props中
  - 将 store 作为 props 绑定到组件中
  - 只要 store 更新了就会调用 mapStateToProps 方法
  - mapStateToProps 返回的结果必须是 object 对象，该对象中的值将会更新到组件中
  - **返回对应所需的 state**
    ```js
    const mapStateToProps = (state) => {
      return {
        count: state.counter.count,
      };
    };
    ```

- mapDispatchToProps(dispatch, [ownProps])
  - 接收diapatch()方法，返回期望注入到展示组件props中的回调方法
  - 人话：让展示界面的按钮事件和dispatch方法进行绑定
  - 示例
```js
    // 这里：将onTodoClick事件和dispatch事件绑定
    // 当onTodoClick事件发生时，传递一个dispatch事件
    const mapDispatchToProps = dispatch => {
    return {
    onTodoClick: id => {
      dispatch(toggleTodo(id))
        }
        }
    }
```
  - 将 action 作为 props 绑定到组件中
  - mapDispatchToProps 希望你返回包含对应 action 的 object 对象
  - 返回对应的 action
    ```js
    const mapDispatchToProps = (dispatch, ownProps) => {
      return {
        increase: (...args) => dispatch(actions.increase(...args)),
        decrease: (...args) => dispatch(actions.decrease(...args)),
      };
    };
    export default connect(mapStateToProps, mapDispatchToProps)(yourComponent);
    ```

# Reducer

- 应用状态变化如何响应 action，并发送到 store
- 接受 state 对象的结构和 action，通过判断 action 的类型，进行相应的操作
- Reduce 不能修改传入的参数

- 示例：

```js
function todoApp(state = initialState, action) {
  //通过判断action的type进行操作
  switch (action.type) {
    case SET_VISIBILITY_FILTER:
      //使用Object.assign 创建副本，达到不修改原state的目的

      return Object.assign({}, state, {
        visibilityFilter: action.filter,
      });
    default:
      return state;
  }
}
```

- **注意错误，没有动作的情况下，返回原 State**

- 可以使用 reducer 组合对 store 进行拆分，处理多个 store
- 每个指定的函数，对传入的 store 中的不同 state 进行操作
- 示例

```js
let todoApp = combineReducers({
  todos,
  visibleTodoFilter,
});
let nextTodos = todos(state.todos, action);
let nextVisibleTodoFilter = visibleTodoFilter(state.visibleTodoFilter, action);
```

- **整个程序只有一个 store 节点**

# Store

Store 就是把它们联系到一起的对象。Store 有以下职责：

维持应用的 state；

- 提供 getState() 方法获取 state；
- 提供 dispatch(action) 方法更新 state；
- 通过 subscribe(listener) 注册监听器;
- 通过 subscribe(listener) 返回的函数注销监听器。

# 当要将两个内容连接在一起时
- 展示组件：单纯的前端，展示数据
- 容器组件：将展示组件和Redux关联起来
    - 使用store.suscribe()获得数据，并通过props来将这些数据提供给展示组件
    - 使用connect可以快速完成这个过程，同时进行优化，避免各种不必要的渲染
    


# 参考信息

[图解 Flux](https://zhuanlan.zhihu.com/p/20263396)

[对 React-redux 中 connect 方法的理解](https://segmentfault.com/a/1190000010416732)

[react-redux文档](https://www.redux.org.cn/docs/basics/DataFlow.html)