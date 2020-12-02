# Android 应用的启动流程

## 预备知识

### Android 简单启动过程

Android 本身也是 Linux，在启动时，会创建 init 进程。这个进程是根进程。随后 init 会 fork 出一些 daemon 进程，这些进程会负责与底层硬件进行交互。

接下来 init 会 fork 出一个 Zygote 进程。这个进程是 Android 后续所有应用的基础。Zygote 会初始化第一个 VM，并加载相关的 framework 和后续应用需要的公共资源。同时也会开启一个 Socket 来监听新的应用启动请求，收到请求后会 fork 之前初始化的“第一个 VM”作为应用的运行环境。

然后 init 会继续 fork 出一个 runtime 进程。Zygote 则会进一步 fork 出一个 SystemServer 进程，该进程会启动系统所有的核心服务，如 ActivityManagerService、一些硬件方面的 Service 等。

至此，系统准备好了启动第一个应用进程——Launcher 进程（启动器，也就是桌面）。

### 相关概念

#### ActivityManagerService 和 ActivityTaskManagerService

ActivityManagerService 主要负责系统中四大组件的启动、切换、调度及应用进程的管理和调度等工作，对于一些进程的启动，都会通过 Binder 通信机制传递给 AMS，再处理给 Zygote。

ActivityTaskManagerService 在 API 29 被引入，代替原先的 AMS。

#### PackageManagerService

主要负责应用包的一些操作，比如安装，卸载，解析AndroidManifest.xml，扫描文件信息等等。

#### WindowManagerService

主要负责窗口相关的一些服务，比如窗口的启动，添加，删除等。

## 启动应用

### IPC

Launcher 首先调用 `Activity#startActivityForResult()` 来准备启动应用。最终这个调用会转到 `mInstrumentation#execStartActivity()` 方法。由于 Launcher 自己处在一个单独的进程，所以它需要跨进程告诉系统服务启动应用的需求。接下来找到要通知的 Service，也就是上面提到的 ActivityTaskManagerService，然后使用 AIDL，通过 Binder 进行通信。

```java
// Instrumentation.java
int result = ActivityTaskManager.getService()
        .startActivity(whoThread, who.getBasePackageName(), intent,
                intent.resolveTypeIfNeeded(who.getContentResolver()),
                token, target != null ? target.mEmbeddedID : null,
                requestCode, 0, null, options);

// ActivityTaskManager.java
public static IActivityTaskManager getService() {
    return IActivityTaskManagerSingleton.get();
}
    
private static final Singleton<IActivityTaskManager> IActivityTaskManagerSingleton =
        new Singleton<IActivityTaskManager>() {
            @Override
            protected IActivityTaskManager create() {
                final IBinder b = ServiceManager.getService(Context.ACTIVITY_TASK_SERVICE);
                return IActivityTaskManager.Stub.asInterface(b);
            }
        };

// ActivityTaskManagerService.java
public class ActivityTaskManagerService extends IActivityTaskManager.Stub

public static final class Lifecycle extends SystemService {
    private final ActivityTaskManagerService mService;

    public Lifecycle(Context context) {
        super(context);
        mService = new ActivityTaskManagerService(context);
    }

    @Override
    public void onStart() {
        publishBinderService(Context.ACTIVITY_TASK_SERVICE, mService);
        mService.start();
    }
}
```

启动应用从 `startActivity()` 开始，会传入对应的包含了要启动 Activity 信息的 intent。

在 `startActivity()` 之后还有个 `checkStartActivityResult()` 检查启动 Activity 的结果。当启动 Activity 失败的时候，就会通过这个方法抛出异常，比如有我们常见的 Activity 未在 AndroidManifest.xml 注册，就会触发异常。

