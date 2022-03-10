

# 功能

调度微信小程序启动任务。对比接入启动框架前后，开发者能做到：

* 清晰的任务依赖关系：使用强语义的方式 taskB.dependOn(taskA)，描述依赖关系。代码更可维护。
* 任务间数据衔接：下游任务函数参数获取依赖任务结果，代码风格顺畅。TODO
* 任务的度量：开始/结束时间，任务成功率。
* 清晰的任务优化方向：根据度量信息，发现启动关键路径。针对耗时过长、成功率低的任务展开优化。
* 面向微信小程序：除了JS运行环境以外，开发者可以把微信小程序生命周期函数参与到任务调度中。

# 原始社会

```js
function mySecondTask() {
    const firstTaskResult = await firstTask(); // 可能有缓存

    console.log(firstTaskResult);
    // Do something with firstTaskResult...
}
```

# 现代社会

```js
const myFirstTask = new Task({
    run() {
        // first task works...
    }
});
const mySecondTask = new Task({
    run(firstTaskResult) {
        // second task works...
    }
});
const taskManager = new Manager();
taskManager.add(myFirstTask);
taskManager.add(mySecondTask).dependOn(myFirstTask);
taskManager.start();
```

# 任务的类型

* I/O： 网络请求，存储等
* 复杂计算任务：加解密等
* 其他短耗时但依赖关系复杂的任务
