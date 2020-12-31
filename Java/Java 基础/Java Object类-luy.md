# Object 类

众所周知，Java 中的 Object 类是所有类的超类。也就是说任意类都会继承 Object 中的方法。



<img src="Java Object类-luy.assets/image-20201221013916776.png" alt="image-20201221013916776" style="zoom:67%;" />

| Modifier and Type  | Method                                | Description                                                  |
| :----------------- | :------------------------------------ | :----------------------------------------------------------- |
| `protected Object` | `clone()`                             | Creates and returns a copy of this object.<br/>创建该对象的一个拷贝 |
| `boolean`          | `equals(Object obj)`                  | Indicates whether some other object is "equal to" this one.<br/>判断当前对象与传入参数是否“相等” |
| `protected void`   | `finalize()`                          | **Deprecated.** The finalization mechanism is inherently problematic.<br/>不建议使用。会在对象被GC回收之前调用 |
| `Class<?>`         | `getClass()`                          | Returns the runtime class of this `Object`.<br/>获取对象的类 |
| `int`              | `hashCode()`                          | Returns a hash code value for the object.<br/>获取对象的hash值 |
| `void`             | `notify()`                            | Wakes up a single thread that is waiting on this object's monitor.<br/>任意唤醒一个在此对象监视器上等待的线程 |
| `void`             | `notifyAll()`                         | Wakes up all threads that are waiting on this object's monitor.<br/>唤醒全部在此对象监视器上等待的线程 |
| `String`           | `toString()`                          | Returns a string representation of the object.<br/>将该对象转为字符串 |
| `void`             | `wait()`                              | Causes the current thread to wait until it is awakened, typically by being *notified* or *interrupted*. |
| `void`             | `wait(long timeoutMillis)`            | Causes the current thread to wait until it is awakened, typically by being *notified* or *interrupted*, or until a certain amount of real time has elapsed. |
| `void`             | `wait(long timeoutMillis, int nanos)` | Causes the current thread to wait until it is awakened, typically by being *notified* or *interrupted*, or until a certain amount of real time has elapsed. |

本文所有涉及到的源码来自 JDK-15

## equals

```java
public boolean equals(Object obj) {
	return (this == obj);
}
```

### equals 与 ==

Java 中的类型分为 基础类型 和 引用类型。对于基础类型，该方法总是等价于 “==”，没什么好解释的。

> 注意：基本类型并不是类，也不继承 Object 类。

对于引用类型，`==` 表示它们所引用的对象的地址是一样的，也就是它们必定指向同一个对象。

- 从源码我们看到，equals 方法默认就是使用 `==` 进行比较。也就是说，如果没有覆盖 equals0方法。则通过 equals（）比较该类的两个对象时等价于“==”比较这两个对象。
- 如果该方法被覆盖，那么我们认为比较的两个对象是相等的。

注意：`==` 比较这两个对象是否是同一个对象；`equals` 比较这两个对象是否相等。在默认情况下，`A==B` <=> `A.equals(B)`；在覆盖过方法的情况下，`A==B` => `A.equals(B)` 



### 重写 equals 方法

重写后的 equals 方法应该满足以下五个条件：

1. 自反性(reflexive)：对于任何非空(null)对象，`x.equals(x) == true` 恒成立
2. 对称性(symmetric)：对于任何非空(null)对象，`x.equals(y) == y.equals(x)` 恒成立
3. 传递性(transitive)：对于任何非空(null)对象，若`x.equals(y) == y.equals(z)` ，必有`x.equals(z) == true`
4. 一致性(consistent)：对于任何非空(null)对象，`x.equals(y)` 的值在多次调用中始终不变
5. 非空性(non-null)：对于任何非空(null)对象，`x.equals(null) == false` 恒成立

> 为什么要强调非空(null)对象呢？因为如果 x 引用的是 null 的话。那么它根本就没有 `equals()` 方法。
>
> ```java
> Test test = null;
> System.out.println(test==null);			// true,因为 == 是比较地址的
> System.out.println(test.equals(null));	// java.lang.NullPointerException
> ```



很显然，前面三个条件（自反对称传递）也就是集合论中定义的一个**划分**，即体现了这两个集合的**等价关系**。~~如果上一句话看不懂建议重修离散数学。~~

### 常量池

Java<u>基本类型的包装类</u>的大部分都实现了常量池技术，即Byte，Short，Integer，Long，Character，Boolean；前面4种包装类默认创建了[-128，128]的相应类型的缓存数据，Character创建了数值在[O，127]范围的数据，Boolean直接返回 True Or false.如果超出对应范围仍然会去创建新的。

对于浮点数的包装类 Float，Double并没有常量池。

