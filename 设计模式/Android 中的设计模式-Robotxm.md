# Android 中的设计模式

主要复习一些在之前的开发中实际用到的模式。

## 建造者模式

比较常见的就是 OkHttp 中构造请求用到的 `Request.Builder`：

```kotlin
val builder = Request.Builder()
    .header("User-Agent", "myxdu/3.1.0")
    .url("https://myxdu.moefactory.com/")
    .build()
```

OkHttp 4 中的源码如下：

```kotlin
class Request internal constructor(
  @get:JvmName("url") val url: HttpUrl,
  @get:JvmName("method") val method: String,
  @get:JvmName("headers") val headers: Headers,
  @get:JvmName("body") val body: RequestBody?,
  internal val tags: Map<Class<*>, Any>
) {
  /* 省略部分代码 */

  open class Builder {
    internal var url: HttpUrl? = null
    internal var method: String
    internal var headers: Headers.Builder
    internal var body: RequestBody? = null

    /** A mutable map of tags, or an immutable empty map if we don't have any. */
    internal var tags: MutableMap<Class<*>, Any> = mutableMapOf()

    constructor() {
      this.method = "GET"
      this.headers = Headers.Builder()
    }

    internal constructor(request: Request) {
      this.url = request.url
      this.method = request.method
      this.body = request.body
      this.tags = if (request.tags.isEmpty()) {
        mutableMapOf()
      } else {
        request.tags.toMutableMap()
      }
      this.headers = request.headers.newBuilder()
    }

    open fun url(url: HttpUrl): Builder = apply {
      this.url = url
    }

    open fun url(url: String): Builder {
      // Silently replace web socket URLs with HTTP URLs.
      val finalUrl: String = when {
        url.startsWith("ws:", ignoreCase = true) -> {
          "http:${url.substring(3)}"
        }
        url.startsWith("wss:", ignoreCase = true) -> {
          "https:${url.substring(4)}"
        }
        else -> url
      }

      return url(finalUrl.toHttpUrl())
    }

    open fun url(url: URL) = url(url.toString().toHttpUrl())

    open fun header(name: String, value: String) = apply {
      headers[name] = value
    }

    open fun addHeader(name: String, value: String) = apply {
      headers.add(name, value)
    }

    open fun removeHeader(name: String) = apply {
      headers.removeAll(name)
    }

    open fun headers(headers: Headers) = apply {
      this.headers = headers.newBuilder()
    }

    open fun cacheControl(cacheControl: CacheControl): Builder {
      val value = cacheControl.toString()
      return when {
        value.isEmpty() -> removeHeader("Cache-Control")
        else -> header("Cache-Control", value)
      }
    }

    open fun get() = method("GET", null)

    open fun head() = method("HEAD", null)

    open fun post(body: RequestBody) = method("POST", body)

    @JvmOverloads
    open fun delete(body: RequestBody? = EMPTY_REQUEST) = method("DELETE", body)

    open fun put(body: RequestBody) = method("PUT", body)

    open fun patch(body: RequestBody) = method("PATCH", body)

    open fun method(method: String, body: RequestBody?): Builder = apply {
      require(method.isNotEmpty()) {
        "method.isEmpty() == true"
      }
      if (body == null) {
        require(!HttpMethod.requiresRequestBody(method)) {
          "method $method must have a request body."
        }
      } else {
        require(HttpMethod.permitsRequestBody(method)) {
          "method $method must not have a request body."
        }
      }
      this.method = method
      this.body = body
    }

    open fun tag(tag: Any?): Builder = tag(Any::class.java, tag)

    open fun <T> tag(type: Class<in T>, tag: T?) = apply {
      if (tag == null) {
        tags.remove(type)
      } else {
        if (tags.isEmpty()) {
          tags = mutableMapOf()
        }
        tags[type] = type.cast(tag)!! // Force-unwrap due to lack of contracts on Class#cast()
      }
    }

    // 在这里真正进行 Request 的构造
    open fun build(): Request {
      return Request(
          checkNotNull(url) { "url == null" },
          method,
          headers.build(),
          body,
          tags.toImmutableMap()
      )
    }
  }
}
```

实际上 OkHttp 使用的已经是建造者模式的变体，这种变体省略了 Director，并且使用了链式调用。

