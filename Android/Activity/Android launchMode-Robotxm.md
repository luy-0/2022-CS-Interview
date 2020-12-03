# Android `launchMode`

## Task

在 Android 的“最近任务”界面中，展示的并非是应用或者 Activity，而是 Task。“切换应用”实际上是切换 Task。

Task 的生命周期与其回退栈中的 Activity 相关联。当栈中所有的 Activity 被关闭之后，Task 的生命周期也就结束。此时在最近任务列表里虽然还能看见 Task，但它只是一个“残影”，切换回去等同于重新启动该应用。

## Activity 与 `launchMode`

一般情况下，在应用 A 中如果调起了应用 B 的 Activity，该 Activity 会被放进 A 的 Task 中，对 B 应用是不会造成影响的。例如：在文件管理器中打开 apk 文件进行安装。但是，我们可以配置 Activity 的 `launchMode` 属性来改变这些行为。

### `standard`

考虑如下场景：在短信 App 中点击一个电话号码，调起通讯录应用的添加联系人界面，此时添加联系人界面的逻辑与短信应用相关，因为它就是从短信应用中跳转的。此时按下返回键，会返回到短信而非通讯录，在最近任务中也看不见通讯录的 Task。而此时从主屏幕点击通讯录的图标，看到的是联系人列表，而非添加联系人界面。相反，切回短信之后，会看到添加联系人界面。

这就是默认的 `standard` 模式：在不同的 Task 中打开同一个 Activity，该 Activity 会被创建多个实例，分别放进每一个 Task 里。**此时的过渡动画是默认的 Activity 的入场动画。**

### `singleTask`：栈内复用

而当这个场景是从短信中点击邮箱地址，进入邮箱应用的编辑邮件界面时，用户一般会期望在最近任务中能看到邮件应用的 Task，并且从主屏幕点击邮件应用时能够继续编辑。

`singleTask` 模式的表现是：Activity 会被创建在属于自己的 Task (A) 中，放在栈顶。该 Task (A) 会被压在启动这个 Activity 的 Task (B) 之上。**此时的过渡动画是应用间切换的动画，以提示用户正在进行的操作是跨任务的。**而按下返回键之后，会回到这个 Task (A) 中的上一个 Activity，而不是直接返回之前启动这个 Activity 的应用的 Task (B)，除非 Task (A) 中没有 Activity。

从这个例子中也能看出，Task 之间也可以叠成栈。但是只适用于前台 Task。在进入后台（返回主屏幕或查看最近任务）时，叠在一起的前台 Task 会被拆分。**需要注意的是，在查看最近任务这种情况中，前台 Task 在最近任务列表显示出来的时候就已经进入后台，而非是在切换到其他应用之后。**继续用之前的例子说明，当用户从编辑邮件界面进入最近任务列表，再返回编辑邮件界面时，前台 Task 只剩下邮件 Task。连续按下返回键退出该 Task 中的所有应用之后，不会回到短信应用，而会返回主屏幕。

`singleTask` 的另一个行为是，如果启动该 Activity 时，系统发现回退栈中已经存在了该 Activity 的一个实例，会直接复用。**由于 Activity 没有被重建，所以也就不会调用 `onCreate()` 方法，而是调用 `onNewIntent()` 方法。在这个方法中我们可以通过读取 Intent 来刷新界面。另外，如果这个 Activity 的实例不处于栈顶，在它上面的 Activity 会被销毁。**

换句话说，`singleTask` 保证了只有一个 Task 中拥有该 Activity，以及这个 Task 中最多只有一个该 Activity。某种程度上说这个属性限制了 Activity 在全局只有一个实例。

#### `allowTaskReparenting`

默认情况下 Activity 只归属于一个 Task，这种归属关系不会改变。不过，将编辑邮件界面的 `allowTaskReparenting ` 设置为 `true`，从短信界面进入编辑邮件界面时，这个 Activity 会放进短信的 Task 中，但是如果切回主屏幕再重新进入邮件应用时，这个 Task 会被移动到邮件应用的 Task 中并置于回退栈顶。**此时的过渡动画是 Activity 的入场动画。从后台直接再切回时，不会被切断原有的回退路径。**

但是需要注意的是，由于 Android 的 Bug，在 Android 9 和 10 中无法正常使用该属性。

### `singleInstance`

这个模式和 `singleTask` 基本相同，但要求更为严格，它保证了 Task 中有且只有一个该 Activity。具体来说，在这种模式下，从短信进入邮件的编写邮件界面时，如果先前不存在包含该 Activity 的 Task，那么会创建一个新的 Task 和新的 Activity 实例；如果存在，则**直接复用该 Task**，调用 Activity 的 `onNewIntent()` 方法。这个 Task 也被压在短信 Task 之上，过渡动画是应用间切换的动画。按下返回键会直接返回短信应用。切到最近任务再切回，按下返回键则会返回主屏幕。

而如果用户在编写邮件界面启动了一个新的 Activity A，由于前面提到的限制，A 会被放进另一个 Task 中，而这个 Task 会被压在最上面。

`singleTask` 强调了唯一性，而 `singleInstance` 不仅强调唯一性，还强调了独占性。在按下返回键时，`singleTask` 会在自己的应用中回退，`singleInstance` 会返回之前的应用。从桌面点开 Activity 所在的应用时，`singleTask` 会看到这个 Activity 依然处于栈顶，而 `singleInstance` 会看到这个 Activity 消失了（前台和最近任务均不可见），但它并没有被销毁，如果再次被启动，它会返回到前台并再完成一次 `onNewIntent()`。可以说，在最近任务中看见的 Task 不一定还存活，看不见的 Task 也不一定就被销毁了。

#### `taskAffinity`

默认情况下，一个应用只能在最近任务中展示一个 Task。这个限制并非来自应用，而是 `taskAffinity`。每个 Activity 都有这么一个属性，默认值为 Activity 所在 `Application` 的值，而 `Application` 的默认 `taskAffinity` 则是应用的包名。除此以外，每个 Task 也有一个 `taskAffinity`，其值取自栈底 Activity 对应的值。因此，默认情况下，一个应用的所有 Task 的 `taskAffinity` 都是相同的，即应用包名。

在创建 Task 时，它的 `taskAffnity` 值与启动的 Activity 相同。后续入栈的 Activity 并不会影响到这个值。但是如果后续入栈的 Activity 是 `singleTask` 的，这个时候就会比对这个 Activity 和 Task 的 `taskAffinity` 值，若相同则继续入栈，若不同则会被放入与它拥有相同 `taskAffinity` 的 Task 中（没有则创建一个新的 Task）。

这个属性最常见的应用是各家的小程序实现中。

总结一下，最近任务中会显示出现所有的 `taskAffinity` 不同的 Task，对于多个相同 `taskAffinity` 的 Task，只会显示最新展示过的那个。这也就解释了上面 `singleInstance` 的 Activity 为什么会消失。

### `singleTop`：栈顶复用

行为类似于 `standard`，会将要启动的 Activity 在创建之后加入当前 Task 的栈顶。如果栈顶 Activity 恰好是要启动的，则直接复用，走 `onNewIntent()` 流程。

## 应用

在应用内部中跳转时，大多使用 `standard` 和 `singleTop`。`singleInstance` 大多用在可被外部应用调用的 Activity 中。

## 参考资料

https://www.bilibili.com/video/BV1CA41177Se