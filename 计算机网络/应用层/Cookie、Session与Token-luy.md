# Cookie、Session与Token

众所周知，HTTP是无状态协议，为了解决实践中重复验证客户端的问题，需要某种机制来维护链接的状态。标题中提到的三种方式均可以解决该问题。

用比喻的方式理解：

> 唐三和小伙伴在斗罗大陆上游历，每到一所城市，守卫就需要查验他们的身份，唐三有三种解决方案：

1. Cookie：每次都掏出武魂殿的魂师身份证明（或者身份证之类的吧）
2. Session：在武魂分殿报上自己的名号，守卫在系统中查询。
3. Token：掏出他老爹留给他的武魂殿长老令，见令牌如长老亲至。

## Cookie

问题的本质在于，当客户端发起请求时，如何让服务器识别客户端的身份。那么最简单的实现方法是，直接每个人发一个身份证就好了，每次请求都要求你展示一下身份证。服务器根据你的身份证来判断如何处理回应。

cookie由服务器生成，发送给浏览器，浏览器**把cookie以键值对形式存储在客户端**。下一次请求同一网站时会把该cookie发送给服务器。

按照过期时间分为两类：

- 会话 `Cookie`:是一种临时 `cookie` ，用户退出浏览器，就会被删除
- 持久 `Cookie`:存放在硬盘中，关闭浏览器或者重启电脑依然存在，保留时间由设置的有效期或者过期时间决定，通常是维护某个用户周期性访问服务器的配置文件或者登陆信息

很显然，我们需要一些手段来保护我们的身份证（cookie），避免其他人(页面)盗用。

cookie是在客户端上由浏览器来管理的，浏览器会要求某一网站只能使用该网站对应的cookie，这表示cookie中需要有些信息来存储它属于谁。就像你用身份证的时候需要核对下照片确认是你本人。

这种特性称为 Cookie 的 **不可跨域名性。**由其中的`domain`和 `path来`设置。

> 当然，这种手段只是为了防止其他页面恶意操作，事实上对于我们程序员来说，cookie早已被我们玩弄于股掌之间。

此外，就像身份证的时效性一样，cookie也有自己的有效期，它由其中的``maxAge``属性设置。



### Cookie的域名

Cookie是不可跨域名的。域名www.google.com颁发的Cookie不会被提交到域名www.baidu.com去。这是由Cookie的隐私安全机制决定的。隐私安全机制能够禁止网站非法获取其他网站的Cookie。

正常情况下，同一个一级域名下的两个二级域名如www.example.com和images.example.com也不能交互使用Cookie，因为二者的域名并不严格相同。如果想所有example.com名下的二级域名都可以使用该Cookie，需要设置Cookie的domain参数，例如：

```
Cookie cookie = new Cookie("time","20080808"); // 新建Cookie

cookie.setDomain(".example.com");           // 设置域名

cookie.setPath("/");                              // 设置路径

cookie.set`maxAge`(Integer.MAX_VALUE);               // 设置有效期

response.addCookie(cookie);                       // 输出到客户端
```

注意：domain参数必须以点(".")开始。另外，name相同但domain不同的两个Cookie是两个不同的Cookie。如果想要两个域名完全不同的网站共有Cookie，可以生成两个Cookie，domain属性分别为两个域名，输出到客户端。



### Cookie的路径

domain属性决定运行访问Cookie的域名，而path属性决定允许访问Cookie的路径。例如，如果只允许`/sessionWeb/`下的程序使用Cookie，可以这么写：

```
Cookie cookie = new Cookie("time","20080808");     // 新建Cookie

cookie.setPath("/session/");                          // 设置路径

response.addCookie(cookie);                           // 输出到客户端
```

设置为“/”时允许所有路径使用Cookie。path属性需要使用符号“/”结尾。name相同但domain相同的两个Cookie也是两个不同的Cookie。

注意：页面只能获取它属于的Path的Cookie。例如`/session/test/a.jsp`不能获取到路径为`/session/abc/`的Cookie。使用时一定要注意。

