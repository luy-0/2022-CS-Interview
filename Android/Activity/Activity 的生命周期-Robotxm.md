# Activity 的生命周期

![img](https://github.com/luy-0/2022-CS-Interview/blob/main/Android/Activity/Activity%20%E7%9A%84%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F-Robotxm.assets/20200724013645.png)

Activity 的生命周期主要有 `onCreate()`、`onStart()`、`onResume()`、`onPause()`、`onStop()` 和 `onDestroy()` 六个。如果要分类的话，从一个不太严谨的角度可以分为：**是否可交互（`onResume()`、`onPause()`）、是否可见（`onStart()`、`onStop()`）和是否存在（`onCreate()`、`onDestroy()`）**三类。

在 Activity 中使用下列常量来标识 Activity 当前的状态：

```java
// Activity 刚被创建时
public static final int ON_CREATE = 1;
// 执行完转到前台的最后准备工作
public static final int ON_START = 2;
// 执行完即将与用户交互的最后准备工作，此时该 Activity 位于前台
public static final int ON_RESUME = 3;
// 用户离开，Activity 进入后台
public static final int ON_PAUSE = 4;
// Activity 不可见
public static final int ON_STOP = 5;
// 执行完被销毁前最后的准备工作
public static final int ON_DESTROY = 6;
```

## 主要生命周期

### `onCreate()`

当 Activity 完成实例的创建，并调用 `attach()` 方法赋值 `PhoneWindow`、`ContextImpl` 等属性之后，调用此方法。该方法在整个 Activity 生命周期内只会调用一次。调用该方法后 Activity 进入 `ON_CREATE` 状态。

该方法是我们使用最频繁的一个回调方法。我们需要在这个方法中初始化基础组件和视图，如 ViewModel、TextView 等。同时必须在该方法中调用 `setContentView()` 来给 Activity 设置布局。`onCreate()` 接收一个参数 `savedInstanceState`，该参数包含有 Activity 之前状态的数据。如果是第一次启动，则该参数为 `null`。该参数来自 `onSaveInstanceState()` 存储的数据。只有当 Activity 暂时销毁并且预期一定会被重新创建的时候才会被回调，如屏幕旋转、后台应用被销毁等。

### `onStart()`

当 Activity 准备进入前台时会调用此方法。调用后会进入 `ON_START` 状态。**注意前台 Activity 不一定可见。**比如现在有 Activity1 和 Activity2，如果从 Activity1 跳转到 Activity2，并且后者完全遮挡住前者（即不是 DialogActivity 等），此时返回 Activity1 会走 `onRestart()` → `onStart()` → `onResume()`。

`onStart()` 是前台和后台 Activity 的区分。

### `onResume()`

当 Activity 准备与用户交互的时候调用，会调用此方法。调用后进入 `ON_RESUME` 状态。

如果上一节中的 Activity2 是 DialogActivity 等不会完全遮挡住 Activity1 的类型，那么 Activity1 会走 `onPause()` 进入 `ON_PAUSE` 状态。从 Activity1 返回 Activity2 时会调用 Activity1 的 `onResume()`。

### `onPause()`

当 Activity 失去焦点的时候，会调用此方法。调用后进入 `ON_PAUSE` 状态，并进入后台。一般在另一个 Activity 要进入前台之前，会调用当前 Activity 的此方法。只有当前 Activity 进入后台，其他的 Activity 才能进入前台。**该方法中不建议执行重量级的操作，否则会引用界面切换卡顿**。一般的使用场景为界面进入后台时的轻量级资源释放。

例子见上一节中的 Activity1。

### `onStop()`

当 Activity不可见时，会调用此方法。调用后 Activity 进入 `ON_STOP` 状态。

这里的不可见是严谨意义上的不可见。当 Activity 不可交互时会回调 `onPause()` 并进入 `ON_PAUSE` 状态。但如果进入的是另一个全屏的 Activity 而不是小窗口（例如对话框等），那么当新的 Activity 界面显示出来的时候，原 Activity 才会进入 `ON_STOP` 状态，并回调 `onStop()`。同时，Activity 第一次创建的时候，界面是在 `onResume()` 执行之后才显示出来，所以 `onStop()` 会在新 Activity 的 `onResume()` 回调之后再被回调。

由于被启动的 Activity 并不会等待当前 Activity 的 `onStop()` 执行完毕之后再显示，因此如果在 `onStop()` 里完成耗时操作也不会导致被启动的 Activity 启动延迟。

`onStop()` 的目的就是完成**资源释放**。因为是在另一个 Activity 显示之后再被回调，所以这里可以做一些相对重量级的资源释放操作，如中断网络请求、断开数据库连接、释放相机资源等。

如果一个应用的全部 Activity 都处于`ON_STOP`状态，那么这个应用是很有可能被系统杀死的。而如果一个 `ON_STOP` 状态的 Activity 被系统回收的话，系统会保留该 Activity 中 View 的相关信息到 Bundle 中，下一次恢复的时候，可以在 `onCreate()` 或者 `onRestoreInstanceState()` 中进行恢复。

### `onRestart()`

当从另一个 Activity 切回该 Activity 的时候会调用。调用后会立即继续调用 `onStart()`，之后 Activity 进入 `ON_START` 状态。

### `onDestroy()`

当 Activity 被系统杀死或者调用 `finish()` 方法之后，会调用该方法。调用之后 Activity 进入 `ON_DESTROY` 状态。

这个方法是 Activity 在被销毁前回调的最后一个方法。我们需要在这个方法中释放所有的资源，防止造成内存泄漏问题。回调后当前 Activity 就等待被系统回收了。如果再次打开该 Activity 需要重新创建，也就会重新走一遍完整的生命周期。

## 其他生命周期

### `onSaveInstanceState()` / `onRestoreInstanceState()`

这两个方法主要用于 Activity 被意外杀死时数据的保存和恢复。被意外杀死包括：整个应用被杀、配置更改（旋转屏幕、切换主题等）导致 Activity 重建。在 `onSaveInstanceState()` 中会进行一些界面数据的保存。而重建时则会调用 `onRestoreInstanceState()` 来恢复界面数据。

值得一提的是，`onRestoreInstanceState()` 和 `onCreate()` 方法的参数是一致的，只是回调时机的不同。**判断是否执行的关键因素就是用户是否期望返回该 Activity 时界面数据仍然存在。**

```java
/*If called, this method will occur after {@link #onStop} for applications
 * targeting platforms starting with {@link android.os.Build.VERSION_CODES#P}.
 * For applications targeting earlier platform versions this method will occur
 * before {@link #onStop} and there are no guarantees about whether it will
 * occur before or after {@link #onPause}.
 */
```

在 API28 及以上版本，`onSaveInstanceState()` 会在 `onStop()` 之后调用；在之前的版本则在 `onStop()` 之前调用，同时不保证和 `onPause()` 调用的先后顺序。

当 Activity 进入后台的时候，`onSaveInstanceState()` 就会被调用，而不是真的出现了意外情况下才会调用。因为系统并不确定在后台时，Activity 是否会被杀死，所以以最保险的方法就是先保存数据。当确实是被意外杀死时，可能用户期望 Activity 还持有之前的数据，因此会调用 `onRestoreInstanceState()` 来恢复数据。但是，按返回键或者调用 `finish()` 方法直接结束 Activity 时，是不会回调 `onSaveInstanceState()` 方法，因为非常明确下一次返回该 Activity 时用户期望的是一个界面干净的新 Activity。

在 `onSaveInstanceState()` 中不能进行重量级的数据存储。因为此时存储数据实际上时序列化到设备的存储空间中，如果数据过于庞大，会导致界面出现卡顿、掉帧等情况。

正常情况下，每个 View 都会重写这两个方法，当 Activity 的这两个方法被调用的时候，会向上委托 Window 去调用顶层 ViewGroup 的这两个方法。而 ViewGroup 会递归调用子 View 的 `onSaveInstanceState()` / `onRestoreInstanceState()` 方法，这样所有 View 的状态就都被恢复了。

### `onNewIntent()`

这个方法涉及到的场景和 `onRestart()` 一样也是重复启动，但是与后者被调用的时机是不同的。具体参见 [Android `launchMode`](https://github.com/luy-0/2022-CS-Interview/blob/main/Android/Activity/Android%20launchMode-Robotxm.md)。

## 生命周期的流程

### 一般情况

#### Activity 正常启动和结束

从图上能直观看出，正常的流程是：

```
onCreate() -> onStart() -> onResume() -> onPause() -> onStop() -> onDestroy()
```

#### Activity 间的切换

以从 Activity1 切换到 Activity2 为例：

```
Activity1.onPause() -> Activity2.onCreate() -> Activity2.onStart() -> Activity2.onResume() -> Activity1.onStop() -> Activity1.onSaveInstanceState()
```

当切换到另一个 Activity 时，当前 Activity 会先调用 `onPause()` 进入后台。被启动的 Activity 依次调用三个回调方法后准备与用户交互，这时原 Activity 再调用 `onStop()` 变得不可见，最后被启动的 Activity 才会显示出来。

理解这个生命周期顺序只需要记住两个点：前后台、是否可见。`onPause()` 之后 Activity 会进入后台。由于前台 Activity 只能有一个，所以原 Activity 必须先进入后台后，目标 Activity 才能启动并进入前台。`onStop()` 之后 Activity 变得不可见，因而只有在目标 Activity 即将要与用户交互、需要进行显示的时候，原 Activity 才会调用 `onStop()` 进入不可见状态。

从 Activity2 切回 Activity1 则是：

```
Activity2.onPause() -> Activity1.onRestart() -> Activity1.onStart() -> Activity1.onResume() -> Activity2.onStop() -> Activity2.onSaveInstanceState()
```

注意到上面有调用 `onSaveInstanceState()`，也就是前面提到的在进入后台之后调用。

#### 配置更改（以屏幕旋转为例）

```
onPause() -> onStop() -> onSaveInstanceState() -> onDestroy() -> onCreate() -> onStart() -> onRestoreInstanceState() -> onResume()
```

配置更改时会导致 Activity 的重建，这也就是之前提到的被意外杀死的情况，所以会进行相关数据的保存和恢复。

#### 当前应用处于后台并被系统杀死

```
onDestroy() -> onCreate() -> onStart() -> onRestoreInstanceState() -> onResume()
```

由于在 Activity 不可见时已经进行的数据的保存，这时就不再回调 `onSaveInstanceState()` 了。

#### 具有返回值的启动

```
onActivityResult() -> onRestart() -> onResume()
```

当使用 `startActivityForResult()` 启动另一个 Activity，再返回当前 Activity 时，当前 Activity 会完成上述生命周期流程。注意 `onActivityResult()` 会在其他生命周期回调之前执行。

### 不同 `launchMode` 下的表现

现有三个 Activity，分别是 A、B 和 C。其中 A 和 C 配置为 `standard`，B 配置为 `singleTask`，对于启动流程 A→B→C→B 则有下述生命周期：

```
A -> B:
A.onCreate() -> A.onStart() -> A.onResume() -> A.onPause() -> B.onCreate() -> B.onStart() -> B.onResume() -> A.onStop()

B -> C:
B.onPause() -> C.onCreate() -> C.onStart() -> C.onResume() -> B.onStop()

C -> B:
C.onPause() -> B.onNewIntent() -> B.onRestart() -> B.onStart() -> B.onResume() -> C.onStop() -> C.onDestory()
```

由于 `singleTask` 的关系，会调用 B 的 `onNewIntent()` 并将栈中 B 之上的 Activity 全部移除。这些 Activity 会走销毁流程。

如果保持上述顺序不变，但 B 配置为 `singleInstance`，则有：

```
A -> B:
A.onCreate() -> A.onStart() -> A.onResume() -> A.onPause() -> B.onCreate() -> B.onStart() -> B.onResume() -> A.onStop()

B -> C:
B.onPause() -> C.onCreate() -> C.onStart() -> C.onResume() -> B.onStop()

C -> B:
C.onPause() -> B.onNewIntent() -> B.onRestart() -> B.onStart() -> B.onResume() -> C.onStop()
```

由于 `singleInstance` 的关系，B 会被放置在一个新的 Task 中，因此并不会和 C 冲突，C 也就不会被销毁了。

保持 B 为 `singleInstance` 不变，启动顺序改为 A→B→C，在 C 启动完成之后，连按两次返回键，那么这时有：

```
第一次返回：
C.onPause() -> A.onRestart() -> A.onStart() -> A.onResume() -> C.onStop() -> C.onDestory()

第二次返回：
A.onPause() -> B.onRestart() -> B.onStart() -> B.onResume() -> A.onStop() -> A.onDestory()
```

因为 A 和 C 的 `taskAffinity` 相同，因此会被放置在同一个 Task 中，A 在下 C 在上。B 单独处于一个新的 Task 中。所以从 C 返回时会回到 A，再返回才回到 B。

## 参考资料

[Android 生命周期全面解析](https://juejin.cn/post/6892745298209308680)
