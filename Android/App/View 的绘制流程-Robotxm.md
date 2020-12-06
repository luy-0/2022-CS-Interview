# View 的绘制流程

## 预备知识

### Activity 的启动流程

<img src="View 的绘制流程-Robotxm.assets\image-20201118153317902.png" alt="image-20201118153317902" style="zoom:67%;" />

### Activity 的结构

<img src="View 的绘制流程-Robotxm.assets\image-20201118153417465.png" alt="image-20201118153417465" style="zoom: 67%;" />

`PhoneWindow` 是 Android 系统中最基本的窗口系统，每个 Activity 会创建一个，是视图真正的控制者。`DecorView` 本质上是一个 FrameLayout，是 Activity 中所有 View 的祖先，即当前 Activity 视图树根节点。

## View 绘制的起源

在 Android 应用的启动过程中提到，在 `bindApplication()` 之后会 `attachApplication()`，而这个方法又会走到 `ActivityThread#handleLaunchActivity()`。注意这里面会先后调用 `performLaunchActivity()` 和 `handleResumeActivity()`。

```java
public Activity handleLaunchActivity(ActivityClientRecord r,
                                     PendingTransactionActions pendingActions, Intent customIntent) {
    //...
    WindowManagerGlobal.initialize();
    //...
    final Activity a = performLaunchActivity(r, customIntent);
    if (a != null) {
        r.createdConfig = new Configuration(mConfiguration);
        Bundle oldState = r.state;
        handleResumeActivity(r.token, false, r.isForward);
    }
    //...
    return a;
}
```

### `performLaunchActivity()`

在 `performLaunchActivity()` 中会进行 Activity 对象的创建、`PhoneWindow` 对象的创建、调用 `Activity#onCreate()`，初始化 `DecorView` ，添加布局到 `DecorView` 的 `content`，调用 `Activity#onStart()`。

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
            // 调用 Activity#onCreate()，创建 PhoneWindow 对象
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

            // 调用 Activity#onCreate()，初始化 DecorView，添加布局到 DecorView 的 content
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

`PhoneWindow` 对象具体在 `Activity#attach()` 中创建。

```java
final void attach(Context context, ActivityThread aThread,
                  Instrumentation instr, IBinder token, int ident,
                  Application application, Intent intent, ActivityInfo info,
                  CharSequence title, Activity parent, String id,
                  NonConfigurationInstances lastNonConfigurationInstances,
                  Configuration config, String referrer, IVoiceInteractor voiceInteractor) {

    attachBaseContext(context);

    // 创建 PhoneWindow
    mWindow = new PhoneWindow(this, window, activityConfigCallback);
    mWindow.setWindowControllerCallback(this);
    mWindow.setCallback(this);
    mWindow.setOnWindowDismissedCallback(this);
    mWindow.getLayoutInflater().setPrivateFactory(this);
    if (info.softInputMode != WindowManager.LayoutParams.SOFT_INPUT_STATE_UNSPECIFIED) {
        mWindow.setSoftInputMode(info.softInputMode);
    }
    // ...
    // 设置 PhoneWindow 的 WindowManager
    mWindow.setWindowManager(
            (WindowManager)context.getSystemService(Context.WINDOW_SERVICE),
            mToken, mComponent.flattenToString(),
            (info.flags & ActivityInfo.FLAG_HARDWARE_ACCELERATED) != 0);
    if (mParent != null) {
        mWindow.setContainer(mParent.getWindow());
    }
    // 将 WindowManager 关联到 Activity
    mWindowManager = mWindow.getWindowManager();
}
```

然后 `ActivityThread` 会调用 `Activity#onCreate()`，在这个方法里面又会调用 `setContentView()`。

```java
// Activity.java
public void setContentView(@LayoutRes int layoutResID) {
    getWindow().setContentView(layoutResID);
    initWindowDecorActionBar();
}
```

实际上这里又去进一步调用 `Window` 的 `setContentView()` 方法，具体的实现来自上面 `PhoneWindow`。