### Cookie的时效

Cookie的`maxAge`决定着Cookie的有效期，单位为秒（Second）。Cookie中通过`getaxAge()`方法与`setmaxAge(int maxAge)`方法来读写`maxAge`属性。

如果`maxAge`属性为正数，则表示该Cookie会在`maxAge`秒之后自动失效。浏览器会将`maxAge`为正数的Cookie持久化，即写到对应的Cookie文件中。

`maxAge`为负数的Cookie，为临时性Cookie，不会被持久化，不会被写到Cookie文件中。Cookie信息保存在浏览器内存中，因此关闭浏览器该Cookie就消失了。Cookie默认的`maxAge`值为–1。

如果`maxAge`为0，则表示删除该Cookie。Cookie机制没有提供删除Cookie的方法，因此通过设置该Cookie即时失效实现删除Cookie的效果。失效的Cookie会被浏览器从Cookie文件或者内存中删除，

要想修改Cookie只能使用一个同名的Cookie来覆盖原来的Cookie，达到修改的目的。删除时只需要把`maxAge`修改为0即可。

注意：从客户端读取Cookie时，包括`maxAge`在内的其他属性都是不可读的，也不会被提交。浏览器提交Cookie时只会提交name与value属性。`maxAge`属性只被浏览器用来判断Cookie是否过期。

### Cookie的缺陷

1. Cookie功能需要浏览器的支持。

   如果浏览器不支持Cookie（如大部分手机中的浏览器）或者把Cookie禁用了，Cookie功能就会失效。

2. Cookie是完全透明的，不能用于存储重要信息

### Cookie的属性

| 属  性  名     | 描    述                                                     |
| -------------- | ------------------------------------------------------------ |
| String name    | 该Cookie的名称。Cookie一旦创建，名称便不可更改               |
| Object value   | 该Cookie的值。如果值为Unicode字符，需要为字符编码。如果值为二进制数据，则需要使用BASE64编码 |
| **int maxAge** | **该Cookie失效的时间，单位秒。如果为正数，则该Cookie在maxAge秒之后失效。如果为负数，该Cookie为临时Cookie，关闭浏览器即失效，浏览器也不会以任何形式保存该Cookie。如果为0，表示删除该Cookie。默认为–1** |
| boolean secure | 该Cookie是否仅被使用安全协议传输。安全协议。安全协议有HTTPS，SSL等，在网络上传输数据之前先将数据加密。默认为false |
| String path    | 该Cookie的使用路径。如果设置为“/sessionWeb/”，则只有contextPath为“/sessionWeb”的程序可以访问该Cookie。如果设置为“/”，则本域名下contextPath都可以访问该Cookie。注意最后一个字符必须为“/” |
| String domain  | 可以访问该Cookie的域名。如果设置为“.google.com”，则所有以“google.com”结尾的域名都可以访问该Cookie。注意第一个字符必须为“.” |
| String comment | 该Cookie的用处说明。浏览器显示Cookie信息的时候显示该说明     |
| int version    | 该Cookie使用的版本号。0表示遵循Netscape的Cookie规范，1表示遵循W3C的RFC 2109规范 |

## Session

第二种方式就是将用户信息存储到服务端，而在客户端处仅仅存储SessionID，将其传入服务端后，服务器再找出用户信息，并作出对应措施。

如果说Cookie机制是通过检查客户身上的“通行证”来确定客户身份的话，那么Session机制就是通过检查服务器上的“客户明细表”来确认客户身份。Session相当于程序在服务器上建立的一份客户档案，客户来访的时候只需要查询客户档案表就可以了。至于客户端怎么保存这个”身份标识“，可以有很多方式，对于浏览器客户端，大家都采用cookie的方式。

> 但是这并不代表Session一定是基于Cookie上的，后续会看到基于URL的Session

