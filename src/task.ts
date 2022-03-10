import EventEmitter from 'eventemitter3';

import { TaskState } from './task-state';

export default class Task extends EventEmitter {
    
    public id: string;
    public expectedTime: number;
    public state: TaskState = TaskState.IDLE;
    public run: Function;
    public dependTaskList: Array<Task> = []; // 邻接列表结构
    public appendTaskList: Array<Task> = []; // it's used by runtime

    constructor(id: string, expectedTime: number, run: Function = () => {
        console.warn('Task.run() should be overrided!'); // TODO: logger
    }) {
        super();
        if (expectedTime <= 0) {
            throw new Error(`can not set expectedTime to ${expectedTime}, task ${id}`);
        }
        this.id = id;
        this.expectedTime = expectedTime;
        this.run = run;
    }

    public dependOn(dependTask: Task) {
        if (dependTask === this) {
            throw new Error(`can not dependOn itself, task ${this.id}`);
        }
        this.dependTaskList.push(dependTask);
        dependTask.appendBy(this);
    }


    /////////////////
    // For Runtime //
    /////////////////

    public appendBy(appendTask: Task) {
        if (appendTask === this) {
            throw new Error(`can not appendBy itself, task ${this.id}`);
        }
        this.appendTaskList.push(appendTask);
    }

    public async execute() {
        if (this.state !== TaskState.IDLE) {
            throw new Error(`can not run task ${this.id} again`);
        }
        this.state = TaskState.RUNNING;
        this.emit('running');
        if (this.isAsyncTask) {
            await this.run();
        } else {
            this.run();
        }
        this.state = TaskState.FINISHED;
        this.emit('finished');
    }

    public get isAsyncTask() {
        return true; // FIXME: @shawche, return true by default
    }
}
