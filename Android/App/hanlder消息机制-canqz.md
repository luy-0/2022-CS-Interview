# handler消息机制

首先，handler机制 的目的是 **解决Android中子线程不能处理UI问题** 

为了避免ANR，我们会通常把 **耗时操作放在子线程里面去执行**，因为Android中子线程不能更新UI，所以当子线程需要更新的UI的时候就需要借助到安卓的消息机制，也就是Handler机制了。



## 几个重要的类

想要了解handler机制，我们必须知道里面的几个重要的类：Message，MessageQueue，Handler，Looper

先上一张图：

![1606999111512](hanlder消息机制-canqz.assets\1606999111512.png)

### Message:  消息的载体

| 局部变量          | 作用                                                         |
| :---------------- | ------------------------------------------------------------ |
| int  what         | 类似于id，判断一个消息的标识符                               |
| int  arg1,arg2    | 存int型的数据                                                |
| Object object     | 存任意数据类型的数据                                         |
| long  when        | 存这个消息作用的时间（后面入消息队列的时候需要用到）         |
| Handler  target   | 存是哪一个handler发送的msg，最后looper取出可以知道是哪一个Handler去操作msg |
| Runnable callback | 这里是消息回调器，主要处理的是post方法发送的消息，post方法的runable接口被设置成这个接口 |
| Message next      | 这个主要是用来形成消息队列                                   |
| Message spool     | 消息池，缓存处理过的ms给，使用obtain（）方法可以复用消息     |

**局部方法**

1. Message  obtain() : 源码中，如果含有MessageQueue，spool总是指向MessageQueue(链表)的头结点，这里与Looper中的loop()方法：msg.recycle()对应（回收消息）

   ```java
   public static Message obtain() {
           synchronized (sPoolSync) {
               if (sPool != null) {
                   Message m = sPool;
                   sPool = m.next;
                   m.next = null;
                   m.flags = 0; // clear in-use flag
                   sPoolSize--;
                   return m;
               }
           }
           return new Message();
       }
   ```

   ![1607001537899](hanlder消息机制-canqz.assets\1607001537899.png)

### Handler:  发送消息，处理消息，移除消息

| 方法                                                         | 作用                                 |
| ------------------------------------------------------------ | ------------------------------------ |
| sendMessage(msg)                                             | 发送消息                             |
| sendMessageDelayed(msg, 0);                                  | 发送延迟消息                         |
| sendMessageAtTime(msg, SystemClock.uptimeMillis() + delayMillis); | 前两个都调用这个方法                 |
| handleMessage(msg)                                           | 这个主要是回调函数                   |
| dispatchMessage(msg)                                         | 消息事件分发函数                     |
| enqueueMessage(queue,  msg,uptimeMillis)                     | 消息入队操作，调用的是队列的入队操作 |

还有移除消息（调用队列的函数）

1. 源码分析：**enqueueMessage(@NonNull MessageQueue queue, @NonNull Message msg,        long uptimeMillis)** ：**这边直接设置了Message 的target**，然后调用了MessageQueue的消息入队的函数

```java
private boolean enqueueMessage(@NonNull MessageQueue queue, @NonNull Message msg,
            long uptimeMillis) {
        msg.target = this;
        msg.workSourceUid = ThreadLocalWorkSource.getUid();

        if (mAsynchronous) {
            msg.setAsynchronous(true);
        }
        return queue.enqueueMessage(msg, uptimeMillis);
    }
```

2. 源码分析：dispatchMessage(@NonNull Message msg) 先看消息自己能否处理，然后看handler的callback**接口**是否实现，最后看handleMessage()

```java
public void dispatchMessage(@NonNull Message msg) {
        if (msg.callback != null) {
            handleCallback(msg);
        } else {
            if (mCallback != null) {
                if (mCallback.handleMessage(msg)) {
                    return;
                }
            }
            handleMessage(msg);
        }
    }
```

### MessageQueue：消息队列（底层是链表）

1. 主要就一个函数：enqueueMessage()：部分源码

```java
boolean enqueueMessage(Message msg, long when) {
        synchronized (this) {
                msg.recycle(); 
            //这个for是利用msg的when来得到他应该插入到哪一个位置
                for (;;) {
                    prev = p;
                    p = p.next;
                    if (p == null || when < p.when) {
                        break;
                    }
                    if (needWake && p.isAsynchronous()) {
                        needWake = false;
                    }
                }
            //这边执行插入消息的操作
                msg.next = p; // invariant: p == prev.next
                prev.next = msg;
            }

            // We can assume mPtr != 0 because mQuitting is false.
            if (needWake) {
                nativeWake(mPtr);
            }
        }
        return true;
    }

```