1. 用户向服务器发送用户名和密码
2. 服务器验证通过后,在当前对话(session)里面保存相关数据,比如用户角色, 登陆时间等;
3. 服务器向用户返回一个`session_id`, 写入用户的`cookie`
4. 用户随后的每一次请求, 都会通过`cookie`, 将`session_id`传回服务器
5. 服务端收到 `session_id`, 找到前期保存的数据, 由此得知用户的身份。

### 基于其他方式

URL地址重写是对客户端不支持Cookie的解决方案。URL地址重写的原理是将该用户Session的id信息重写到URL地址中。服务器能够解析重写后的URL获取Session的id。这样即使客户端不支持Cookie，也可以使用Session来记录用户状态。

实际上，有四种方式让`Session`正常工作

- 通过`URL`传递`SessionID`
- 通过`Cookie`传递`SessionID`
- 通过`SSL`传递`SessionID`
- 通过隐藏表单传递`SessionID`

### Session存在的问题

#### 缓存压力

为了获得更高的存取速度，服务器一般把Session放在内存里。每个用户都会有一个独立的Session。如果Session内容过于复杂，当大量客户访问服务器时可能会导致内存溢出。因此，Session里的信息应该尽量精简。

此外，`session`需要采用一种过期删除的机制来确保`session`信息不会一直累积，来防止内存溢出的发生。`session`的超时时间可以通过`maxInactiveInterval`属性来设置。

#### 扩展性不好

如果服务端使用的是集群，就需要进行Session的动态共享，使得每台服务器都能够读取Session。



## Token

如果你每次都去武魂分殿报名号，这要求不同的分殿中同步了你的信息，而这在还没有进入信息时代的斗罗大陆是比较困难的。因此产生了Token。请注意例子中的“长老令”的特点：见令牌即放行，而不需要额外验证黑卡的持有者的具体身份。（当然，可能还是要验证令牌的真实性）

那么可以看出来，令牌的主要优势是武魂总殿和分殿之间不需要数据同步。子服务器只要校验令牌的真实性即可。

使用令牌的具体过程为：

1. 用户通过用户名和密码向主服务器发送请求
2. 程序验证，并使用加密算法签名
3. 程序返回一个签名的token给客户端
4. 客户端储存token, 并且每次用令牌（向主/从服务器）发送请求
5. 服务端验证Token并返回数据

目前使用比较广泛的有 JWT（JSON Web Token），此处不表。[参看文章](https://juejin.cn/post/6844903864810864647#heading-15)。

此外Token常分为Access Token和Refresh Token，此处不表。[参看文章](https://juejin.cn/post/6859572307505971213)。

# 当面试官问起他们的区别

## Cookie和Session的区别

1. 存储位置不同： cookie数据存放在客户的浏览器上，session数据放在服务器上
2. 隐私策略不同：cookie不是很安全， 别人可以分析存放在本地的cookie并进行cookie欺骗，考虑到安全应当使用session
3. session会在一定时间内保存在服务器上。当访问增多，就会比较占用你服务器的性能，考虑到减轻服务器性能方面，应当使用cookie
4. 存储大小不同： 单个cookie保存的数据不能超过4k, 很多浏览器都限制一个站点最多保存20个cookie

> 一般建议： 将登陆信息等重要信息存放为session, 其他信息如果需要保留，可以放在cookie中

## Token和Session的区别

Session是一种HTTP储存机制， 为无状态的HTTP提供持久机制; Token就是令牌， 比如你授权(登录)一个程序时，它就是个依据，判断你是否已经授权该软件；

Session和Token并不矛盾，作为身份认证Token安全性比Session好，因为每一个请求都有签名还能防止监听以及重放攻击，而Session就必须依赖链路层来保障通讯安全了。如上所说，如果你需要实现有状态的回话，仍然可以增加Session来在服务端保存一些状态。



# 参考链接

[详解 Cookie，Session，Token](https://juejin.cn/post/6844903864810864647)

[session 和 cookie](https://juejin.cn/post/6844903957916024839)

[Cookie/Session机制详解](Cookie/Session机制详解)

[Access Token & Refresh Token 详解以及使用原则](https://juejin.cn/post/6859572307505971213)