```java
// PhoneWindow.java
@Override
public void setContentView(int layoutResID) {
    
    if (mContentParent == null) {
        // 初始化 DecorView
        installDecor();
    } else if (!hasFeature(FEATURE_CONTENT_TRANSITIONS)) {
        // ...
    }

    if (hasFeature(FEATURE_CONTENT_TRANSITIONS)) {
        // ...
    } else {
        // 添加布局到 DecorView 的 content 
        mLayoutInflater.inflate(layoutResID, mContentParent);
    }
    // ...
}

private void installDecor() {
    // ...
    if (mDecor == null) {
        // 创建 DecorView 对象
        mDecor = generateDecor(-1);
        // ...
    } else {
        // ...
    }
    if (mContentParent == null) {
        // 为 DecorView 的 ContentView 设置布局
        // 这里 mContentParent 就是 Activity 中 setContentView 设置的布局文件中的最外层布局
        // 也就是 DecorWindow 中的 ContentView 对应的部分
        mContentParent = generateLayout(mDecor);
        // ...
    }
}
```

### `handleResumeActivity()`

`handleResumeActivity()` 方法里面执行了 2 个操作，调用 `Activity#onResume()`，将 `DecorView` 添加到 WindowManager。

```java
// ActivityThread.java
final void handleResumeActivity(IBinder token,
        boolean clearHide, boolean isForward, boolean reallyResume, int seq, String reason) {
    // ...
    // 调用 Activity#onResume()
    r = performResumeActivity(token, clearHide, reason);

    if (r != null) {
        // ...
        if (r.window == null && !a.mFinished && willBeVisible) {
            // ...
            if (a.mVisibleFromClient) {
                if (!a.mWindowAdded) {
                    a.mWindowAdded = true;
                    // 将 DecorView 添加到 WindowManager
                    // WindowManager 的实现类是 WindowManagerImpl
                    // 所以实际调用的是 WindowManagerImpl#addView() 方法
                    wm.addView(decor, l);
                } else {
                    // ...
                }
            }
        } else if (!willBeVisible) {
            // ...
        }
        // ...
    } else {
        // ...
    }
}

// WindowManagerImpl.java
@Override
public void addView(@NonNull View view, @NonNull ViewGroup.LayoutParams params) {
    applyDefaultToken(params);
    mGlobal.addView(view, params, mContext.getDisplay(), mParentWindow);
}
```

`ViewParent` 对应于 `ViewRootImpl` 类，它是连接 `WindowManager` 和 `DecorView` 的纽带，View 绘制的三大流程均是通过 `ViewParent` 来完成的。在 `ActivityThread` 中，当 Activity 对象被创建完毕后，会将 `DecorView` 添加到 `Window` 中，同时会创建 `ViewRootImpl` 对象，并将 `ViewRootImpl` 对象和 `DecorView` 建立关联，将 `DecorView` 实例对象交给 `ViewRootImpl` 用以绘制 View 。最后调用 `ViewRootImpl` 类中的 `performTraversals()`，从而实现视图的绘制。

```java
// WindowManagerGlobal.java

public void addView(View view, ViewGroup.LayoutParams params,
        Display display, Window parentWindow) {
    // ...
    synchronized (mLock) {
        // ...
        // 创建 ViewRootImpl 对象
        root = new ViewRootImpl(view.getContext(), display);
        // ...
        try {
            // 把 DecorView 加载到 Window 中
            root.setView(view, wparams, panelParentView);
        } catch (RuntimeException e) {
            // ...
        }
    }
}
```

`ViewRootImpl` 的代码如下：

```java
// ViewRootImpl.java

public void setView(View view, WindowManager.LayoutParams attrs, View panelParentView) {
    synchronized (this) {
        if (mView == null) {
            mView = view;
            // ...
            // Schedule the first layout -before- adding to the window
            // manager, to make sure we do the relayout before receiving
            // any other events from the system.
            requestLayout();
            // ...
            // 将 ViewRootImpl 对象和 DecorView 建立关联
            view.assignParent(this);
            // ...
        }
    }
}

@Override
public void requestLayout() {
    if (!mHandlingLayoutInLayoutRequest) {
        // ...
        scheduleTraversals();
    }
}

void scheduleTraversals() {
    if (!mTraversalScheduled) {
        // ...
        mChoreographer.postCallback(
                Choreographer.CALLBACK_TRAVERSAL, mTraversalRunnable, null);
        // ...
    }
}

final class TraversalRunnable implements Runnable {
    @Override
    public void run() {
        doTraversal();
    }
}
final TraversalRunnable mTraversalRunnable = new TraversalRunnable();

void doTraversal() {
    if (mTraversalScheduled) {
        // ...
        //
        performTraversals();
        // ...
    }
}
```