Director 的大致形态如下：

```kotlin
class Director {
    private val builder = Request.Builder()
    
    fun buildRequest() = builder.build()
}
```

也就是说，在 OkHttp 中，是由最终调用的地方充当了 Director 这个角色。

注意到 `Headers`、`CacheControl`、`HttpUrl` 类中都有对应的 `Builder` 类。而抽象类 `RequestBody` 尽管没有 `Builder`，但它具体的实现 `FormBody` 和 `MultipartBody` 中是有的。除了 `RequestBody`，其他类中的 `Builder` 独立存在，不与外界有关联。那么这时 `Request` 的 Builder 的具体实现也就只有一个了，因此可以省略抽象 Builder 角色。这也是变体之一。

还有一种被称为 Product 回炉再造的变体。通常情况下，一旦调用了 Builder 的 `build()` ，就会得到一个不可变的具体对象。放在这里就是在调用 `Request.Builder.build()` 之后，会得到一个最终的 `Request`，此时无法再修改其属性。而在某些情况下，我们可能想要复用先前的 `Request` 对象，这个时候 `Request` 提供了一个函数 `newBuilder()`，可以以当前 `Request` 对象为蓝本，重新构造出一个 `Request.Builder`，然后我们就可以修改属性，再进而 `build()` 了。

当然在 Android 的库中也有很多建造者模式，比如 `MaterialAlertDialogBuilder` 等。

## 工厂模式

### 简单工厂模式

简单工厂模式就是工厂类提供一个方法，根据传入参数的不同，返回具体的实现类。比如在之前的阿里云代码重构大赛中，对于基类 `Item`，和具体的实现陈年老酒（`AgedWine`）、演出票（`ShowTicket`）、特效药（`Cure`）等，向 `Store` 中加入 `Item` 的思路就是简单工厂模式。

```java
class Item {}
class AgedWine extends Item {}
class ShowTicket extends Item {}
class Cure extends Item {}

public class ItemFactory {
    public static Item createItem(String type) {
        if (type.equals("AgedWine")) {
            return new AgedWine();
        } else if (type.equals("ShowTicket")) {
            return new ShowTicket();
        } else if (type.equals("Cure")) {
            return new Cure();
        } else {
            return null;
        }
    }
}
```

Android 的简单工厂模式的一个例子是 `com.android.mms.ui.PresenterFactory` 组件，也就是短信应用中负责展示缩略图的组件。

```java
package com.android.mms.ui;

import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;

import android.content.Context;
import android.util.Log;

import com.android.mms.model.Model;

public class PresenterFactory {
    private static final String TAG = LogTag.TAG;
    private static final String PRESENTER_PACKAGE = "com.android.mms.ui.";
    public static Presenter getPresenter(String className, Context context,
            ViewInterface view, Model model) {
        try {
            if (className.indexOf(".") == -1) {
                className = PRESENTER_PACKAGE + className;
            }
            Class c = Class.forName(className);
            Constructor constructor = c.getConstructor(
                    Context.class, ViewInterface.class, Model.class);
            return (Presenter) constructor.newInstance(context, view, model);
        } catch (ClassNotFoundException e) {
            Log.e(TAG, "Type not found: " + className, e);
        } catch (NoSuchMethodException e) {
            // Impossible to reach here.
            Log.e(TAG, "No such constructor.", e);
        } catch (InvocationTargetException e) {
            Log.e(TAG, "Unexpected InvocationTargetException", e);
        } catch (IllegalAccessException e) {
            Log.e(TAG, "Unexpected IllegalAccessException", e);
        } catch (InstantiationException e) {
            Log.e(TAG, "Unexpected InstantiationException", e);
        }
        return null;
    }
}
```

这里根据传入 `className` 的不同构造出具体的 `Presenter` 实例。

### 工厂方法模式

工厂方法模式是对简单工厂模式的扩展。整体结构由抽象产品、具体产品、抽象工厂、具体工厂四部分构成。

