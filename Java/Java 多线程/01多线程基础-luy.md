

进程与线程

同一时间刻CPU计算资源只能用在一个地方。如果我此时一边敲代码，一边听歌，一边挂QQ，那么实际上CPU的运行状态是在这些工作之间以毫秒级别的速度来回迅速切换，在宏观上造成几个工作同时进行的假象。也即是**“微观串行，宏观并行”**(但不是真正的并行!)。

>  如果真的是在同一时刻有多个程序在执行(此时一定是多核计算机), 我们称之为**并行**.
>
>  上述行为更准确的被称为 **并发**. (伪并行)

这样的情况我们被称为**多道程序(Multiprogramming)** ，即同时有多个程序在执行中(宏观)，但实际上只有一个进程在使用CPU(微观)

![待配图1](https://my-pic-bed-1302358960.cos.ap-nanjing.myqcloud.com/Blog/202006/img/1.jpg)

**进程：** ==an executing program==, including the current values of the program counter, register, and variables.
进程是进行中的程序。编写好的代码(.c, .py)或可运行的文件(.exe, .bat) 被成为程序。当他们被运行时才被称为进程。
一个进程包括：

- program counter, 程序计数器;用于标志该进程当前运行至程序的何处
- stack, 栈; 
- data section,数据部分



线程是轻量级的进程, 它拥有的环境没有进程那么多, 所以线程间的切换更加轻便.

- 进程是为了避免等待IO的时间, 线程是为了缩短进程切换中的浪费的过多的时间
- 线程是隶属于某一进程, 或者说*( traditional or heavyweight )*进程是仅有一个线程的进程
- 但是线程还是有必要的环境的
- 同一个进程的不同线程(兄弟线程)可以共享一部分资源



在程序运行时，即使没有自己创建线程，后台也会有多个线程，如主线程，GC线程；
 main（）称之为主线程，为系统的入口，用于执行整个程序；

在一个进程中，如果开辟了多个线程，线程的运行由调度器安排调度，调度器是与
 操作系统紧密相关的，先后顺序是不能认为的干预的。



线程就是独立的执行路径；
在程序运行时，即使没有自己创建线程，后台也会有多个线程，如主线程，gc线程；
man（）称之为主线程，为系统的入口，用于执行整个程序；
在一个进程中，如果开辟了多个线程，线程的运行由调度器安排调度，调度器是与
操作系统紧密相关的，先后顺序是不能认为的干预的。
对同一份资源操作时，会存在资源抢夺的问题，需要加入并发控制；
线程会带来额外的开销，如cpu调度时间，并发控制开销。
每个线程在自己的工作内存交互，内存控制不当会造成数据不一致



---

### 线程创建(三种)

1. 继承 Thread 类
2. 实现 Runnable 接口
3. 实现 Callable 接口

#### 方式一: 继承 Thread 类

1. 继承 Thread
2. 重写 Run() 方法
3. 调用 start() 运行

> public void run()
>
> If this thread was constructed using a separate `Runnable` run object, then that `Runnable` object's `run` method is called; otherwise, this method does nothing and returns. 
>
> Subclasses of `Thread` should override this method.

```java
public class Thread01 extends Thread{
    @Override
    public void run() {
        for (int i = 0; i < 200; i++) {
            System.out.println("正在执行多线程:第"+i+"次");
        }
    }

    public static void main(String[] args) {
        Thread01 thread01 = new Thread01();
        thread01.start();
        for (int i = 0; i < 200; i++) {
            System.out.println("正在执行main线程:第"+i+"次");
        }
    }
}

```

```
正在执行main线程:第1次
正在执行main线程:第2次
正在执行main线程:第3次
正在执行main线程:第4次
正在执行main线程:第5次
正在执行main线程:第6次
正在执行多线程:第0次
正在执行多线程:第1次
正在执行多线程:第2次
正在执行多线程:第3次
正在执行main线程:第7次
正在执行main线程:第8次
正在执行main线程:第9次
正在执行main线程:第10次
......
```

这两个线程同时存在于处理器中，但是每个时刻是那个线程在跑呢？ 这取决于 OS 的调度。 所以展现出来的效果是：主线程输出一会，副线程输出一会。

#### 方式二：实现 Runnable

1. 实现 Runnable 接口，实现 run() 方法
2. 初始化 Thread 对象时传入 Runnable 实现类
3. 运行 Thread 对象的 start() 方法

```java
public class Thread02 implements Runnable {
    @Override
    public void run() {
        for (int i = 0; i < 200; i++) {
            System.out.println("正在执行多线程02:第"+i+"次");
        }
    }

    public static void main(String[] args) {
        Thread02 thread02 = new Thread02();
        Thread thread = new Thread(thread02);

        thread.start();
        for (int i = 0; i < 200; i++) {
            System.out.println("正在执行main线程:第"+i+"次");
        }
    }
}
```

事实上，每个 Thread 对象内部都有一个成员变量 `private Runnable target;` 它可以在 Thread 建立对象的时候被初始化。而 Target 类的 Run() 方法源码其实是：

```java
public void run() {
    if (target != null) {
        target.run();
    }
}
```

这样当调用 Thread 的 Run() 方法时，其实调用的就是 target 的 Run() 方法。

> 注意：但是运行线程还是要用 Start() 方法！不能直接 `thread01.run()` 或者 `thread02.run()`

上面方法一的本质其实是：保持 target 对象值为 null，但是重写了 Thread 类中的 run()，这样就可以直接由 Thread::start 调用 Thread::run 了。

继承 Runnable 接口的优点是：避免了 Java 单继承的局限性。同时写出来的事项可以被多个线程复用。

#### 方式三：Callable 接口

1. 实现 Callable接口，重写 call 方法
2. 创建目标对象
3. 创建执行服务
4. 提交执行
5. 获取结果
6. 关闭服务

```java
public class Thread04 implements Callable<String> {		// 泛型：指定返回值为 String
    private String name = "";

    @Override
    public String call() throws Exception {
        for (int i = 0; i < 100; i++) {
            System.out.println("正在执行多线程03_"+name+":第"+i+"次");
        }
        return "Bye,多线程03_"+name+"!";
    }

    public Thread04(String name) {
        this.name = name;
    }

    public static void main(String[] args) throws ExecutionException, InterruptedException {
        Thread04 thread04_1 = new Thread04("马保国");
        Thread04 thread04_2 = new Thread04("源赖氏佐田");
        Thread04 thread04_3 = new Thread04("英国大力士");

        // 创建服务
        ExecutorService service = Executors.newFixedThreadPool(3);

        // 提交执行
        Future<String> r1 = service.submit(thread04_1);
        Future<String> r2 = service.submit(thread04_2);
        Future<String> r3 = service.submit(thread04_3);

        // 获取结果(并打印)
        System.out.println(r1.get());		// 这里get()函数返回的类型是String
        System.out.println(r2.get());
        System.out.println(r3.get());

        service.shutdown();
    }
}
```

反正结果差不过，不占地方贴了。

总结下 Callable 的好处：

1. 可以有返回值
2. 可与抛出异常

### 并发问题：临界区冲突

```java
public class Thread03 implements Runnable{
    private int tickets = 10;

    @Override
    public void run() {
        while (true){
            try {
                Thread.sleep(200);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            if(tickets<=0){
                break;
            }
            System.out.println(Thread.currentThread().getName()+"=>抢到了第"+tickets--+"张票.");
        }
    }

    public static void main(String[] args) {
        Thread03 thread03 = new Thread03();
        Thread xiaoming = new Thread(thread03,"小明");
        Thread huangniu = new Thread(thread03,"黄牛");
        Thread hongniu = new Thread(thread03,"红牛");

        xiaoming.start();
        hongniu.start();
        huangniu.start();
    }
}
```

输出结果为：

```
红牛=>抢到了第10张票.
黄牛=>抢到了第10张票.
小明=>抢到了第9张票.
红牛=>抢到了第8张票.
黄牛=>抢到了第6张票.
小明=>抢到了第7张票.
黄牛=>抢到了第5张票.
```

可以看出此处线程不安全。

