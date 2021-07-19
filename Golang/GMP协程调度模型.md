# GMP 协程调度模型



[[典藏版\] Golang 调度器 GMP 原理与调度全分析](https://learnku.com/articles/41728)

[Go语言设计与实现：调度器](https://draveness.me/golang/docs/part3-runtime/ch06-concurrency/golang-goroutine/#65-调度器)



## 协程的出现

虽然老调重弹，我们还是来温故一下进程与线程。



在最初的单进程时代，任务的运行必须串行执行。被阻塞的进程导致了CPU资源的浪费。

于是，OS有了最早的并发：多进程并发。当进程被阻塞时，调度到另外等待的进程。保证的CPU的利用。那么如何在多个进程中确定下一个要运行的进程呢？这就是CPU调度器的工作。

新的问题是，进程拥有了很多的资源。而它们的创建、切换、销毁会占用大量的时间与资源，在调度上的额外开销比较大。于是人们设计了轻量的线程，它拥有更少量的资源，这样在切换时的开销会大大降低。

随着互联网逐渐走向高并发，人们发现线程的开销也大了起来（主要是因为并发量太大了）可以参考：进程的虚拟内存大约需要4GB，而线程大约4MB，与之对比的协程可能需要的是KB级别的内存。

线程分为内核级线程与用户级线程。对于CPU来说，它只能感知到内核级线程，人们需要将用户线程绑定在内核线程上。这样，用户-内核形成了N:1的关系，用户可以自行调度切换它们的绑定，实现一拖N的效果。为了便于区分，人们把内核线程依然叫 “线程 (thread)”，用户线程叫 “协程 (co-routine)”。

N:1 的缺陷在于：a) 一个程序程序还是在一个内核线程上运行（单核），用不了硬件的多核加速能力。b) 一旦某协程阻塞，造成线程阻塞，本进程的其他协程都无法执行了，根本就没有并发的能力了。



众所周知，一切问题都可以通过加一层来解决。我们在“线程”与“协程”之间加入了一层新的“调度层”，从而将线程、协程解耦，并实现了它们之间的动态调度。至此，我们就实现了M:N的线程模型。这也就是GMP的本质。



Golang中的协程被称为 **goroutine。**而GMP模型的关键就在于其调度器的设计。

*注：**GMP**的调度器目前仍处于迅速发展阶段。截止2021年7月，最新的稳定调度器使用基于信号的抢占式调度。*



## 什么是 GMP？

GMP其实就是 Go 用于进行协程调度而设计的模型。

G：goroutine，指协程。一个 goroutine 只占几 KB，这就能在有限的内存空间内支持大量 goroutine，支持了更多的并发。虽然一个 goroutine 的栈只占几 KB，但实际是可伸缩的。

M：Machine。它是代表着系统线程的数据结构，一个goroutine必须与M结合时才能在CPU上运行。一个M只能同时运行一个G。

P：Processor，它是G与M的桥梁。必须通过它进行调度。



P与M的数量；

P的数量由环境变量 $GOMAXPROCS 决定，这个值默认为CPU的核数。

M也具有最大数量，默认为1w，但是实际中内核很难支持这么多线程。

二者的数量并无绝对关系。

