# DCL单列模式（双重锁详解）

 

### 我们第一次写的单例模式是下面这样的：

```java
 1 public class Singleton {
 2     private static Singleton instance = null;
 3     public static Singleton getInstance() {
 4         if(null == instance) {                    // line A
 5             instance = new Singleton();        // line B
 6         }
 8         return instance;
10     }
11 }
```



　　假设这样的场景：两个线程并发调用Singleton.getInstance()，假设线程一先判断instance是否为null，即代码中line A进入到line B的位置。刚刚判断完毕后，JVM将CPU资源切换给线程二，由于线程一还没执行line B，所以instance仍然为空，因此线程二执行了new Singleton()操作。片刻之后，线程一被重新唤醒，它执行的仍然是new Singleton()操作，这样问题就来了，new出了两个instance，这还能叫单例吗？

 

### 紧接着，我们再做单例模式的第二次尝试：



```java
 1 public class Singleton {
 2     private static Singleton instance = null;
 3     public synchronized static Singleton getInstance() {
 4         if(null == instance) {                    
 5             instance = new Singleton();            
 6         }
 7         
 8         return instance;
 9         
10     }
11 }
```



　　比起第一段代码仅仅在方法中多了一个synchronized修饰符，现在可以保证不会出线程问题了。但是这里有个很大（至少耗时比例上很大）的性能问题。**除了第一次调用时是执行了Singleton的构造函数之外，以后的每一次调用都是直接返回instance对象。返回对象这个操作耗时是很小的，绝大部分的耗时都用在synchronized修饰符的同步准备上，因此从性能上来说很不划算**。

### 第三次：继续把代码改成下面这样：

```java
 1 public class Singleton {
 2     private static Singleton instance = null;
 3     public  static Singleton getInstance() {
 4         synchronized (Singleton.class) {
 5             if(null == instance) {                    
 6                 instance = new Singleton();            
 7             }
 8         }
10         return instance;
12     }
13 }
```



　　基本上，把synchronized移动到代码内部是没有什么意义的，每次调用getInstance()还是要进行同步。同步本身没有问题，但是我们只希望在第一次创建instance实例的时候进行同步

### 第四次：双重锁定检查（DCL,Double Check Lock）



```java
 1 public class Singleton {
 2     private static Singleton instance = null;
 3     public  static Singleton getInstance() {
 4         if(null == instance) {    // 线程二检测到instance不为空
 5             synchronized (Singleton.class) {
 6                 if(null == instance) {                    
 7                     instance = new Singleton();    
     					// 线程一被指令重排，先执行了赋值，但还没执行完构造函数（即未完成初始化）
 8                 }
 9             }
10         }
12         return instance;    // 后面线程二执行时将引发：对象尚未初始化错误
14     }
15 }
```

　　看样子已经达到了要求，除了第一次创建对象之外，其它的访问在第一个if中就返回了，因此不会走到同步块中，已经完美了吗？

　　如上代码段中的注释：假设线程一执行到instance = new Singleton()这句，这里看起来是一句话，但实际上其被编译后在JVM执行的对应会变代码就发现，这句话被编译成8条汇编指令，大致做了三件事情：

　　1）给instance实例分配内存；

　　2）初始化instance的构造器；

　　3）将instance对象指向分配的内存空间（注意到这步时instance就非null了）

　　**如果指令按照顺序执行倒也无妨，但JVM为了优化指令，提高程序运行效率，允许指令重排序**。如此，在程序真正运行时以上指令执行顺序可能是这样的：

　　a）给instance实例分配内存；

　　b）将instance对象指向分配的内存空间；

　　c）初始化instance的构造器；

　　这时候，当线程一执行b）完毕，在执行c）之前，被切换到线程二上，这时候instance判断为非空，此时线程二直接来到return instance语句，拿走instance然后使用，接着就顺理成章地报错（**对象尚未初始化**）。

　　**具体来说就是synchronized虽然保证了线程的原子性（即synchronized块中的语句要么全部执行，要么一条也不执行），但单条语句编译后形成的指令并不是一个原子操作（即可能该条语句的部分指令未得到执行，就被切换到另一个线程了）**。

　　根据以上分析可知，**解决这个问题的方法是：禁止指令重排序优化，即使用volatile变量**。

###  所以第五次来了：

```java
 1 public class Singleton {
 2     private volatile static Singleton instance = null;
 3     public  static Singleton getInstance() {
 4         if(null == instance) {    
 5             synchronized (Singleton.class) {
 6                 if(null == instance) {                    
 7                     instance = new Singleton();        
 8                 }
 9             }
10         }
11         
12         return instance;    
13         
14     }
15 }
```



　　将变量instance使用volatile修饰即可实现单例模式的线程安全。





# DCL之后破坏单例模式

1. 通过反射来破坏单例
2. 通过序列化反序列化来破环单例

```java
public class Singleton implements Serializable {

    //注意，此变量需要用volatile修饰以防止指令重排序
    private static volatile Singleton singleton = null;

    private Singleton(){
        if(singleton != null){
            throw new RuntimeException("Can not do this");
        }
    }

    public static Singleton getInstance(){
        //进入方法内，先判断实例是否为空，以确定是否需要进入同步代码块
        if(singleton == null){
            synchronized (Singleton.class){
                //进入同步代码块时再次判断实例是否为空
                if(singleton == null){
                    singleton = new Singleton();
                }
            }
        }
        return singleton;
    }

    // 定义readResolve方法，防止反序列化返回不同的对象
    private Object readResolve(){
        return singleton;
    }
}

```

 **一句话总结就是**：当从对象流 ObjectInputStream 中读取对象时，会检查对象的类否定义了 readResolve 方法。如果定义了，则调用它返回我们想指定的对象（这里就指定了返回单例对象）

然后，判断 rep 是否和 obj 相等 。 rep 是readResolve返回的对象，obj 是刚才我们通过反序列化构造函数创建出来的新对象，而由于我们重写了 readResolve 方法，直接返回了单例对象，因此 rep 就是原来的单例对象，和 obj 不相等。

于是，把 rep 赋值给 obj ，然后返回 obj。

所以，最终得到这个 obj 对象，就是我们原来的单例对象。

至此，我们就明白了是怎么一回事。



# 参考资料

https://www.cnblogs.com/xz816111/p/8470048.html