整个 View 树的绘图流程是在 `ViewRootImpl#performTraversals()` 方法开始的，它把控着整个绘制的流程。该函数做的执行过程主要是根据之前设置的状态，判断是否重新计算视图大小、是否重新放置视图的位置、以及是否重绘，从上到下遍历整个视图树，每个 View 控件负责绘制自己，而 ViewGroup 还需要负责通知自己的子 View 进行绘制操作。

## View 绘制的流程

```java
// ViewRootImpl.java
private void performTraversals() {
    final View host = mView;
    // ...
    int childWidthMeasureSpec = getRootMeasureSpec(mWidth, lp.width);
    int childHeightMeasureSpec = getRootMeasureSpec(mHeight, lp.height);
    // Ask host how big it wants to be
    performMeasure(childWidthMeasureSpec, childHeightMeasureSpec);
    // ...
    performLayout(lp, mWidth, mHeight);
    // ...
    performDraw();
    // ...
}
```
`performMeasure()`：此阶段的目的是计算出 View 树中的各个控件要显示其内容的话，需要多大尺寸。

`performLayout()`：此阶段的基本思想也是由根 View 开始，递归地完成整个 View 树的布局工作。

`performDraw()`：此阶段也是从根节点向下遍历 View 树，完成所有 ViewGroup 和 View 的绘制工作，根据布局过程计算出的显示区域，将所有 View 的当前需显示的内容画到屏幕上。

每一个 View 的绘制过程都必须经历三个最主要的阶段，`onMeasure()`、`onLayout()` 和 `onDraw()`，特别是我们进行自定义 View 的时候，可以明显地看出来，这三个方法分别对应到上面 `ViewRootImpl` 类中的三个 `performXXX()` 方法。

### `performMeasure()`

```java
// ViewRootImpl.java
private void performMeasure(int childWidthMeasureSpec, int childHeightMeasureSpec) {
    // ...
    try {
        mView.measure(childWidthMeasureSpec, childHeightMeasureSpec);
    } finally {
        // ...
    }
}
```

这里的 `mView` 就是之前的 `DecorView`。然后是 `measure()` 方法。

```java
// View.java
public final void measure(int widthMeasureSpec, int heightMeasureSpec) {
    // ...
    if (forceLayout || needsLayout) {
        // ...
        int cacheIndex = forceLayout ? -1 : mMeasureCache.indexOfKey(key);
        if (cacheIndex < 0 || sIgnoreMeasureCache) {
            // measure ourselves, this should set the measured dimension flag back
            onMeasure(widthMeasureSpec, heightMeasureSpec);
            // ...
        } else {
            // ...
        }
        // ...
    }
    // ...
}
```

由于 `measure()` 不允许重载，因此 View 的子类只能通过重载 `onMeasure()` 来实现其测量逻辑。这里还会先判断是否满足重新绘制的条件才会进行实际的测量工作，即 `forceLayout` （强制重新布局，可以通过 `View.requestLayout()` 来实现）或者 `needsLayout` （表示本次传入的 `MeasureSpec` 与上次传入的不同）为 `true`。

```java
// View.java
protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
    setMeasuredDimension(getDefaultSize(getSuggestedMinimumWidth(), widthMeasureSpec),
            getDefaultSize(getSuggestedMinimumHeight(), heightMeasureSpec));
}
```

- `onMeasure()` 会测量该 View 以及它的内容来决定测量的宽度和高度。该方法被 `measure(int, int)` 调用，并且应该被子类重写来提供准确而且有效的对它们的内容的测量。

- 当重写该方法时，必须调用 `setMeasuredDimension(int, int)` 来存储该 View 测量出的宽和高。如果不这样做将会触发 IllegalStateException，由 `measure(int, int)` 抛出。

- 测量的基类实现默认为背景的尺寸，除非 `MeasureSpec` 允许使用更大的尺寸。子类应该重写 `onMeasure(int, int)` 方法来提供对内容更好的测量。

- 如果该方法被重写，子类负责确保测量的高和宽至少是该 View 的 最小高度和最小宽度值。

- **对于非 ViewGroup 的 View 而言，通过调用上面默认的 `onMeasure()` 即可完成 View 的测量**。当然也可以重载 `onMeasure()` 并调用 `setMeasuredDimension()` 来设置任意大小的布局，这里就可以根据实际需求来决定，也就是说，如果不想使用系统默认的测量方式，可以按照自己的意愿进行定制。

