# Java 深拷贝与浅拷贝（含代码&图解）

本文主要讲引用拷贝，对象拷贝

之后引入深拷贝和浅拷贝，这两者都是 对象拷贝，以Teacher作为拷贝对象



## 引用拷贝

###   概念：创建一个指向对象的引用变量的拷贝

```java
public class QuoteCopy {
    public static void main(String[] args) {
        Teacher teacher = new Teacher("riemann", 28);
        Teacher otherTeacher = teacher;   //这里是对teacher的引用拷贝,拷贝出otherTeacher
        System.out.println(teacher);
        System.out.println(otherTeacher);
    }
}

class Teacher {
    private String name;
    private int age;

    public Teacher(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }
}

```



### 打印结果：

```java
com.lwt.Demo01.Teacher@b4c966a
com.lwt.Demo01.Teacher@b4c966a
```

从结果可以看出这两个对象地址相同，是同一个对象

![1607305315554](Java%20深拷贝与浅拷贝.assets\1607305315554.png)



## 对象拷贝

###  概念：创建对象本身的一个副本（一个新的对象）

```java
public class ObjectCopy {
    public static void main(String[] args) throws CloneNotSupportedException {
        Teacher teacher = new Teacher("riemann", 28);
        Teacher otherTeacher = (Teacher) teacher.clone();
        System.out.println(teacher);
        System.out.println(otherTeacher);
    }
}

class Teacher implements Cloneable {
    private String name;
    private int age;

    public Teacher(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public Object clone() throws CloneNotSupportedException {
        return super.clone();
    }
}

```

 

### 打印结果

```java
com.lwt.Demo01.Teacher@b4c966a
com.lwt.Demo01.Teacher@2f4d3709
```

打印结果可以看出：这两个对象的地址不一样，说明产生了一个新的对象

![1607305806904](Java%20深拷贝与浅拷贝.assets\1607305806904.png)





## 深拷贝与浅拷贝

两者都是对象拷贝

### 一. 浅拷贝

#### 1. 定义：

 被复制对象的所有变量都含有与原来的对象相同的值，而所有的对其他对象的引用仍然指向原来的对象。即对象的浅拷贝会对“主”对象进行拷贝，但不会复制主对象里面的对象。”里面的对象“会在原来的对象和它的副本之间共享。 

 简而言之，`浅拷贝仅仅复制所考虑的对象，而不复制它所引用的对象。` 

#### 2. 代码实现

```java
public class ShallowCopy {
    public static void main(String[] args) throws CloneNotSupportedException {
        Teacher teacher = new Teacher("riemann", 28);

        Student student1 = new Student("edgar",18);
        student1.setTeacher(teacher);
        //拷贝对象
        Student student2 = (Student) student1.clone();

        StringBuilder stu2Info = new StringBuilder();
        stu2Info.append("name: ").append(student2.getName()).append(" ")
                .append("age: ").append((student2.getAge())).append("          ")
                .append("Teacher name :").append(student2.getTeacher().getName()).append(" ")
                .append("Teacher age: ").append(student2.getTeacher().getAge());
        System.out.println("stu2Info: " + stu2Info.toString());

        System.out.println("-------------修改老师的信息后-------------");
        // 修改老师的信息
        teacher.setName("jack");
        
        System.out.println("student1的teacher为： " + student1.getTeacher().getName());
        System.out.println("student2的teacher为： " + student2.getTeacher().getName());

    }
}

class Teacher {
    private String name;
    private int age;

    public Teacher(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }
}

class Student implements Cloneable {
    private String name;
    private int age;
    private Teacher teacher;

    public Student(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public Teacher getTeacher() {
        return teacher;
    }

    public void setTeacher(Teacher teacher) {
        this.teacher = teacher;
    }

    public Object clone() throws CloneNotSupportedException {
        Object object = super.clone();
        return object;
    }
}
```

打印结果：

```java
stu2Info: name: edgar age: 18          Teacher name :riemann Teacher age: 28
-------------修改老师的信息后-------------
student1的teacher为： jack
student2的teacher为： jack
```

从打印结果可以看出，浅拷贝的操作只需要我们拷贝的对象实现Cloneable接口中的clone方法就行，拷贝对象引用的对象不需要实现cloneable接口

![1607337250304](Java%20深拷贝与浅拷贝.assets\1607337250304.png)

### 二. 深拷贝

#### 1. 定义

 深拷贝是一个整个独立的对象拷贝，深拷贝会拷贝所有的属性,并拷贝属性指向的动态分配的内存。当对象和它所引用的对象一起拷贝时即发生深拷贝。深拷贝相比于浅拷贝速度较慢并且花销较大。 

 简而言之，`深拷贝把要复制的对象所引用的对象都复制了一遍。` 

#### 2. 代码实现

```java
public class ShallowCopy {
    public static void main(String[] args) throws CloneNotSupportedException {
        Teacher teacher = new Teacher("riemann", 28);

        Student student1 = new Student("edgar",18);
        student1.setTeacher(teacher);
        //拷贝对象
        Student student2 = (Student) student1.clone();

        StringBuilder stu2Info = new StringBuilder();
        stu2Info.append("name: ").append(student2.getName()).append(" ")
                .append("age: ").append((student2.getAge())).append("          ")
                .append("Teacher name :").append(student2.getTeacher().getName()).append(" ")
                .append("Teacher age: ").append(student2.getTeacher().getAge());
        System.out.println("stu2Info: " + stu2Info.toString());

        System.out.println("-------------修改老师的信息后-------------");
        // 修改老师的信息
        teacher.setName("jack");
        System.out.println("student1的teacher为： " + student1.getTeacher().getName());
        System.out.println("student2的teacher为： " + student2.getTeacher().getName());

    }
}

class Teacher implements Cloneable{
    private String name;
    private int age;

    public Teacher(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    @Override
    protected Object clone() throws CloneNotSupportedException {
        return super.clone();
    }
}

class Student implements Cloneable {
    private String name;
    private int age;
    private Teacher teacher;

    public Student(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public Teacher getTeacher() {
        return teacher;
    }

    public void setTeacher(Teacher teacher) {
        this.teacher = teacher;
    }

    public Object clone() throws CloneNotSupportedException {
        Student student = (Student) super.clone();
        //我们要复制里面的每一份对象
        student.setTeacher((Teacher) student.getTeacher().clone());
        return student;
    }
}

```

打印结果

```java
stu2Info: name: edgar age: 18          Teacher name :riemann Teacher age: 28
-------------修改老师的信息后-------------
student1的teacher为： jack
student2的teacher为： riemann
```

从打印结果可以看到：深拷贝把拷贝的对象的引用部分也拷贝了一次， 两个引用`student1`和`student2`指向不同的两个对象，两个引用`student1`和`student2`中的两个`teacher`引用指向的是两个对象，但对`teacher`对象的修改只能影响`student1`对象,所以说是`深拷贝`

![1607338330331](Java%20深拷贝与浅拷贝.assets\1607338330331.png)



# 总结

深拷贝把要复制的对象所引用的对象都复制了一遍，其复制的对象以及引用的对象都需要实现Cloneable接口中的clone()方法

浅拷贝仅仅复制所考虑的对象，而不复制它所引用的对象，只需要复制的对象实现Cloneable接口中的clone()方法

**其中clone()是Object中的native方法**

两种拷贝都属于对象拷贝



# 面试题

讲讲深拷贝与浅拷贝的区别