![img](https://uq8s3qmaa3.feishu.cn/space/api/box/stream/download/asynccode/?code=YTJjNTgwYjE3M2VmZmVkYWVhN2VkNzM1YTk3NWNmMjhfUGVReGN5OXpLWmZ2UUxnaTJJVG5CNjNJdlFJc1ZGa25fVG9rZW46Ym94Y25BbXlZTGlualE3RDVDZkpTMjdkdzlkXzE2MjY2ODE3Mjk6MTYyNjY4NTMyOV9WNA)

**全局队列**（Global Queue）：存放等待运行的 G。

P 的本地队列：同全局队列类似，存放的也是等待运行的 G，存的数量有限，不超过 256 个。新建 G’时，G’优先加入到 P 的本地队列，如果队列满了，则会把本地队列中一半的 G 移动到全局队列。

P 列表：所有的 P 都在程序启动时创建，并保存在数组中，最多有 GOMAXPROCS(可配置) 个。

M：线程想运行任务就得获取 P，从 P 的本地队列获取 G，P 队列为空时，M 也会尝试从全局队列拿一批 G 放到 P 的本地队列，或从其他 P 的本地队列偷一半放到自己 P 的本地队列。M 运行 G，G 执行之后，M 会从 P 获取下一个 G，不断重复下去。

Goroutine 调度器和 OS 调度器是通过 M 结合起来的，每个 M 都代表了 1 个内核线程，OS 调度器负责把内核线程分配到 CPU 的核上执行。

## 调度的基本过程

![img](https://uq8s3qmaa3.feishu.cn/space/api/box/stream/download/asynccode/?code=N2UzZjc3MTZjM2I5NmU5N2FkYWFiMWZiMzg2MTM4MzZfenRDcGtDTXYyUzh0ZFQ5Q0s0QnJLUkxoY1BKeE1hZldfVG9rZW46Ym94Y25xa1p1SVZFUkVoWVhHc3pzMUptQUZmXzE2MjY2ODE3Mjk6MTYyNjY4NTMyOV9WNA)

1. 使用go关键词来创建一个goroutine
2. 有两个存储 G 的队列，一个是局部调度器 P 的本地队列、一个是全局 G 队列。

假设 G2 由 G1 创建，新创建的 G2 会优先保存在 G1 当前的 P 的本地队列中；

如果 P 的本地队列已经满了就会执行负载均衡，将新建的 G2 和 P 的本地队列的前一半协程转移全局的队列中；

1. G 只能运行在 M 中，一个 M 必须持有一个 P，M 与 P 是 1：1 的关系。当 M 当前的 G 执行完毕时，会从 P 的本地队列弹出一个可执行状态的 G 来执行，如果 P 的本地队列为空，就会从全局队列中拿取 G，如果全局队列为空，会其他的 MP 组合偷取（work stealing）一个可执行的 G 来执行；
2. 一个 M 调度 G 执行的过程是一个循环机制；
3. 当 M 执行某一个 G 时候如果发生了 syscall 或则其余阻塞操作，M 会阻塞，如果当前有一些 G 在执行，runtime 会把这个线程 M 从 P 中摘除 (detach)，然后再创建一个新的操作系统的线程 (如果有空闲的线程可用就复用空闲线程) 来服务于这个 P；
4. 当 M 系统调用结束时候，这个 G 会尝试获取一个空闲的 P 执行，并放入到这个 P 的本地队列。如果获取不到 P，那么这个线程 M 变成休眠状态， 加入到空闲线程中，然后这个 G 会被放入全局队列中。

[典藏版  Golang 调度器 GMP 原理与调度全分析](https://learnku.com/articles/41728) 本文的第三部分是很棒的场景说明。



### work-stealing 机制

https://rakyll.org/scheduler/

基本调度

```
// 当 M 空闲时。

runtime.schedule() {

    // only 1/61 of the time, check the global runnable queue for a G.

    // 偶尔检查一下全局队列（GQ）

    // if not found, check the local queue.    检查本地队列（LQ）

    // if not found,

    //     try to steal from other Ps.            若无，尝试窃取

    //     if not, check the global runnable queue.    窃取失败，检查GQ

    //     if not found, poll network.

}
```

窃取

当一个新的 g 被创建或者一个现有的 g 变得可运行时，它被推送到当前 p 的可运行 goroutine 列表中。当 p 执行完 g 后，它会尝试从自己的可运行 goroutine 列表中弹出一个 g。如果列表现在为空，则 p 选择一个随机的其他处理器(p) ，并尝试从其队列中窃取一半可运行 goroutine。



自旋线程

自旋线程会保持线程的存在，尽管它们暂时没有任何协程来处理。他们会持续地进行检查并尝试获取P与G。自旋线程存在的意义是减少线程的创建、销毁等开销。



## 调度器的实现

### 调度器的设计历史（截止 2021 年 7 月）

单线程调度器 · [0.x](https://github.com/golang/go/blob/96824000ed89d13665f6f24ddc10b3bf812e7f47/src/runtime/proc.c)

- 只包含 40 多行代码；

- 程序中只能存在一个活跃线程，由 G-M 模型组成；

多线程调度器 · [1.0](https://github.com/golang/go/blob/go1.0.1/src/pkg/runtime/proc.c)

- 允许运行多线程的程序；

- 全局锁导致竞争严重；

任务窃取调度器 · [1.1](https://github.com/golang/go/blob/779c45a50700bda0f6ec98429720802e6c1624e8/src/pkg/runtime/proc.c)

- 引入了处理器 P，构成了目前的 **G-M-P** 模型；

- 在处理器 P 的基础上实现了基于**工作窃取**的调度器；当本地队列、全局队列均无可用 G 时，会从其他处理器的队列中随机获取一些 G。

- 在某些情况下，Goroutine 不会让出线程，进而造成饥饿问题；

- 时间过长的垃圾回收（Stop-the-world，STW）会导致程序长时间无法工作；

抢占式调度器 · [1.2](https://github.com/golang/go/blob/go1.2/src/pkg/runtime/proc.c) ~ 至今

- 基于协作的抢占式调度器 - 1.2 ~ 1.13
  - Go 语言运行时会在垃圾回收暂停程序、系统监控发现 Goroutine 运行超过 10ms 时发出抢占请求

- 编译器会在 函数调用 时插入 **抢占检查** 指令。这样，当协程在函数调用时会检查当前 Goroutine 是否发起了抢占请求，如果发起，则会触发抢占让出当前线程；

- 这是基于协作的抢占式调度，因为它必须要在当前协程进行函数调用时才会触发抢占。例如，对于长时间的for循环无能为力；

- Goroutine 可能会因为垃圾回收和循环长时间占用资源导致程序暂停；

- 基于信号的抢占式调度器 - 1.14 ~ 至今
  - 实现**基于信号的真抢占式调度**；

- 垃圾回收在扫描栈时会触发抢占调度；垃圾回收时，所有运行中的协程会被挂起，这时它们会被 **标记** 为可抢占的。在恢复运行时，向线程发送信号，线程会中止当前协程并调用信号处理函数。

- 目前抢占的时间点仅在 **垃圾回收的栈扫描** 中，还不能覆盖全部的边缘情况；它只解决了垃圾回收和栈扫描时存在的问题，目前为止没有解决所有问题；

非均匀存储访问调度器 · 目前为提案

- 对运行时的各种资源进行分区；

- 该提案的原理就是通过拆分全局资源，让各个处理器能够就近获取，减少锁竞争并增加数据的局部性。

- 实现非常复杂，到今天还没有提上日程；



更多阅读：[Golang调度器的设计原理](https://draveness.me/golang/docs/part3-runtime/ch06-concurrency/golang-goroutine/#651-设计原理)