- **当通过 `setMeasuredDimension()` 方法最终设置完成 View 的测量之后 View 的 `mMeasuredWidth` 和 `mMeasuredHeight` 成员变量才会有具体的数值，在 `setMeasuredDimension()` 方法调用之后，我们才能使用 `getMeasuredWidth()` 和 `getMeasuredHeight()` 来获取视图测量出的宽高，以此之前调用这两个方法得到的值都会是 0**。这也就是为什么电表中 `ExploreItem` 为了能实现在 `WRAP_CONTENT` 的情况下还能做到双列居中，需要提前调用 Item View 的 `measure()` 方法。

- 一个布局中一般都会包含多个子视图，每个视图都需要经历一次测量过程。ViewGroup 中定义了一个 `measureChildren()` 、`measureChild()` 和 `measureChildWithMargins()` 方法来去测量子视图的大小，三个方法最终都是调用子视图的 `measure()` 方法。`measureChildren()` 内部实质上是循环调用 `measureChild()` ，而 `measureChild()` 和 `measureChildWithMargins()` 的区别是在于是否把 `margin` 和 `padding` 也作为子视图的大小。

```java
// ViewGroup.java
protected void measureChildren(int widthMeasureSpec, int heightMeasureSpec) {
    final int size = mChildrenCount;
    final View[] children = mChildren;
    for (int i = 0; i < size; ++i) {
        final View child = children[i];
        if ((child.mViewFlags & VISIBILITY_MASK) != GONE) {
            measureChild(child, widthMeasureSpec, heightMeasureSpec);
        }
    }
}

protected void measureChild(View child, int parentWidthMeasureSpec,
        int parentHeightMeasureSpec) {
    final LayoutParams lp = child.getLayoutParams();

    final int childWidthMeasureSpec = getChildMeasureSpec(parentWidthMeasureSpec,
            mPaddingLeft + mPaddingRight, lp.width);
    final int childHeightMeasureSpec = getChildMeasureSpec(parentHeightMeasureSpec,
            mPaddingTop + mPaddingBottom, lp.height);

    child.measure(childWidthMeasureSpec, childHeightMeasureSpec);
}

protected void measureChildWithMargins(View child,
        int parentWidthMeasureSpec, int widthUsed,
        int parentHeightMeasureSpec, int heightUsed) {
    final MarginLayoutParams lp = (MarginLayoutParams) child.getLayoutParams();

    final int childWidthMeasureSpec = getChildMeasureSpec(parentWidthMeasureSpec,
            mPaddingLeft + mPaddingRight + lp.leftMargin + lp.rightMargin
                    + widthUsed, lp.width);
    final int childHeightMeasureSpec = getChildMeasureSpec(parentHeightMeasureSpec,
            mPaddingTop + mPaddingBottom + lp.topMargin + lp.bottomMargin
                    + heightUsed, lp.height);

    child.measure(childWidthMeasureSpec, childHeightMeasureSpec);
}
```

### `performLayout()`

测量过程结束后，就会开始布局过程。这个阶段会根据前面测量的尺寸以及设置的其它属性值，共同来确定 View 的位置。

```java
// ViewRootImpl.java
private void performLayout(WindowManager.LayoutParams lp, int desiredWindowWidth,
        int desiredWindowHeight) {
    // ...
    final View host = mView;
    // ...
    try {
        host.layout(0, 0, host.getMeasuredWidth(), host.getMeasuredHeight());
        // ...
        if (numViewsRequestingLayout > 0) {
            // ...
            if (validLayoutRequesters != null) {
                // ...
                host.layout(0, 0, host.getMeasuredWidth(), host.getMeasuredHeight());
                // ...
            }
        }
    } finally {
        // ...
    }
    // ...
}
```

这里的 `host` 就是 `DecorView`，它继承了 FrameLayout，

```java
// ViewGroup.java
@Override
public final void layout(int l, int t, int r, int b) {
    if (!mSuppressLayout && (mTransition == null || !mTransition.isChangingLayout())) {
        // ...
        super.layout(l, t, r, b);
    } else {
        // ...
    }
}
```

与 `measure()` 类似，`ViewGroup#layout()` 不允许重写。这里会进一步调用 `View#layout()`。

