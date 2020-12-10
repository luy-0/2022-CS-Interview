# Java Lambda 表达式

Lambda 表达式，也可称为闭包，它是推动 Java 8 发布的最重要新特性。

Lambda 允许把函数作为一个方法的参数（函数作为参数传递进方法中）。

使用 Lambda 表达式可以使代码变的更加简洁紧凑。



## 接口的调用

根据某些乱七八糟的设计原则，系统应该高内聚松耦合。实践这个原则的一个重要手段就是上接口。

例如，我们设置这个接口。

```java
interface Task(){
	void run();
}
```

### 一、传统的接口实现类

传统上，我们需要对每个接口编写实现类。

```java
// Task.java
interface Task{
	void run();
}

// MyTask.java
class MyTask01 implements Task{
    @Override
    public void run() {
        System.out.println("hello");
    }
}
```

然后调用：

```java
// LambdaTest.java
public static void main(String[] args) {
    Task myTask = new MyTask01();
    // 上面这行用到了多态，懂得都懂
    myTask.run();
}
```

### 二、静态内部类

我们不想为了一个函数再单独编写一个实现类，所以第二个解决方案是编写静态内部类。

```java
// Task.java
interface Task{
	void run();
}
```

实现与调用：

```java
// LambdaTest.java
static class MyTask02 implements Task{
    @Override
    public void run() {
        System.out.println("hello");
    }
}

public static void main(String[] args) {
    Task myTask = new MyTask02();
    myTask.run();
}
```

### 三、局部内部类

静态内部类是在当前类里面编写类，这样每次生成外部类的对象时都要生成下内部类（尽管可能不需要用到）。

因此有了局部内部类，它是在方法里面定义。

接口还是一样,略；

调用：

```java
// LambdaTest.java
public static void main(String[] args) {

    class MyTask03 implements Task{
        @Override
        public void run() {
            System.out.println("hello");
        }
    }

    Task myTask03 = new MyTask03();
    myTask03.run();

}
```

### 四、匿名内部类

局部内部类还是要定义个类啊，那么我要是也懒得写呢？匿名内部类其实和它差不多，也是在方法体内部，仅仅是省略了类的名称等关键词。

接口同上，略。

调用：

```java
// LambdaTest.java
public static void main(String[] args) {
    Task myTask04 = new Task() {
        @Override
        public void run() {
            System.out.println("hello");
        }
    };
    myTask04.run();
}
```

### 五、Lambda 表达式

注意：Lambda表达式仅仅在接口只有一个方法时可以用。

接口同上，但是还是贴一下。

```java
// Task.java
interface Task{
	void run();
}
```

调用方法：

```java
public static void main(String[] args) {
    Task myTask05 = ()->{
        System.out.println("hello");
    };

    myTask05.run();
}
```

代码中：

1. 实现的是哪个接口呢？这取决于前面的类型 `Task`
2. ()包裹起来的是参数，这里不传入参数，所以留空
3. {}包裹起来的是函数体，它会重写接口中的方法，重写哪个方法呢？注意使用 Lambda 表达式时，接口中有且只有一个方法！否则不能用 Lambda 表达式
4. Lambda 表达式还可以继续化简，见下

## Lambda 的化简

### 一、标准 Lambda 表达式

我们先来看下标准的 Lambda表达式。

接口：

```java
// Task.java
interface Task {
    int run(String a,int b);
}
```

实现：

```java
public static void main(String[] args) {
    Task myTask06 = (String name, int num)->{
        System.out.println(name+": Good "+num+"! ");
        return num;
    };

    int f__k = myTask06.run("Jack Ma",996);
    System.out.println(f__k+"!");
}
```

这个 Lambda 表达式重写了接口中的唯一方法，包括两个参数、多条语句、返回值。



### 二、简化参数

其实在 Lambda 表达式中并不需要指明参数的类型。毕竟已经在接口中声明好了。

~~什么？你说你改变参数的数量和类型？那还叫🔨的重写。~~

注意哈，要去类型都去掉，不要一半去一半不去 ❌：`String name,num` 

接口同上，略。

实现：

```java
public static void main(String[] args) {
    Task myTask07 = (name, num)->{
        System.out.println(name+":\"Good "+num+"!\"");
        return num;
    };

    int f__k = myTask07.run("Jack Ma",996);
    System.out.println(f__k+"!");
}
```



### 三、简化小括号

如果只有一个参数，可以去掉小括号

如果没有参数或多个参数，不可去掉

接口：

```java
interface Task {
    void run(String a);
}
```

调用：

```java
public static void main(String[] args) {
    Task myTask08 = name -> {
        System.out.println(name + ":\"Good " + "!\"");
    };

    myTask08.run("Jack Ma");
}
```



### 四、简化花括号

如果函数体只有一句的话，可以把花括号也取掉。

接口：

```java
interface Task {
    void run();
}
```

实现：

```java
public static void main(String[] args) {
    Task myTask09 = ()-> System.out.println("Good 996!");

    myTask09.run();
}
```



## 参考资料

[Java Lambda 表达式](https://www.runoob.com/java/java8-lambda-expressions.html)

[狂神说：Lambda表达式](https://www.bilibili.com/video/BV1V4411p7EF?p=10)