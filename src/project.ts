import { EventEmitter } from 'eventemitter3';
import Task from './task';
import { TaskState } from './task-state';

/**
 * Project is a set of Tasks.
 * It has a single start Task and a single end Task.
 * It's built by ProjectBuilder.
 */
export default class Project extends EventEmitter {
    public id: string;
    public expectedTime: number;
    public startTask: Task;
    public endTask: Task;
    public state: TaskState = TaskState.IDLE;

    constructor(id: string, expectedTime: number, startTask: Task, endTask: Task) {
        super();

        this.id = id;
        this.expectedTime = expectedTime;
        this.startTask = startTask;
        this.endTask = endTask;

        this.startTask.on('running', () => {
            this.state = TaskState.RUNNING;
            this.emit('running');
        });
        this.endTask.on('finished', () => {
            this.state = TaskState.FINISHED;
            this.emit('finished');
        });
    }
}