```java
public static void checkStartActivityResult(int res, Object intent) {
    switch (res) {
        case ActivityManager.START_INTENT_NOT_RESOLVED:
        case ActivityManager.START_CLASS_NOT_FOUND:
            if (intent instanceof Intent && ((Intent)intent).getComponent() != null)
                throw new ActivityNotFoundException(
                        "Unable to find explicit activity class "
                                + ((Intent)intent).getComponent().toShortString()
                                + "; have you declared this activity in your AndroidManifest.xml?");
            throw new ActivityNotFoundException(
                    "No Activity found to handle " + intent);
        case ActivityManager.START_PERMISSION_DENIED:
            throw new SecurityException("Not allowed to start activity "
                    + intent);
        case ActivityManager.START_FORWARD_AND_REQUEST_CONFLICT:
            throw new AndroidRuntimeException(
                    "FORWARD_RESULT_FLAG used while also requesting a result");
        case ActivityManager.START_NOT_ACTIVITY:
            throw new IllegalArgumentException(
                    "PendingIntent is not an activity");
            // ...
    }
}
```

### 通知 Launcher

Launcher 也是一个应用，也是要遵循生命周期的。在 ATMS 收到消息之后，会通知 Launcher 进入 `PAUSED` 状态。

```java
// ActivityStack.java
private boolean resumeTopActivityInnerLocked(ActivityRecord prev, ActivityOptions options) {
    // ...
    ActivityRecord next = topRunningActivityLocked(true /* focusableOnly */);
    // ...
    boolean pausing = getDisplay().pauseBackStacks(userLeaving, next, false);
    if (mResumedActivity != null) {
        if (DEBUG_STATES) Slog.d(TAG_STATES,
                "resumeTopActivityLocked: Pausing " + mResumedActivity);
        pausing |= startPausingLocked(userLeaving, false, next, false);
    }
    // ...

    if (next.attachedToProcess()) {
        // 应用已经启动
        try {
            // ...
            transaction.setLifecycleStateRequest(
                    ResumeActivityItem.obtain(next.app.getReportedProcState(),
                            getDisplay().mDisplayContent.isNextTransitionForward()));
            mService.getLifecycleManager().scheduleTransaction(transaction);
            // ...
        } catch (Exception e) {
            // ...
            mStackSupervisor.startSpecificActivityLocked(next, true, false);
            return true;
        }
        // ...
        // From this point on, if something goes wrong there is no way
        // to recover the activity.
        try {
            next.completeResumeLocked();
        } catch (Exception e) {
            // If any exception gets thrown, toss away this
            // activity and try the next one.
            Slog.w(TAG, "Exception thrown during resume of " + next, e);
            requestFinishActivityLocked(next.appToken, Activity.RESULT_CANCELED, null,
                    "resume-exception", true);
            return true;
        }
    } else {
        // 冷启动流程
        mStackSupervisor.startSpecificActivityLocked(next, true, true);
    }
}
```

`ActivityStack` 是 Activity 的栈管理，相当于我们平时项目里面自己写的 Activity 管理类，用于管理 Activity 的状态，如入栈出栈顺序等。`ActivityRecord` 代表具体的某一个 Activity，存放了该 Activity 的各种信息。

`startPausingLocked()` 通知 Launcher 进入 `PAUSED` 状态。然后就会判断应用是否启动，如果已经启动了，就会走 `ResumeActivityItem`，这个方法用来控制 Activity 生命周期中的 `onResume()` 和 `onStart()` 方法。

如果应用没有启动，会执行 `startSpecificActivityLocked()` 方法。

### 检查进程是否已启动；创建进程

