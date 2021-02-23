# 数据请求工具/介绍
- 一个用于发送网络请求请求数据的内容
- 他会首先询问cache，返回已有的数据，然后发送fetch请求，最终得到最新的数据
> 自动浏览缓存？
- 封装多种实用的技术和对网页上的操作，将数据保存在本地等
# API
## useSWR
- 接受一个key和一个请求函数fetcher，返回一个data和一个error
- key是请求的url
    - key可以使用数组，传入token，body等信息
    - 然后通过fetch发送请求并获得回调的数据
    - error需要使用throw扔出来
    - 可以结合useSWR封装一些拥有更多状态的hooks
    - ```js
      function useUser (id) {
        const { data, error } = useSWR(`/api/user/${id}`, fetcher)
        return {
            user: data,
            isLoading: !error && !data,
            isError: error
            }
        }
        ```
    - fetcher是一个接收url进行请求的函数，axios，fetch等请求方法都可以使用
- 可以使用```onErrorRetry```来对返回的错误和请求进行分类处理
## SWRConfig
- 可以设置更新时长，统一调用的接口等
- 通过```<SWRConfig>   </SWRConfig>``` 给多个useSWR同时设置属性

# Auto Revalidation
- 此处仅说明作用，不说明函数具体参数
1. 页面跳转时保存当前页面之前请求的数据
2. 两个页面之间保存同步，同步的刷新速率也可以进行设置
# Mutation
- 广播？
- 通过mutate(key)的方式，使所有SWR被相同的key调用


# 示例代码
``` js
import fetch from 'unfetch'
const fetcher = url => fetch(url).then(r => r.json())
function useUser (id) {
  const { data, error } = useSWR(`/api/user/${id}`, fetcher)
  return {
    user: data,
    isLoading: !error && !data,
    isError: error
  }
}
function Page () {
  return <div>
    <Navbar />
    <Content />
  </div>
}
// child components
function Navbar () {
  return <div>
    ...
    <Avatar />
  </div>
}
function Content () {
  const { user, isLoading } = useUser()
  if (isLoading) return <Spinner />
  return <h1>Welcome back, {user.name}</h1>
}
function Avatar () {
  const { user, isLoading } = useUser()
  if (isLoading) return <Spinner />
  return <img src={user.avatar} alt={user.name} />
}
```
