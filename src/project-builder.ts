import Project from "./project";
import Task from "./task";

// TODO: AOT mode
export default class ProjectBuilder {
    private projectId: string;
    private projectExpectedTime: number = 0; // 为子任务关键路径的 expectedTime 之和
    private currentAddTask?: Task;
    private taskMap: Map<String, Task> = new Map<String, Task>();
    private startTask?: Task;
    private endTask?: Task;

    constructor(projectId: string) {
        this.projectId = projectId;
    }

    public add(taskId: string, task: Task) {
        if (task instanceof Project) {
            throw new Error(`can not add project ${taskId} into current project ${this.projectId}`);
        }
        if (this.taskMap.has(taskId)) {
            throw new Error(`can not add task ${taskId} multiple times`);
        }
        this.taskMap.set(taskId, task);
        this.currentAddTask = task;
        return this;
    }

    public dependOn(taskId: string, task: Task) {
        if (!this.currentAddTask) {
            throw new Error(`invalid syntax. you should use "builder.add(taskAId, taskA).dependOn(taskBId, taskB)"`);
        }
        if (!this.taskMap.has(taskId)) {
            throw new Error(`must add task ${taskId} before dependOn it`);
        }
        this.currentAddTask.dependOn(task);
        return this;
    }

    public build() {
        if (this.isEmpty) {
            throw new Error(`project builder ${this.projectId} is empty`);
        }
        const { startTask, endTask, totalExpectedTime } = initTopology(this.taskMap, this.projectId);
        this.startTask = startTask;
        this.endTask = endTask;
        this.projectExpectedTime = totalExpectedTime;

        return new Project(this.projectId, this.projectExpectedTime, this.startTask, this.endTask);
    }

    public get isEmpty() {
        return this.taskMap.size <= 0;
    }
}

/**
 * 根据拓扑排序，找到 startTask, endTask, totalExpectedTime
 * 考虑到小程序JS环境的并发模型不是多线程模型，因此拓扑排序不必按关键路径法做计算，可以简化。
 * INFO: 目前微信小程序 Worker 的功能极其有限，暂不支持多线程。
 * 
 * startTask: 简单情况，有多个无依赖 startTask 时，选取 expectedTime 最大的
 * endTask: 从所有无被依赖的 task 构造的
 */
function initTopology(taskMap: Map<String, Task>, projectId: string) {
    const zeroDependencyTaskList: Array<Task> = [];
    const endTask = new Task(`project-${projectId}-endTask`, 1, () => { console.log('endTask'); });
    
    taskMap.forEach((task) => {
        if (!task.dependTaskList || task.dependTaskList.length <= 0) {
            zeroDependencyTaskList.push(task);
        }

        // endTask depend on every task in this project
        endTask.dependOn(task);
    });

    if (zeroDependencyTaskList.length <= 0) {
        throw new Error(`there isn't any zero dependency task in project ${projectId}`);
    }
    const startTask = zeroDependencyTaskList.sort((taskA, taskB) => {
        return -1 * (taskA.expectedTime - taskB.expectedTime); // expectedTime 最大的
    })[0];

    const totalExpectedTime = getExpectedTimeFromStart(endTask);

    return {
        startTask,
        endTask,
        totalExpectedTime,
    };
}

const expectedTimeFromStartMap = new Map<string, number>();
function getExpectedTimeFromStart(task: Task) {
    // TODO: 优化
    // TODO: DAG validate
    let expectedTimeFromStart: number;
    if (!task.dependTaskList || task.dependTaskList.length <= 0) {
        expectedTimeFromStart = task.expectedTime;
    } else {
        expectedTimeFromStart = task.dependTaskList.map(dependTask => {
            return task.expectedTime + getExpectedTimeFromStart(dependTask);
        }).reduce((maxExpectedTimeFromStart, currPathExpectedTimeFromStart) => {
            return Math.max(maxExpectedTimeFromStart, currPathExpectedTimeFromStart);
        }, 1);
    }

    expectedTimeFromStartMap.set(task.id, expectedTimeFromStart);
    return expectedTimeFromStart;
}
