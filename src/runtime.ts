import Task from './task';
import { TaskState } from './task-state';

/**
 * execute and monitor task
 * TODO: multiple thread, in future...
 */
export default class Runtime {
    private reportFn: Function;
    // INFO: 考虑到小程序JS环境的并发模型不是多线程模型，因此任务队列可以简化，直接先进先出即可。
    private pendingQueue: Array<Task> = [];
    private executedTaskIdSet: Set<string> = new Set<string>();
    
    constructor(reportFn: Function) {
        this.reportFn = reportFn;
    }

    public launch(task: Task) {
        if (this.executedTaskIdSet.has(task.id)) {
            return;
        }
        this.pendingQueue.push(task);
        this.tryToExecuteTask();
    }


    private async tryToExecuteTask() {
        if (this.pendingQueue.length <= 0) {
            // all tasks have been executed.
            return;
        }
        const readyTaskIndex = this.pendingQueue.findIndex(task => !task.dependTaskList || task.dependTaskList.every(dependTask => dependTask.state === TaskState.FINISHED))
        if (readyTaskIndex < 0) {
            // there isn't any ready task
            return;
        }

        const task = this.pendingQueue.splice(readyTaskIndex, 1)[0];
        const startTime = Date.now();
        await task.execute(); // TODO: task execute result pipeline
        const endTime = Date.now();

        task.appendTaskList.forEach(appendTask => {
            this.launch(appendTask);
        });

        this.tryToExecuteTask();

        this.reportFn.call(null, task.id, startTime, endTime);
    }
}
