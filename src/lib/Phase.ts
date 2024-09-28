import { AnimatableUtils, AnimatableConfig, Task } from "../types";

export class Phase {
  id: string;
  name: string;
  tasks: Task[];
  activeTaskIdx: number;
  requester: (animatableName: string, utils: AnimatableUtils, payload: unknown) => void;

  constructor(name: string, execRequester: (animatableName: string, payload: unknown) => void) {
    this.id = crypto.randomUUID();
    this.name = name;
    this.requester = execRequester;
    this.tasks = [];
    this.activeTaskIdx = -1;
  }

  add(animatableName: string, payload: unknown = {}, config: AnimatableConfig = {
    duration: 500,
    timingFunc: 'linear'
  }) {
    const id = `${this.name}-${this.tasks.length + 1}`;
    const requester = this.requester;

    // utils injected based on configs. utils will be populated during animate runtime
    const task = {
      id,
      config,
      draw: (utils: AnimatableUtils) => requester(animatableName, utils, payload)
    }
    this.tasks.push(task);
  }

  nextTask() {
    if (this.activeTaskIdx === -1) {
      this.activeTaskIdx = 0;
      return this.tasks[this.activeTaskIdx]
    }
    return this.tasks[++this.activeTaskIdx]
  }

}