```java
// View.java
public void layout(int l, int t, int r, int b) {
    // ...
    boolean changed = isLayoutModeOptical(mParent) ?
            setOpticalFrame(l, t, r, b) : setFrame(l, t, r, b);

    if (changed || (mPrivateFlags & PFLAG_LAYOUT_REQUIRED) == PFLAG_LAYOUT_REQUIRED) {
        onLayout(changed, l, t, r, b);
        // ...
    }
    // ...
}
```

`layout()` 方法会调用 `setFrame()` 方法，`setFrame()` 方法是真正执行布局任务的步骤，至于 `setOpticalFrame()` 方法，其中也是调用 `setFrame()` 方法，通过设置 View 的 `mLeft`、`mTop`、`mRight` 和 `mBottom` 四个参数来执行布局，对应描述了 View 相对其父 View 的位置。

在 `setFrame()` 方法中会判断 View 的位置是否发生了改变，以确定有没有必要对当前的视图进行重绘。

而对子 View 的局部是通过 `onLayout()` 方法实现的，由于非 ViewGroup 不含子 View，所以 View 类的 `onLayout()` 方法为空，正因为布局过程是父布局容器布局子 View 的过程，`onLayout()` 方法对叶子 View 没有意义，只有 ViewGroup 才有用。

```java
// ViewGroup.java
@Override
protected abstract void onLayout(boolean changed,
        int l, int t, int r, int b);
```

由于 `ViewGroup#onLayout()` 为抽象方法，因此所有 `ViewGroup` 子类（主要是各种布局）必须实现该方法，在这个方法里再按照各自的逻辑对子 View 布局。以 DecorView 为例，前面提到过它是继承自 FrameLayout，所以这里直接看 FrameLayout 的 `onLayout()` 方法。

```java
// FrameLayout.java
@Override
protected void onLayout(boolean changed, int left, int top, int right, int bottom) {
    layoutChildren(left, top, right, bottom, false /* no force left gravity */);
}

void layoutChildren(int left, int top, int right, int bottom, boolean forceLeftGravity) {
    final int count = getChildCount();
    // ...
    for (int i = 0; i < count; i++) {
        final View child = getChildAt(i);
        if (child.getVisibility() != GONE) {
            // ...
            final int width = child.getMeasuredWidth();
            final int height = child.getMeasuredHeight();
            // ...
            child.layout(childLeft, childTop, childLeft + width, childTop + height);
        }
    }
}
```

可以看到，这里面也是调用子 View 的 `layout()`。如果该子 View 仍然是父布局，会继续递归下去；如果是叶子 View，则会走到 View 的 `onLayout()` 空方法，该叶子 View 布局流程走完。

`width` 和 `height` 分别来源于测量阶段存储的测量值，如果这里通过其它渠道赋给 `width` 和 `height` 值，那么之前的测量就显得没有意义了。

在 `onLayout()` 过程结束后，我们就可以调用 `getWidth()` 方法和 `getHeight()` 方法来获取视图的宽高值。

`getWidth()` 方法和 `getMeasureWidth()` 方法的区别：`getMeasureWidth()` 方法在 `measure()` 阶段结束后就可以获取到值，而 `getWidth()` 方法要在 `layout()` 阶段结束后才能获取到。另外，`getMeasureWidth()` 方法中的值是通过 `setMeasuredDimension()` 方法来进行设置的，而 `getWidth()` 方法中的值则是通过视图右边的坐标减去左边的坐标计算出来的。

**在自定义 View 里面，如果在 `onLayout()` 方法中给子视图的 `layout()` 方法传入的四个参数是 `0, 0, childView.getMeasuredWidth(), childView.getMeasuredHeight()`，那么 `getWidth()` 方法和 `getMeasuredWidth()` 得到的值就是相同的；如果传入的四个参数是别的自定义的值，那么 `getWidth()` 方法和 `getMeasuredWidth()` 得到的值就不会再相同（这里不建议这么操作）**。

### `performDraw()`

在测量好相关数据，并确定好布局之后，最后要做的就是将 View 绘制到界面上。

