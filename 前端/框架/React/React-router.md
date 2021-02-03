# 概念
- 解决页面间通过url跳转代码过于繁琐的问题
- 提供常用的方法
- 感觉看了示例就能学习大部分
# 路由
- 示例
```js
import React from 'react'
import { Router, Route, Link } from 'react-router'

const App = React.createClass({
  render() {
    return (
      <div>
        <h1>App</h1>
        <ul>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/inbox">Inbox</Link></li>
        </ul>
        {this.props.children}
      </div>
    )
  }
})

const About = React.createClass({
  render() {
    return <h3>About</h3>
  }
})

const Inbox = React.createClass({
  render() {
    return (
      <div>
        <h2>Inbox</h2>
        {this.props.children || "Welcome to your Inbox"}
      </div>
    )
  }
})

const Message = React.createClass({
  render() {
    return <h3>Message {this.props.params.id}</h3>
  }
})

React.render((
  <Router>
    <Route path="/" component={App}>
      <Route path="about" component={About} />
      <Route path="inbox" component={Inbox}>
        <Route path="messages/:id" component={Message} />
      </Route>
    </Route>
  </Router>
), document.body)
```

- 上面的代码支持了多层URL
- 这个应用渲染了下面四个URL
URL	组件
/	App
/about	App -> About
/inbox	App -> Inbox
/inbox/messages/:id	App -> Inbox -> Message

- 通过上面的代码我们能够学习到Router中常见的几种组件
## Router
- 放置所有路由的主要外部组件
- 内部实现了路由的功能
## Route
- path：定义路由，比如 path="about"
- component:定义了此路由加载的组件
- 在
- **onLeave**：当用户离开当前路由时发生的动作，可以通过这个方法检测安全
- **onEnter**：当用户的访问从外层路由下降时，会逐渐向下，并且对这些事件进行处理
## IndexRoute
- component：默认在访问'/'时加载的组件
## Link
- 

## Redirect
- from：从这个路由
- to：重定向到这个路由




# 参考资料
[React-Router中文文档](https://react-guide.github.io/react-router-cn/docs/guides/basics/RouteConfiguration.html)