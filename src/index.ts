import Project from "./project";
import Runtime from './runtime';
import { TaskState } from "./task-state";

export interface PolarisMpLauncherOptions {
    reportFn: Function;
}

export default class PolarisMpLauncher {
    private runtime: Runtime;

    constructor({ reportFn }: PolarisMpLauncherOptions) {
        this.runtime = new Runtime(reportFn);
    }

    public start(project: Project) {
        if (project.state !== TaskState.IDLE) {
            throw new Error(`can not run project ${project.id} again`);
        }
        this.runtime.launch(project.startTask);
    }
}
