# 数据请求工具/介绍
- 一个用于发送网络请求请求数据的内容
- 他会首先询问cache，返回已有的数据，然后发送fetch请求，最终得到最新的数据
- 封装多种实用的技术和对网页上的操作，将数据保存在本地等
- useSWR：接受一个key和一个请求函数，返回一个data和一个error
    - error需要使用throw扔出来
# 



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