```java
// ViewRootImpl.java

private void performDraw() {
    // ...
    try {
        draw(fullRedrawNeeded);
    } finally {
        // ...
    }
    // ...
}

private void draw(boolean fullRedrawNeeded) {
    // ...
    if (!dirty.isEmpty() || mIsAnimating || accessibilityFocusDirty) {
        if (mAttachInfo.mThreadedRenderer != null && mAttachInfo.mThreadedRenderer.isEnabled()) {
            // ...
        } else {
            // ...
            if (!drawSoftware(surface, mAttachInfo, xOffset, yOffset, scalingRequired, dirty)) {
                return;
            }
        }
    }
    // ...
}

private boolean drawSoftware(Surface surface, AttachInfo attachInfo, int xoff, int yoff,
        boolean scalingRequired, Rect dirty) {
    // ...
    // ...
    try {
        // ...
        try {
            // ...
            mView.draw(canvas);
            // ...
        } finally {
            // ...
        }
    } finally {
        // ...
    }
    // ...
}
```

从 `performDraw()` 开始，最终会调用到 `mView.draw()` 方法。这里的 `mView` 就是之前提到过的 `DecorView`。

```java
// DecorView.java
@Override
public void draw(Canvas canvas) {
    super.draw(canvas);

    if (mMenuBackground != null) {
        mMenuBackground.draw(canvas);
    }
}
```

`DecorView` 首先调用了父类的 `draw()` 方法，然后进行了菜单背景的绘制。这里我们主要继续关注 `draw()`。

```java
// View.java
@CallSuper
public void draw(Canvas canvas) {
    // ...
    /*
        * Draw traversal performs several drawing steps which must be executed
        * in the appropriate order:
        *
        *      1. Draw the background
        *      2. If necessary, save the canvas' layers to prepare for fading
        *      3. Draw view's content
        *      4. Draw children
        *      5. If necessary, draw the fading edges and restore layers
        *      6. Draw decorations (scrollbars for instance)
        */

    // Step 1, draw the background, if needed
    int saveCount;

    if (!dirtyOpaque) {
        drawBackground(canvas);
    }

    // skip step 2 & 5 if possible (common case)
    final int viewFlags = mViewFlags;
    boolean horizontalEdges = (viewFlags & FADING_EDGE_HORIZONTAL) != 0;
    boolean verticalEdges = (viewFlags & FADING_EDGE_VERTICAL) != 0;
    if (!verticalEdges && !horizontalEdges) {
        // Step 3, draw the content
        if (!dirtyOpaque) onDraw(canvas);

        // Step 4, draw the children
        dispatchDraw(canvas);

        drawAutofilledHighlight(canvas);

        // Overlay is part of the content and draws beneath Foreground
        if (mOverlay != null && !mOverlay.isEmpty()) {
            mOverlay.getOverlayView().dispatchDraw(canvas);
        }

        // Step 6, draw decorations (foreground, scrollbars)
        onDrawForeground(canvas);

        // Step 7, draw the default focus highlight
        drawDefaultFocusHighlight(canvas);

        if (debugDraw()) {
            debugDrawFocus(canvas);
        }

        // we're done...
        return;
    }
    // ...
}
```

绘制阶段的源代码注释相对清晰。这里总共有七个步骤：绘制背景、忽略跳过、**绘制内容**、**绘制子视图**、忽略跳过、绘制装饰（前景，滚动条）、绘制默认焦点高光。从注释中可以看到第 2 步和第 5 步通常是不执行的。

第三步绘制内容调用的 `onDraw()` 方法。

```java
// View.java
/**
 * Implement this to do your drawing.
 *
 * @param canvas the canvas on which the background will be drawn
 */
protected void onDraw(Canvas canvas) {
}
```

这是个空方法，具体绘制逻辑由各个 View 子类去实现。以 DecorView 为例，只有这个类实现了该方法，ViewGroup 和 FrameLayout 都没有实现。

```java
// DecorView.java
@Override
public void onDraw(Canvas c) {
    super.onDraw(c);

    // When we are resizing, we need the fallback background to cover the area where we have our
    // system bar background views as the navigation bar will be hidden during resizing.
    mBackgroundFallback.draw(isResizing() ? this : mContentRoot, mContentRoot, c,
            mWindow.mContentParent);
}
```

第四步绘制子视图，调用的 `dispatchDraw()` 方法。

```java
// View.java
/**
 * Called by draw to draw the child views. This may be overridden
 * by derived classes to gain control just before its children are drawn
 * (but after its own view has been drawn).
 * @param canvas the canvas on which to draw the view
 */
protected void dispatchDraw(Canvas canvas) {

}
```

## 参考资料

[Android View 的绘制流程分析及其源码调用追踪](https://juejin.cn/post/6844904086064611336)