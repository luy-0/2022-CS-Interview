- 用户界面
- 浏览器引擎
- 渲染引擎
    - 网络处理
    - JS解析器
- 数据持久层
    - 存储cookie等等

 请求过程：
 - 输入网址，通过DNS解析成ip地址对服务器发出访问，Chorme会对ip地址
 - 返回html内容，浏览器接收到应答，创建渲染进程，通过IPC管道将数据传递给渲染进程
 - 开始渲染
    - 主线程对html进行解析，构建DOM（文档对象模型）树
        - Tokeniser 获得标记
        - Tree Construction 获得树的形式
            - 对于image，css等本地资源，会并行请求这些资源
            - 如果碰到script标签，将会停止解析流程，开始加载并且执行JS
            > 停止解析的原因：JS有可能会对html进行修改，所以需要判断这个修改，防止后面再进行判断
            > 这点可以使用 async 或 defer属性进行异步加载
        - 建立DOM，以document为根节点
    - Layout：主线程通过遍历dom和计算好的样式生成LayoutTree，每个节点都记录了标签的位置和尺寸，
        > LayoutTree和DOM Tree并不一一对应
    
        > display:none的节点不会出现再Layout Tree上

        > 在before伪类中添加了content的元素，会出现在LayoutTree上，而不会出现在DOM Tree上

        > **z-index** 会影响节点绘制的层级关系


        - 同时会建立绘制表，记录会绘制的顺序
        - 将这些内容变成像素点反应在浏览器中的行为被称为栅格化（Rastering）
            > Chorme 的处理方式当前某种规则进行分图层，
    - 重排：当我们改变一个元素的尺寸位置属性时，重新进行样式计算（Computed Style），布局（Layout）绘制（Paint）以及后面的所有流程
    - 重绘：颜色等的改变，触发样式计算和绘制
    > 重排/重绘会占用主线程，而JS也是运行在主线程的，出现抢占执行时间的问题<br/>
     requestAnimationFrame():将JS的运行进行切割，分成多段进行<br/>
     React Fiber就是基于此的优化
    - transform是运行在合成器线程和栅格线程，所以不会占用主进程