Launcher 进入 `PAUSED` 状态之后，ATMS 会开始检查要启动的应用是否已经启动了，如果已经启动则走启动 Activity 的流程（参见 [Activity 的生命周期](https://github.com/luy-0/2022-CS-Interview/blob/main/Android/Activity/Activity%20%E7%9A%84%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F-Robotxm.md)），否则创建进程。

如果一个应用已经启动了，会在 ATMS 里面保存一个 `WindowProcessController` 信息，这个信息包括 `processName` 和 `uid`。`uid` 是应用程序的 ID，可以通过 `applicationInfo.uid` 获取。`processName` 是进程名，一般为程序包名。根据 `processName` 和 `uid` 去判断是否有对应的 `WindowProcessController`，并且 `WindowProcessController` 里面的线程是否为空，就能判断应用是否已经启动了进程。

```java
// ActivityStackSupervisor.java
void startSpecificActivityLocked(ActivityRecord r, boolean andResume, boolean checkConfig) {
    // Is this activity's application already running?
    final WindowProcessController wpc =
            mService.getProcessController(r.processName, r.info.applicationInfo.uid);

    boolean knownToBeDead = false;
    if (wpc != null && wpc.hasThread()) {
        // 应用进程存在
        try {
            realStartActivityLocked(r, wpc, andResume, checkConfig);
            return;
        }
    }
}

// WindowProcessController.java
IApplicationThread getThread() {
    return mThread;
}

boolean hasThread() {
    return mThread != null;
}
```

如果应用没有启动，则通知 Zygote 去 fork 出一个新的进程用于启动应用。

```java
// ZygoteProcess.java
private Process.ProcessStartResult attemptUsapSendArgsAndGetResult(
        ZygoteState zygoteState, String msgStr)
        throws ZygoteStartFailedEx, IOException {
    try (LocalSocket usapSessionSocket = zygoteState.getUsapSessionSocket()) {
        final BufferedWriter usapWriter =
                new BufferedWriter(
                        new OutputStreamWriter(usapSessionSocket.getOutputStream()),
                        Zygote.SOCKET_BUFFER_SIZE);
        final DataInputStream usapReader =
                new DataInputStream(usapSessionSocket.getInputStream());

        usapWriter.write(msgStr);
        usapWriter.flush();

        Process.ProcessStartResult result = new Process.ProcessStartResult();
        result.pid = usapReader.readInt();
        // USAPs can't be used to spawn processes that need wrappers.
        result.usingWrapper = false;

        if (result.pid >= 0) {
            return result;
        } else {
            throw new ZygoteStartFailedEx("USAP specialization failed");
        }
    }
}
```

前面提到过，和 Zygote 通信的方式是 Socket，这里也能从代码看出。`BufferedWriter` 用于读取和接收消息。这里将要新建进程的消息传递给 Zygote，由 Zygote 进行 fork，并返回新进程的 `pid`。

使用 Socket 而不是 Binder 通信是因为，fork 不允许存在多线程，而 Binder 需要多线程。至于为什么 fork 不允许存在多线程，则是为了防止死锁。假设一个继承的线程 A 对某个锁进行了 Lock，另外一个线程 B 调用 fork 创建了子进程。子进程没有了线程 A，但是锁本身却被 fork 了出来，那么这个锁就无法解除了。一旦子进程中另外的线程又对这个锁进行 lock，就死锁了。

### `ActivityThread`

在 Zygote 进行 fork 的过程中，也会实例化 `ActivityThread`。

```java
// RuntimeInit.java
protected static Runnable findStaticMain(String className, String[] argv,
                                         ClassLoader classLoader) {
    Class<?> cl;

    try {
        cl = Class.forName(className, true, classLoader);
    } catch (ClassNotFoundException ex) {
        throw new RuntimeException(
                "Missing class when invoking static main " + className,
                ex);
    }

    Method m;
    try {
        m = cl.getMethod("main", new Class[] { String[].class });
    } catch (NoSuchMethodException ex) {
        throw new RuntimeException(
                "Missing static main on " + className, ex);
    } catch (SecurityException ex) {
        throw new RuntimeException(
                "Problem getting static main on " + className, ex);
    }
    // ...
    return new MethodAndArgsCaller(m, argv);
}
```

这里通过反射调用了 `ActivityThread#main()` 方法。`ActivityThread` 是应用的主线程，`main()` 也就是应用的入口点。

```java
public static void main(String[] args) {
    // ...
    Looper.prepareMainLooper();

    ActivityThread thread = new ActivityThread();
    thread.attach(false, startSeq);

    // ...

    if (false) {
        Looper.myLooper().setMessageLogging(new
                LogPrinter(Log.DEBUG, "ActivityThread"));
    }
    // ...
    Looper.loop();

    throw new RuntimeException("Main thread loop unexpectedly exited");
}
```

`main()` 中创建了 `ActivityThread` 和主线程的 `Looper` 对象，并开始 `loop()` 循环。同时通知 AMS 进程创建完毕。

上面的 `attach()` 最终会调用 AMS 的 `attachApplicationLocked()` 方法。

```java
// ActivitymanagerService.java
private final boolean attachApplicationLocked(IApplicationThread thread,
                                              int pid, int callingUid, long startSeq) {
    // ...
    ProcessRecord app;
    // ...
    thread.bindApplication(processName, appInfo, providers, null, profilerInfo,
            null, null, null, testMode,
            mBinderTransactionTrackingEnabled, enableTrackAllocation,
            isRestrictedBackupMode || !normalMode, app.isPersistent(),
            new Configuration(app.getWindowProcessController().getConfiguration()),
            app.compat, getCommonServicesLocked(app.isolated),
            mCoreSettingsObserver.getCoreSettingsLocked(),
            buildSerial, autofillOptions, contentCaptureOptions);
    // ...
    app.makeActive(thread, mProcessStats);

    // ...
    // See if the top visible activity is waiting to run in this process...
    if (normalMode) {
        try {
            didSomething = mAtmInternal.attachApplication(app.getWindowProcessController());
        } catch (Exception e) {
            Slog.wtf(TAG, "Exception thrown launching activities in " + app, e);
            badApp = true;
        }
    }
    // ...
}

// ProcessRecord.java
public void makeActive(IApplicationThread _thread, ProcessStatsService tracker) {
    // ...
    thread = _thread;
    mWindowProcessController.setThread(thread);
}
```

调用 `bindApplication()` 启动 Application。调用 `makeActive()` 设定 `WindowProcessController` 里面的线程，也就是上文中说过判断进程是否存在所用到的那个线程。`attachApplication()` 则用于启动根 Activity。

### 创建 `Application`

```java
// ActivityThread#ApplicationThread
public final void bindApplication(String processName, ApplicationInfo appInfo,
                                  List<ProviderInfo> providers, ComponentName instrumentationName,
                                  ProfilerInfo profilerInfo, Bundle instrumentationArgs,
                                  IInstrumentationWatcher instrumentationWatcher,
                                  IUiAutomationConnection instrumentationUiConnection, int debugMode,
                                  boolean enableBinderTracking, boolean trackAllocation,
                                  boolean isRestrictedBackupMode, boolean persistent, Configuration config,
                                  CompatibilityInfo compatInfo, Map services, Bundle coreSettings,
                                  String buildSerial, AutofillOptions autofillOptions,
                                  ContentCaptureOptions contentCaptureOptions) {
    AppBindData data = new AppBindData();
    data.processName = processName;
    data.appInfo = appInfo;
    data.providers = providers;
    data.instrumentationName = instrumentationName;
    data.instrumentationArgs = instrumentationArgs;
    data.instrumentationWatcher = instrumentationWatcher;
    data.instrumentationUiAutomationConnection = instrumentationUiConnection;
    data.debugMode = debugMode;
    data.enableBinderTracking = enableBinderTracking;
    data.trackAllocation = trackAllocation;
    data.restrictedBackupMode = isRestrictedBackupMode;
    data.persistent = persistent;
    data.config = config;
    data.compatInfo = compatInfo;
    data.initProfilerInfo = profilerInfo;
    data.buildSerial = buildSerial;
    data.autofillOptions = autofillOptions;
    data.contentCaptureOptions = contentCaptureOptions;
    sendMessage(H.BIND_APPLICATION, data);
}

public void handleMessage(Message msg) {
    if (DEBUG_MESSAGES) Slog.v(TAG, ">>> handling: " + codeToString(msg.what));
    switch (msg.what) {
        case BIND_APPLICATION:
            Trace.traceBegin(Trace.TRACE_TAG_ACTIVITY_MANAGER, "bindApplication");
            AppBindData data = (AppBindData)msg.obj;
            handleBindApplication(data);
            Trace.traceEnd(Trace.TRACE_TAG_ACTIVITY_MANAGER);
            break;
    }
}
```

`bindApplication()` 中用到的 `H` 是主线程的一个 `Handler` 类，用于处理需要主线程处理的各类消息，包括 `BIND_SERVICE`、`LOW_MEMORY`、`DUMP_HEAP` 等。

```java
private void handleBindApplication(AppBindData data) {
    // ...
    try {
        final ClassLoader cl = instrContext.getClassLoader();
        mInstrumentation = (Instrumentation)
                cl.loadClass(data.instrumentationName.getClassName()).newInstance();
    }
    // ...
    Application app;
    final StrictMode.ThreadPolicy savedPolicy = StrictMode.allowThreadDiskWrites();
    final StrictMode.ThreadPolicy writesAllowedPolicy = StrictMode.getThreadPolicy();
    try {
        // If the app is being launched for full backup or restore, bring it up in
        // a restricted environment with the base application class.
        app = data.info.makeApplication(data.restrictedBackupMode, null);
        mInitialApplication = app;
        // don't bring up providers in restricted mode; they may depend on the
        // app's custom Application class
        if (!data.restrictedBackupMode) {
            if (!ArrayUtils.isEmpty(data.providers)) {
                installContentProviders(app, data.providers);
            }
        }

        // Do this after providers, since instrumentation tests generally start their
        // test thread at this point, and we don't want that racing.
        try {
            mInstrumentation.onCreate(data.instrumentationArgs);
        }
        // ...
        try {
            mInstrumentation.callApplicationOnCreate(app);
        } catch (Exception e) {
            if (!mInstrumentation.onException(app, e)) {
                throw new RuntimeException(
                        "Unable to create application " + app.getClass().getName()
                                + ": " + e.toString(), e);
            }
        }
    }
    // ...
}
```

首先创建了 `Instrumentation`，也就是上文一开始 `startActivity()` 的第一步。每个应用程序都有一个 `Instrumentation` 用于管理这个进程，比如要创建 Activity 的时候，首先就会执行到这个类里面。

`makeApplication()` 创建 `Application`。最终会走到 `newApplication()` 执行 `Application#attach()`。

```java
public Application newApplication(ClassLoader cl, String className, Context context)
        throws InstantiationException, IllegalAccessException,
        ClassNotFoundException {
    Application app = getFactory(context.getPackageName())
            .instantiateApplication(cl, className);
    app.attach(context);
    return app;
}
```

然后调用 `installContentProviders()` 启动应用的 Content Provider。接着进行 `onCreate()`。

```java
instrumentation.callApplicationOnCreate(app);

public void callApplicationOnCreate(Application app) {
    app.onCreate();
}
```

也就是创建 Applictaion→`attach()`→`onCreate()`。

### 启动 Activity

上面提到，在 `bindApplication()` 之后会 `attachApplication()`，而这个方法又会走到 `ActivityThread#handleLaunchActivity()`。

```java
public Activity handleLaunchActivity(ActivityClientRecord r,
                                     PendingTransactionActions pendingActions, Intent customIntent) {
    // ...
    WindowManagerGlobal.initialize();
    // ...
    final Activity a = performLaunchActivity(r, customIntent);
    // ...
    return a;
}
```

首先初始化 `WindowManagerGlobal`，也就是 WindowManagerService，为后续显示窗口做准备。

```java
private Activity performLaunchActivity(ActivityClientRecord r, Intent customIntent) {
    // 创建 ContextImpl
    ContextImpl appContext = createBaseContextForActivity(r);
    Activity activity = null;
    try {
        java.lang.ClassLoader cl = appContext.getClassLoader();
        // 创建 Activity
        activity = mInstrumentation.newActivity(
                cl, component.getClassName(), r.intent);
    }

    try {
        if (activity != null) {
            // 完成 Activity 的一些重要数据的初始化
            activity.attach(appContext, this, getInstrumentation(), r.token,
                    r.ident, app, r.intent, r.activityInfo, title, r.parent,
                    r.embeddedID, r.lastNonConfigurationInstances, config,
                    r.referrer, r.voiceInteractor, window, r.configCallback,
                    r.assistToken);

            if (customIntent != null) {
                activity.mIntent = customIntent;
            }

            // 设置 Activity 的主题
            int theme = r.activityInfo.getThemeResource();
            if (theme != 0) {
                activity.setTheme(theme);
            }

            // 调用 Activity 的 onCreate()
            if (r.isPersistable()) {
                mInstrumentation.callActivityOnCreate(activity, r.state, r.persistentState);
            } else {
                mInstrumentation.callActivityOnCreate(activity, r.state);
            }
        }
    }

    return activity;
}
```

首先创建 `ContextImpl` 对象。这是个 `Context` 的子类，实际上也就是我们平常开发中用到的 `Context`。这个对象会被传入 `activity#attach()`。

之后，会通过类加载器创建 Activity 的对象，然后设置好主题，最后调用了 Activity 的 `onCreate()` 方法。

```java
final void attach(Context context, ActivityThread aThread,
                  Instrumentation instr, IBinder token, int ident,
                  Application application, Intent intent, ActivityInfo info,
                  CharSequence title, Activity parent, String id,
                  NonConfigurationInstances lastNonConfigurationInstances,
                  Configuration config, String referrer, IVoiceInteractor voiceInteractor) {

    attachBaseContext(context);

    mWindow = new PhoneWindow(this, window, activityConfigCallback);
    mWindow.setWindowControllerCallback(this);
    mWindow.setCallback(this);
    mWindow.setOnWindowDismissedCallback(this);
    mWindow.getLayoutInflater().setPrivateFactory(this);
    if (info.softInputMode != WindowManager.LayoutParams.SOFT_INPUT_STATE_UNSPECIFIED) {
        mWindow.setSoftInputMode(info.softInputMode);
    }
}
```

`attach()` 中新建了 `PhoneWindow`，建立自己和 `Window` 的关联，并 `setSoftInputMode()`等。

## 总结

- Launcher 被调用点击事件，转到 `Instrumentation` 类的 `startActivity()` 方法
- `Instrumentation` 通过 IPC 告诉 AMS 要启动应用的需求
- AMS 反馈 Launcher，让 Launcher 进入 `PAUSED` 状态
- Launcher 进入 `PAUSED` 状态，AMS 转到 `ZygoteProcess` 类，并通过 Socket 与 Zygote 通信，告知 Zygote 需要新建进程
- Zygote fork 进程，并调用 `ActivityThread` 的 `main()`，也就是应用的入口点
- `ActivityThread` 的 `main()` 新建了 `ActivityThread`，并新建了 `Looper` 实例，开始 `loop` 循环
- 同时 `ActivityThread` 也告知AMS，进程创建完毕，开始创建 `Application`、`Provider`，并调用 `Applicaiton` 的 `attach()`、`onCreate()` 方法
- 最后就是创建 Context，通过类加载器加载 Activity，调用 Activity 的 `onCreate()` 方法

## 参考资料

[女儿拿着小天才电话手表问我App启动流程](https://juejin.cn/post/6867744083809419277)