```java
Integer a = 127;
Integer b = 127;
a == b;				// true,它们指向同一个对象
a.equal(b);			// true

Integer a = 129;
Integer b = 129;
a == b;				// false,它们指向不同的对象
a.equal(b);			// true,它们确实相等


Integer a = 127;
Integer b = new Integer(127);	// 这种情况下b会创建新的对象
a == b;				// false,它们指向不同的对象
a.equal(b);			// true,它们确实相等
```



## hashCode

这个方法用于返回该对象的 Hash 值。这里不介绍 Hash 值的意义和用途。

该方法会返回一个 int 整型。

> 该方法规约如下：
>
> 1. 在一次程序运行中，对同一个对象多次求哈希值的返回值应当相同。但在同一个程序的多次运行中，并不要求它们的Hash值总是相同
> 2. 若 `A.equals(B)`, 则 `A.hashCode() == B.hashCode()`
> 3. 若 `A.hashCode() == B.hashCode()`，**未必有** `A.equals(B)`，也**未必有** `A == B`

```java
public native int hashCode();
```

- native 修饰符：A native method is a Java method whose implementation is provided by non-java code. 本地方法是使用其他语言编写的 Java 方法，它取决于具体的 JVM。
- 该方法的默认行为一般为将对象在堆上的地址转化为整型返回，但是这在实现时并不是必需的。

### hashCode 与 equals

由于 hashCode 方法默认是根据对象的内存地址生成的。考虑以下关系：

> 1. 若 `A == B` 为真，则必有 `A.equals(B) == true`
> 2. 若 `A.equals(B) == true`，则 `A == B` 未必为真
> 3. 若 `A.equals(B)`, 则 `A.hashCode() == B.hashCode()`
> 4. 在默认情况下，若 `A == B` 为真，则 `A.hashCode() == B.hashCode()`

不难推理出，由于 equals 并不要求两对象的内存地址相同，因此 hashCode 方法应当随着 equals 方法的重写而重写。

## getClass

> 返回该对象运行时的类

```java
public final native Class<?> getClass();
```

显然这也是一个本地方法，并且不可被重写。

- 注意返回的是对象的运行时的类，联系多态，理解下面第四行代码
- Java 泛型是类型擦除的。因此泛型中的值不会显式。
  - 类型擦除：指JVM并不会意识到泛型信息

```java
Test a = new subTest();
List<String> b = new ArrayList<>();
List<Integer> c = new ArrayList<>();
System.out.println(a.getClass());		// class StudyObject.subTest
System.out.println(b.getClass());		// class java.util.ArrayList
System.out.println(c.getClass());		// class java.util.ArrayList
```



## toString

> 返回对象的字符串表示形式。该方法应该言简意丰、便于阅读，建议所有类重写该方法。
>
> 如果未重写该方法，会以 `"<类名> + '@' + <0xHash值>"` 的形式返回。

```java
public String toString() {
    return getClass().getName() + "@" + Integer.toHexString(hashCode());
}
```



## clone

> 复制出当前对象的一个拷贝。对"拷贝"的定义因类型而异，一般性的共识是满足以下条件
>
> - `A != B`	并不是**同一个**对象
> - `A.getClass() == B.getClass()`   是同一类对象
> - `A.equals() == B.equals()`       两个对象的相等的
>
> 只有实现了 `Cloneable` 接口的类才允许调用本方法，否则会抛出 `CloneNotSupportedException` 异常。
>
> 默认为浅拷贝

```java
protected native Object clone() throws CloneNotSupportedException;
```

显然这也是一个本地方法

### Cloneable 接口

只有实现了本接口的类才被允许使用 Object 中的 clone() 方法。否则会抛出 `CloneNotSupportedException` 异常。

Cloneable 是一个标记接口，并不需要真的实现任何方法，仅作标记使用。

```java
public interface Cloneable {
    // 这里面真的啥也没有哦
}
```

### 浅拷贝与深拷贝

浅拷贝：对基本数据类型进行值传递，对引用数据类型进行引用传递般的拷贝。

深拷贝：对基本数据类型进行值传递，对引用数据类型，创建一个新的对象，并复制为深拷贝。即递归拷贝

<img src="Java Object类-luy.assets/image-20201221040503225.png" alt="image-20201221040503225" style="zoom:50%;" />

<img src="Java Object类-luy.assets/image-20201221040618638.png" alt="image-20201221040618638" style="zoom:50%;" />

## finalize

> 该方法自 JDK9 起被废弃。

当GC认为它不在需要这个对象时，会调用该函数。



## wait/notify/notifyAll

> 均为本地(naive)方法

这三个函数均涉及到并发编程，<u>下面的内容可能需要一定的并发编程和操作系统基础才能继续阅读</u>。