```kotlin
// 抽象工厂
interface FoodFactory {
    fun makeFood(name: String): Food?
}

// 抽象产品
interface Food {}

// 具体产品
class ChineseFoodA : Food {}
class ChineseFoodB : Food {}
class AmericanFoodA : Food {}
class AmericanFoodB : Food {}

// 具体工厂
class ChineseFoodFactory : FoodFactory {
    override fun makeFood(name: String) = when (name) {
        "A" -> ChineseFoodA()
        "B" -> ChineseFoodB()
        else -> null
    }
}

// 具体工厂
class AmericanFoodFactory : FoodFactory {
    override fun makeFood(name: String) = when (name) {
        "A" -> AmericanFoodA()
        "B" -> AmericanFoodB()
        else -> null
    }
}

fun test() {
    val factory = ChineseFoodFactory()
    val food = factory.makeFood("A")
}
```

Jetpack 中 ViewModel 组件提供了一种使用工厂创建 ViewModel 对象的方式，主要是用于 ViewModel 的构造函数有参数的情况。这里使用的就是工厂方法模式。以常用的 `AndroidViewModel` 为例。

````java
/**
 * ViewModel.java
 */
// 抽象的产品类
public abstract class ViewModel {
    // Can't use ConcurrentHashMap, because it can lose values on old apis (see b/37042460)
    @Nullable
    private final Map<String, Object> mBagOfTags = new HashMap<>();
    private volatile boolean mCleared = false;

    @SuppressWarnings("WeakerAccess")
    protected void onCleared() {
    }

    @MainThread
    final void clear() {
        mCleared = true;
        
        if (mBagOfTags != null) {
            synchronized (mBagOfTags) {
                for (Object value : mBagOfTags.values()) {
                    closeWithRuntimeException(value);
                }
            }
        }
        onCleared();
    }

    @SuppressWarnings("unchecked")
    <T> T setTagIfAbsent(String key, T newValue) {
        T previous;
        synchronized (mBagOfTags) {
            previous = (T) mBagOfTags.get(key);
            if (previous == null) {
                mBagOfTags.put(key, newValue);
            }
        }
        T result = previous == null ? newValue : previous;
        if (mCleared) {
            closeWithRuntimeException(result);
        }
        return result;
    }

    @SuppressWarnings({"TypeParameterUnusedInFormals", "unchecked"})
    <T> T getTag(String key) {
        if (mBagOfTags == null) {
            return null;
        }
        synchronized (mBagOfTags) {
            return (T) mBagOfTags.get(key);
        }
    }

    private static void closeWithRuntimeException(Object obj) {
        if (obj instanceof Closeable) {
            try {
                ((Closeable) obj).close();
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }
    }
}

/**
 * ViewModelProvider.java
 */
public class ViewModelProvider {

    // 抽象的工厂类
    public interface Factory {
        @NonNull
        <T extends ViewModel> T create(@NonNull Class<T> modelClass);
    }
    
    // 具体的工厂类
    public static class AndroidViewModelFactory extends ViewModelProvider.NewInstanceFactory {

        private static AndroidViewModelFactory sInstance;

        @NonNull
        public static AndroidViewModelFactory getInstance(@NonNull Application application) {
            if (sInstance == null) {
                sInstance = new AndroidViewModelFactory(application);
            }
            return sInstance;
        }

        private Application mApplication;

        public AndroidViewModelFactory(@NonNull Application application) {
            mApplication = application;
        }