2. next(): 这里面有for循环，如果没有消息，会一直阻塞在那里，另一个功能就是处理msg.when

   ```java
   Message next() {
           // Return here if the message loop has already quit and been disposed.
           // This can happen if the application tries to restart a looper after quit
           // which is not supported.
           final long ptr = mPtr;
           if (ptr == 0) {
               return null;
           }
   
           int pendingIdleHandlerCount = -1; // -1 only during first iteration
           int nextPollTimeoutMillis = 0;
           for (;;) {
               if (nextPollTimeoutMillis != 0) {
                   Binder.flushPendingCommands();
               }
   
               nativePollOnce(ptr, nextPollTimeoutMillis);
   
               synchronized (this) {
                   // Try to retrieve the next message.  Return if found.
                   final long now = SystemClock.uptimeMillis();
                   Message prevMsg = null;
                   Message msg = mMessages;
                   if (msg != null && msg.target == null) {
                       // Stalled by a barrier.  Find the next asynchronous message in the queue.
                       do {
                           prevMsg = msg;
                           msg = msg.next;
                       } while (msg != null && !msg.isAsynchronous());
                   }
                   if (msg != null) {
                       if (now < msg.when) {
                           // Next message is not ready.  Set a timeout to wake up when it is ready.
                           nextPollTimeoutMillis = (int) Math.min(msg.when - now, Integer.MAX_VALUE);
                       } else {
                           // Got a message.
                           mBlocked = false;
                           if (prevMsg != null) {
                               prevMsg.next = msg.next;
                           } else {
                               mMessages = msg.next;
                           }
                           msg.next = null;
                           if (DEBUG) Log.v(TAG, "Returning message: " + msg);
                           msg.markInUse();
                           return msg;
                       }
                   } else {
                       // No more messages.
                       nextPollTimeoutMillis = -1;
                   }
   
                   // Process the quit message now that all pending messages have been handled.
                   if (mQuitting) {
                       dispose();
                       return null;
                   }
   
                   // If first time idle, then get the number of idlers to run.
                   // Idle handles only run if the queue is empty or if the first message
                   // in the queue (possibly a barrier) is due to be handled in the future.
                   if (pendingIdleHandlerCount < 0
                           && (mMessages == null || now < mMessages.when)) {
                       pendingIdleHandlerCount = mIdleHandlers.size();
                   }
                   if (pendingIdleHandlerCount <= 0) {
                       // No idle handlers to run.  Loop and wait some more.
                       mBlocked = true;
                       continue;
                   }
   
                   if (mPendingIdleHandlers == null) {
                       mPendingIdleHandlers = new IdleHandler[Math.max(pendingIdleHandlerCount, 4)];
                   }
                   mPendingIdleHandlers = mIdleHandlers.toArray(mPendingIdleHandlers);
               }
   
               // Run the idle handlers.
               // We only ever reach this code block during the first iteration.
               for (int i = 0; i < pendingIdleHandlerCount; i++) {
                   final IdleHandler idler = mPendingIdleHandlers[i];
                   mPendingIdleHandlers[i] = null; // release the reference to the handler
   
                   boolean keep = false;
                   try {
                       keep = idler.queueIdle();
                   } catch (Throwable t) {
                       Log.wtf(TAG, "IdleHandler threw exception", t);
                   }
   
                   if (!keep) {
                       synchronized (this) {
                           mIdleHandlers.remove(idler);
                       }
                   }
               }
   
               // Reset the idle handler count to 0 so we do not run them again.
               pendingIdleHandlerCount = 0;
   
               // While calling an idle handler, a new message could have been delivered
               // so go back and look again for a pending message without waiting.
               nextPollTimeoutMillis = 0;
           }
       }
   ```

   

### Looper：取出消息

| 函数                                          | 作用                                          |
| --------------------------------------------- | --------------------------------------------- |
| public static void prepare()                  | 为这个线程准备一个Looper（存在ThreadLocal中） |
| public static void loop()                     | 用于循环取出消息                              |
| public void quit() ；public void quitSafely() | 退出Looper                                    |

1. 源码分析：public static void prepare()  **为当前线程（子线程） 创建1个循环器对象（Looper），同时也生成了1个消息队列对象**

   ```java
   /** 
     * 注：需在子线程中手动调用该方法
     */
       public static final void prepare() {
       
           if (sThreadLocal.get() != null) {
               throw new RuntimeException("Only one Looper may be created per thread");
           }
           // 1. 判断sThreadLocal是否为null，否则抛出异常
           //即 Looper.prepare()方法不能被调用两次 = 1个线程中只能对应1个Looper实例
           // 注：sThreadLocal = 1个ThreadLocal对象，用于存储线程的变量
   
           sThreadLocal.set(new Looper(true));
           // 2. 若为初次Looper.prepare()，则创建Looper对象 & 存放在ThreadLocal变量中
           // 注：Looper对象是存放在Thread线程里的
           // 源码分析Looper的构造方法->>分析a
       }
   
     /** 
       * 分析a：Looper的构造方法
       **/
   
           private Looper(boolean quitAllowed) {
   
               mQueue = new MessageQueue(quitAllowed);
               // 1. 创建1个消息队列对象（MessageQueue）
               // 即 当创建1个Looper实例时，会自动创建一个与之配对的消息队列对象（MessageQueue）
               mRun = true;
               mThread = Thread.currentThread();
           }
   /** 
     * Looper.prepareMainLooper()
     * 作用：为主线程（UI线程） 创建1个循环器对象（Looper），同时也生成了1个消息队列对象（MessageQueue）
     * 注：该方法在主线程（UI线程）创建时自动调用，即 主线程的Looper对象自动生成，不需手动生成
     */
       // 在Android应用进程启动时，会默认创建1个主线程（ActivityThread，也叫UI线程）
       // 创建时，会自动调用ActivityThread的1个静态的main（）方法 = 应用程序的入口
       // main（）内则会调用Looper.prepareMainLooper()为主线程生成1个Looper对象
   ```

## 关系图

![1607154507593](hanlder消息机制-canqz.assets\1607154507593.png)



1、Handler发送消息调用MessageQueue的enqueueMessage向插入一条信息到MessageQueue

2、Looper不断轮询调用MeaasgaQueue的next方法

3、如果发现message就调用handler的dispatchMessage，dispatchMessage被成功调用，接着调用三个处理消息的方法



## 面试题

待更新...





## 参考资料

[android的消息机制——Handler机制](https://www.jianshu.com/p/9e4d1fab0f36)

[Android异步消息处理机制完全解析，带你从源码的角度彻底理解](https://blog.csdn.net/guolin_blog/article/details/9991569)

《安卓开发艺术探索》书籍