在操作系统中我们曾经涉及到管程(Monitor)的概念，Java 通过sychronyzed关键字，和wait()、notify()、notifyAll() 方法实现了整个管程模型。(好像 Java 一般会把 Monitor 翻译成监视器)

> 锁池:假设线程A已经拥有了某个对象(注意:不是类)的锁，而其它的线程想要调用这个对象的某个 synchronized 方法(或者 synchronized 块)，由于这些线程在进入对象的synchronized方法之前必须先获得该对象的锁的拥有权，但是该对象的锁目前正被线程A拥有，所以这些线程就进入了该对象的锁池中。
>
> 等待池:假设一个线程A调用了某个对象的wait()方法，线程A就会**释放该对象的锁**后，进入到了该对象的等待池。



> 如果线程调用了对象的 wait()方法，那么线程便会处于该对象的**等待池**中，等待池中的线程**不会去竞争该对象的锁**。
>
> 当有线程调用了对象的 **notifyAll**()方法（唤醒所有 wait 线程）或 **notify**()方法（只随机唤醒一个 wait 线程），被唤醒的的线程便会进入该对象的锁池中，锁池中的线程会去竞争该对象锁。也就是说，调用了notify后只要一个线程会由等待池进入锁池，而notifyAll会将该对象等待池内的所有线程移动到锁池中，等待锁竞争
>
> 优先级高的线程竞争到对象锁的概率大，假若某线程没有竞争到该对象锁，它**还会留在锁池中**，唯有线程再次调用 wait()方法，它才会重新回到等待池中。而竞争到对象锁的线程则继续往下执行，直到执行完了 synchronized 代码块，它会释放掉该对象锁，这时锁池中的线程会继续竞争该对象锁。
>
> 作者：大王叫我来巡山
> 链接：https://www.zhihu.com/question/37601861/answer/145545371

### wait()

此方法导致当前线程（称为 T）将自己置于该对象的等待池(the wait set)中，然后放弃关于此对象的所有同步声明(即释放锁）。线程 T 将出于线程调度目的而被禁用，并且处于休眠状态，直到发生四件事之一：

1. 某个拥有 Monitor 的线程调用了该对象的 notify() 方法并且线程 T 正好被选中
2. 某个拥有 Monitor 的线程调用了该对象的 notifyAll() 方法
3. 其他线程中断(interrupt())了线程 T
4. 使用 wait(long timeout) 方法时设定的时间已过

当发生了上述四种情况之一时，线程 T 进入从等待池中进入锁池(注意此时还不能直接开始运行)。在锁空出时竞争锁资源，如果竞争成功则从调用 wait() 方法处开始运行；如果竞争失败则继续停留在锁池中(并不会返回到等待池中)。

在个别情况下可能会出现虚假唤醒的可能性，这是指由于 CPU 调度导致的、在上述事件发生时同时唤醒了多个线程的情况(更多关于虚假唤醒的请参考操作系统的 IPC 部分)。因此在代码中需要显性地使用 while 来规避，例如：

```java
// 错误写法
synchronized (obj) {
	if (condition does not hold)
		obj.wait();
		... // Perform action appropriate to condition
    }
}
// 正确写法
synchronized (obj) {
	while (condition does not hold)
		obj.wait();
		... // Perform action appropriate to condition
            // 当发生虚假唤醒时, while 可以帮助我们持续检查条件, 从而补救这一情况
    }
}
```

wait() 方法具有两个重载：

| 方法名                        | 说明                                                         |
| ----------------------------- | ------------------------------------------------------------ |
| wait(long timeout)            | timeout 为当前线程 T 的等待时间(ms)<br>若超出时长，T 将被唤醒<br>若时长设定为0，则不会自动唤醒 |
| wait(long timeout, int nanos) | timeout 定义同上<br>nanos 定义类似，单位为纳秒(ns)<br>nanos 合法值为0~999999<br>若超出时长，T 将被唤醒 |



### notify()

唤醒当前对象的**某个**处于等待池中的线程 T。具体是哪个线程是任意选择的。线程 T 被唤醒时将处于锁池中，等到当前线程放弃该对象的锁后才可以参与竞争进而获得锁并运行。

此方法仅可以由对象的 Monitor 的拥有者调用，线程通过以下三种情况成为拥有者：

1. 通过执行该对象的 synchronized 实例方法
2. 通过执行该对象的 synchronized 代码块
3. 通过执行某类的 synchronized static 方法

一次只能有一个线程拥有对象的监视器

### notifyAll()

这是与上述类似的方法，不同之处在于它将唤醒当前对象的处于等待池中的**所有线程**。线程(们)被唤醒时将处于锁池中，等到当前线程放弃该对象的锁后才可以参与竞争进而获得锁并运行。

此方法仅可以由对象的 Monitor 的拥有者调用。