        @NonNull
        @Override
        public <T extends ViewModel> T create(@NonNull Class<T> modelClass) {
            if (AndroidViewModel.class.isAssignableFrom(modelClass)) {
                try {
                    return modelClass.getConstructor(Application.class).newInstance(mApplication);
                } catch (NoSuchMethodException e) {
                    throw new RuntimeException("Cannot create an instance of " + modelClass, e);
                } catch (IllegalAccessException e) {
                    throw new RuntimeException("Cannot create an instance of " + modelClass, e);
                } catch (InstantiationException e) {
                    throw new RuntimeException("Cannot create an instance of " + modelClass, e);
                } catch (InvocationTargetException e) {
                    throw new RuntimeException("Cannot create an instance of " + modelClass, e);
                }
            }
            return super.create(modelClass);
        }
    }
}
````

而实际的产品类则是我们自己创建的继承自 `AndroidViewModel` 的 ViewModel。在使用时通过 `val viewModel = ViewModelProviders.of(this).get(MainViewModel::class.java)` 即可获得一个 ViewModel 的实例。

这行代码中，首先通过 `ViewModelProviders.of(this)` 得到一个 `ViewModelProvider`。

```java
@NonNull
@MainThread
public static ViewModelProvider of(@NonNull FragmentActivity activity) {
    return of(activity, null);
}

@NonNull
@MainThread
public static ViewModelProvider of(@NonNull FragmentActivity activity,
        @Nullable Factory factory) {
    Application application = checkApplication(activity);
    if (factory == null) {
        factory = ViewModelProvider.AndroidViewModelFactory.getInstance(application);
    }
    return new ViewModelProvider(activity.getViewModelStore(), factory);
}
```

可以看到，默认指定的 `factory` 为空，此时会构造出一个 `AndroidViewModelFactory`，并将应用的 `Application` 传入。然后，通过 `ViewModelProvider` 的 `get` 方法，创建出最终我们需要的 `ViewModel` 实例。

```java
/**
 * ViewModelProvider.java
 */
@NonNull
@MainThread
public <T extends ViewModel> T get(@NonNull String key, @NonNull Class<T> modelClass) {
    ViewModel viewModel = mViewModelStore.get(key);

    if (modelClass.isInstance(viewModel)) {
        if (mFactory instanceof OnRequeryFactory) {
            ((OnRequeryFactory) mFactory).onRequery(viewModel);
        }
        return (T) viewModel;
    } else {
        //noinspection StatementWithEmptyBody
        if (viewModel != null) {
            // TODO: log a warning.
        }
    }
    if (mFactory instanceof KeyedFactory) {
        viewModel = ((KeyedFactory) mFactory).create(key, modelClass);
    } else {
        viewModel = mFactory.create(modelClass);
    }
    mViewModelStore.put(key, viewModel);
    return (T) viewModel;
}
```

### 抽象工厂模式

这个看了半天确实没太理解到底是什么概念，硬着头皮写写吧。

拿生产电脑举例子，电脑配件有主板、芯片组、CPU 等，这些被称为“产品族”。而同一个产品又会有不同的厂家来生产，这样的话不同厂家之间的同族产品同属一个“等级”。

一般情况下，我们只需要有 CPU 工厂、主板工厂等，调用这些工厂的方法去构造最终产品即可。但是不同厂商之间的配件可能出现不兼容的情况，这时调用端是不清楚这个问题的，因此我们引入一个新的电脑工厂，由这个工厂负责具体配件的构造。

```kotlin
interface PCFactory {
    fun makeCPU(): CPU
    fun makeMainBoard(): MainBoard
}

class AmdFactory : PCFactory {
    fun makeCPU() = AmdCPU()
    fun makeMainBoard() = AmdMainBoard()
}

class IntelFactory : IntelFactory {
    fun makeCPU() = IntelCPU()
    fun makeMainBoard() = IntelMainBoard()
}

class Main {
    fun main() {
        val computerFactory = AmdFactory();
        val cpu = computerFactory.makeCPU();
        val board = computerFactory.makeMainBoard();
        val computer = Computer(cpu, board);
    }
}
```

但是抽象工厂模式违反了开闭原则（对修改关闭，对扩展开放）。如果我们要再生产显示器，就需要修改所有的工厂类。

## 观察者模式

主要角色有 Observable（可观察对象，或者叫 Subject）和 Observer（观察者）。Observer 订阅 Observable，而 Observable 在事件发生时通知 Observer。实际应用中的典型实例有 RxJava 和 LiveData 等。这里以阿里云代码重构大赛的预赛第一题为例：

```kotlin
// Machine 即就是抽象 Observer。由于需要一个 machineStatus 属性，采用抽象类而不是接口
abstract class Machine {
    var machineStatus = false

    fun getStatus() = machineStatus
    abstract fun start(temp: Int, humidity: Int, windPower: Int)
}

// 具体 Observer
class ReapingBaseMachine : Machine() {
    private val temperatureThreshold = 5
    private val humidityThreshold = 65

    override fun start(temp: Int, humidity: Int, windPower: Int) {
        if (temp > temperatureThreshold && humidity > humidityThreshold) {
            machineStatus = true
        }
    }
}

// 抽象 Observable
interface Observable {
    fun measurementsChanged(temp: Int, humidity: Int, windPower: Int)
}

// 具体 Observable
class WeatherData : Observable {
    private val machines: Vector<BaseMachine> = Vector()
    
    fun addMachine(machine: BaseMachine) {
        machines.add(machine)
    }

    // 在这里通知 Observer
    override fun measurementsChanged(temp: Int, humidity: Int, windPower: Int) {
        for (machine in machines) {
            machine.start(temp, humidity, windPower)
        }
    }
}
```

## 责任链模式

如果对于某个请求，需要使用一连串的 `if-else` 进行处理，那么我们就说这一连串的 `if-else` 构成了一个责任链。比如说判断成绩等级，我们会写：

```kotlin
fun getGrade(score: Int) = when {
    score >= 90 -> "A"
    score >= 75 -> "B"
    score >= 60 -> "C"
    else -> "D"
}
```

或者考虑这么一个场景：疫情期间离校需要请假，根据请假天数的不同需要上报给不同的部门，1 天的由辅导员批准，1~3 天的由学院批准，3 天以上的由校领导批准。而无论请假多久，学生只需要向辅导员提交申请。那么会有：

```kotlin
fun askForOff(days: Int) = when {
    days <= 1 -> isApprovedByTeahcer(days)
    days <= 3 -> isApprovedByCollege(days)
    else -> isApprovedBySchool(days)
}
```

但是这种原始的写法耦合度会很高，而且也不适用于判断条件比较复杂的情况。因此我们可以把每个处理节点抽取出来，让调用方只需要关注结果，而不需要关注具体是由哪个节点得出的结果。这就是责任链模式。细分下来还有纯责任链和非纯责任链两种。

### 纯责任链模式

上面讨论的两种原始情况就是纯责任链模式，即针对同一个请求，按照不同的条件去完成不同的操作。对于请假这种情况，我们改写一下：

```kotlin
internal interface Handler {
    
    /**
     * 处理请求
     */
    fun handleRequest(days: Int)

    /**
     * 设置下一个执行者
     */
    fun setSuccesor(handler: Handler)

    /**
     * 获取下一个执行者
     */
    fun getNextSucccesor(): Handler
}

/**
 * 各领导层级
 */
open class Leader(var mName: String, var mCouldHandlerNum: Int) : Handler {

    var mNextHandler: Handler? = null

    override fun setSuccessor(handler: Handler) {
        mNextHandler = handler
    }

    override fun getNextSucccessor(): Handler? {
        return mNextHandler
    }

    override fun handleRequest(dayNums: Int) {
        if (dayNums <= mCouldHandlerNum) {
            println("$mName 同意了你的申请， dayNums = $dayNums")
        } else {
            val nextSuccessor = getNextSucccessor()
            if (nextSuccessor != null) {
                nextSuccessor.handleRequest(dayNums)
            } else {
                println("$mName 拒绝了你的申请 dayNums = $dayNums")
            }
        }
    }
}

/**
 * 辅导员
 */
class Teacher(name: String, couldHandlerNum: Int) : Leader(name, couldHandlerNum)

/**
 * 院领导
 */
class College(name: String, couldHandlerNum: Int) : Leader(name, couldHandlerNum)

/**
 * 校领导
 */
class School(name: String, couldHandlerNum: Int) : Leader(name, couldHandlerNum)

fun main() {
    val teacher = Teacher("辅导员", 1)
    val college = College("院领导", 3)
    val school = School("校领导", Int.MAX_VALUE)

    teacher.setSuccessor(college)
    college.setSuccessor(school)

    teacher.handleRequest(1)
    teacher.handleRequest(3)
    teacher.handleRequest(7)
}
/*
  Output:
  辅导员 同意了你的申请，dayNums = 1
  院领导 同意了你的申请，dayNums = 3
  校领导 同意了你的申请，dayNums = 7
 */
```

纯责任链在 Android 中应用最多的就是对于对于触摸事件的分发。当触摸事件发生时，会按照如下顺序进行传递：

```
Activity -> PhoneWindow -> DecorView -> ViewGroup -> ... -> View
```

如果直到最后一个 View 也没有将这个事件消费掉，那么会反向传递：

```
Activity <- PhoneWindow <- DecorView <- ViewGroup <- ... <- View
```

最终再次回传给 Activity。如果此时还没有被消费掉，那么该事件将被抛弃。

在 Android 的这种设计中，上层 View 既可以直接拦截该事件，自己处理，也可以先询问（分发给）子 View，如果子 View 需要就交给子 View 处理，如果子 View 不需要还能继续交给上层 View 处理。

具体参见：https://www.cnblogs.com/renhui/p/12127680.html

### 非纯责任链模式

非纯责任链模式是指，对于同一个最终结果，链上的各个层级只完成一部分工作。典型的例子就是 OkHttp 中的拦截器（Interceptor）机制（有点中间件的感觉）。

OkHttp 4 中 `Interceptor` 接口如下：

```kotlin
interface Interceptor {
  /**
   * 在这里实际进行拦截
   */
  @Throws(IOException::class)
  fun intercept(chain: Chain): Response

  companion object {
    /**
     * 用于在 Kotlin 中可以使用 Lambda 表达式方式构造拦截器
     *
     * ```
     * val interceptor = Interceptor { chain: Interceptor.Chain ->
     *     chain.proceed(chain.request())
     * }
     * ```
     */
    inline operator fun invoke(crossinline block: (chain: Chain) -> Response): Interceptor =
        object : Interceptor {
          override fun intercept(chain: Chain) = block(chain)
        }
  }

  /**
   * 真正实现责任链的是 Chain
   */
  interface Chain {
    fun request(): Request

    // 在这里进行向下一级的传递
    @Throws(IOException::class)
    fun proceed(request: Request): Response

    fun connection(): Connection?

    fun call(): Call

    fun connectTimeoutMillis(): Int

    fun withConnectTimeout(timeout: Int, unit: TimeUnit): Chain

    fun readTimeoutMillis(): Int

    fun withReadTimeout(timeout: Int, unit: TimeUnit): Chain

    fun writeTimeoutMillis(): Int

    fun withWriteTimeout(timeout: Int, unit: TimeUnit): Chain
  }
}
```

`Interceptor.Chain` 的具体实现是 `RealInterceptorChain`：

```kotlin
class RealInterceptorChain(
  internal val call: RealCall,
  private val interceptors: List<Interceptor>,
  private val index: Int,
  internal val exchange: Exchange?,
  internal val request: Request,
  internal val connectTimeoutMillis: Int,
  internal val readTimeoutMillis: Int,
  internal val writeTimeoutMillis: Int
) : Interceptor.Chain {

  private var calls: Int = 0

  internal fun copy(
    index: Int = this.index,
    exchange: Exchange? = this.exchange,
    request: Request = this.request,
    connectTimeoutMillis: Int = this.connectTimeoutMillis,
    readTimeoutMillis: Int = this.readTimeoutMillis,
    writeTimeoutMillis: Int = this.writeTimeoutMillis
  ) = RealInterceptorChain(call, interceptors, index, exchange, request, connectTimeoutMillis,
      readTimeoutMillis, writeTimeoutMillis)

  override fun connection(): Connection? = exchange?.connection

  override fun connectTimeoutMillis(): Int = connectTimeoutMillis

  override fun withConnectTimeout(timeout: Int, unit: TimeUnit): Interceptor.Chain {
    check(exchange == null) { "Timeouts can't be adjusted in a network interceptor" }

    return copy(connectTimeoutMillis = checkDuration("connectTimeout", timeout.toLong(), unit))
  }

  override fun readTimeoutMillis(): Int = readTimeoutMillis

  override fun withReadTimeout(timeout: Int, unit: TimeUnit): Interceptor.Chain {
    check(exchange == null) { "Timeouts can't be adjusted in a network interceptor" }

    return copy(readTimeoutMillis = checkDuration("readTimeout", timeout.toLong(), unit))
  }

  override fun writeTimeoutMillis(): Int = writeTimeoutMillis

  override fun withWriteTimeout(timeout: Int, unit: TimeUnit): Interceptor.Chain {
    check(exchange == null) { "Timeouts can't be adjusted in a network interceptor" }

    return copy(writeTimeoutMillis = checkDuration("writeTimeout", timeout.toLong(), unit))
  }

  override fun call(): Call = call

  override fun request(): Request = request

  // 处理调用
  @Throws(IOException::class)
  override fun proceed(request: Request): Response {
    check(index < interceptors.size)

    calls++

    if (exchange != null) {
      check(exchange.finder.sameHostAndPort(request.url)) {
        "network interceptor ${interceptors[index - 1]} must retain the same host and port"
      }
      check(calls == 1) {
        "network interceptor ${interceptors[index - 1]} must call proceed() exactly once"
      }
    }

    // 创建一个 RealInterceptorChain 实例
    val next = copy(index = index + 1, request = request)
    // 下一个 Interceptor（？）
    val interceptor = interceptors[index]

    @Suppress("USELESS_ELVIS")
    // 执行 Interceptor 的 intercept(chain) 函数
    val response = interceptor.intercept(next) ?: throw NullPointerException(
        "interceptor $interceptor returned null")

    if (exchange != null) {
      check(index + 1 >= interceptors.size || next.calls == 1) {
        "network interceptor $interceptor must call proceed() exactly once"
      }
    }

    check(response.body != null) { "interceptor $interceptor returned a response with no body" }

    return response
  }
}
```

整个过程是，首先检查是否已经遍历完成，没有的话则继续；然后 `calls` +1；接着以 `index` +1 构造一个新的 `RealInterceptorChain`；取出下一个 `Interceptor` 并执行其 `intercept(chain)`。通过一步步的迭代完成最终 `Response` 的构建。

## 代理模式

在日常生活中，如果我们要联系一个明星，是需要通过联系他的经纪人来完成；或者有时候游戏打得太菜，想要请代练帮忙上分；再或者通过房屋中介买房等等，这些就是典型代理模式。经纪人、代练和中介就是代理（Proxy），他们代替“我”去完成一些事情。

以找代练上分为例，具体代理模式还分以下几种。

### 静态代理

```kotlin
interface Player {
    fun playGame()
}

class PlayerImpl: Player {
    override fun playGame() {
        println("Playing...")
    }
}

class Proxy(val player: PlayerImpl): Player {
    override fun playGame() {
        println("代练开始")
        player.PlayGame()
        println("代练结束")
    }
}

fun main() {
    val me = PlayerImpl()
    val proxy = Proxy(me)
    proxy.playGame()
}
```

### 透明代理（普通代理）

这个说法只在网上找到了很少很少的资料，感觉和静态代理差不太多。唯一的区别就是，对外只暴露代理类。代码改写如下：

```kotlin
interface Player {
    fun playGame()
}

class PlayerImpl: Player {
    override fun playGame() {
        println("Playing...")
    }
}

class Proxy(): Player {
    private val player = PlayerImpl()
    
    override fun playGame() {
        println("代练开始")
        player.PlayGame()
        println("代练结束")
    }
}

fun main() {
    val proxy = Proxy()
    proxy.playGame()
}
```

### 动态代理

动态代理中，对于代理类的生成是在运行时完成的，不再需要我们手动定义一个 Proxy 类。

```kotlin
fun main() {
    val player = PlayerImpl()

    val otherProxy = Proxy.newProxyInstance(
        player::class.java.classLoader,
        player::class.java.interfaces
    ) { _, method, args ->
        if (method.name == "playGame") {
            method.invoke(player)
        } else {
            return@newProxyInstance method.invoke(player, args)
        }
        null
    } as Player

    otherProxy.playGame()
}
```

动态代理的生成是借助于 Java 中 `Proxy` 类的 `newProxyInstance(ClassLoader loader, Class<?>[] interfaces, InvocationHandler h)` 这个静态方法完成的。第一个参数指定了生成的代理对象使用哪个类装载器，一般是被代理的类的装载器；第二个参数通过接口指定生成哪个对象的代理对象；第三个参数指定了生成的代理对象的方法需要完成的操作。

在动态代理中，我们需要明确以下三点：

- 代理对象拥有目标对象相同的方法。因为第二个参数指定了对象的接口，代理对象会实现接口的所有方法。

- 无论调用代理对象的什么方法，都是在调用处理器的 `invoke` 方法。

- 使用 JDK 动态代理必须要有接口，因为第二个参数需要接口。

Retrofit 使用的就是动态代理模式。我们只需要定义请求的接口，由 Retrofit 负责最终代理创建。

```java
public <T> T create(final Class<T> service) {
    validateServiceInterface(service);
    return (T)
        Proxy.newProxyInstance(
            service.getClassLoader(),
            new Class<?>[] {service},
            new InvocationHandler() {
              private final Platform platform = Platform.get();
              private final Object[] emptyArgs = new Object[0];

              @Override
              public @Nullable Object invoke(Object proxy, Method method, @Nullable Object[] args)
                  throws Throwable {
                // If the method is a method from Object then defer to normal invocation.
                if (method.getDeclaringClass() == Object.class) {
                  return method.invoke(this, args);
                }
                args = args != null ? args : emptyArgs;
                return platform.isDefaultMethod(method)
                    ? platform.invokeDefaultMethod(method, service, proxy, args)
                    : loadServiceMethod(method).invoke(args);
              }
            });
  }
```



## 单例模式

### 懒汉式（非线程安全）

```java
public class Singleton {
    private static Singleton singleton;
    
    private Singleton() {
    }
    
    public static Singleton1 getInstance() {
        if (singleton == null) {
            singleton = new Singleton();
        }
        return singleton;
    }
}
```

这种方式实现了懒加载（Lazy Load），但是线程不安全。

### 懒汉式（线程安全）

```java
public class Singleton {
    private static Singleton instance;

    private Singleton () {
    }

    public static synchronized Singleton getInstance() {
        if (instance == null) {
            instance = new Singleton();
        }
        return instance;
    }
}
```

这种方式在非线程安全的基础上使用 `synchronized` 关键字限制了同时只能有一个线程访问 `getInstance()` 以保证线程安全，即独占性排他锁。因此实际上还是串行，在实际中性能较差。

### 饿汉式

```Java
public class Singleton {
    private static Singleton instance = new Singleton();

    private Singleton (){
    }

    public static Singleton getInstance() {
    	return instance;
    }
}
```

这种方式基于 ClassLoader 机制避免了多线程的同步问题。但在类装载时就会实例化 `instance`，存在性能问题。

### 双重校验锁

```java
public class Singleton {
    private volatile static Singleton singleton;

    private Singleton() {
    }

    public static Singleton getSingleton() {
        if (singleton == null) {
            synchronized (Singleton.class) {
                if (singleton == null) {
                    singleton = new Singleton();
                }
            }
        }
        return singleton;
    }
}
```

首先如果对象已经被实例化则直接返回，否则加锁，然后再检查一次，如果没有被实例化则创建一个新的对象，最后返回。执行双重检查是因为，如果多个线程同时了通过了第一次检查，并且其中一个线程首先通过了第二次检查并实例化了对象，那么剩余通过了第一次检查的线程就不会再去实例化对象。这样，除了初始化的时候会出现加锁的情况，后续的所有调用都会避免加锁而直接返回，解决了性能消耗的问题。

由于创建对象的过程实际上是分配空间、初始化对象、将对象指向分配好的空间三步，因此这种方法一定要注意加上 `volatile` 关键字来避免出现指令重排导致访问到未创建完全的对象。

### 静态内部类

```java
public class Singleton {
    private static class SingletonHolder {
        private static final Singleton INSTANCE = new Singleton();
    }

    private Singleton() {
    }

    public static final Singleton getInstance() {
        return SingletonHolder.INSTANCE;
    }
}
```

这种方式是对双重校验锁方式的一种改进，将加锁交由 JVM 负责，也是利用了 ClassLoader 的机制来保证初始化 `INSTANCE`  时只有一个线程。同时，由于 `Singleton` 被装载时，`SingletonHolder` 不一定被装载，后者只有会在第一次调用的时候才装载，因此也实现了懒加载。

### 枚举

```java
public enum Singleton {
    INSTANCE;

    public void whateverMethod() {
    }
}
```

这种方式不仅能避免多线程同步问题，而且还自动支持序列化机制，防止反序列化重新创建新的对象，绝对防止多次实例化。不过实际中较少使用，如果涉及到通过反序列化创建对象，可以采用这种方式。