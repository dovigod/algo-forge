import { AnimatableUtils, AnimatableConfig, Task } from "../types";

export class Phase {
  id: string;
  name: string;
  tasks: Task[];
  activeTaskIdx: number;
  requester: (animatableName: string, utils: AnimatableUtils, payload: unknown) => void;
  onStart: Task | null;
  onEnd: Task | null;

  constructor(name: string, execRequester: (animatableName: string, utils: AnimatableUtils, payload: unknown) => void) {
    this.id = crypto.randomUUID();
    this.name = name;
    this.requester = execRequester;
    this.tasks = [];
    this.activeTaskIdx = -1;
    this.onStart = null;
    this.onEnd = null;
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
      draw: async (utils: AnimatableUtils) => requester(animatableName, utils, payload)
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

  before(animatableName: string, payload: unknown = {}, config: AnimatableConfig = {
    duration: 500,
    timingFunc: 'linear'
  }) {
    const id = `${this.name}-onStart`
    const requester = this.requester;

    const task = {
      id,
      config,
      draw: (utils: AnimatableUtils) => requester(animatableName, utils, payload)
    }
    this.onStart = task;
  }

  after(animatableName: string, payload: unknown = {}, config: AnimatableConfig = {
    duration: 500,
    timingFunc: 'linear'
  }) {
    const id = `${this.name}-onEnd`
    const requester = this.requester;

    const task = {
      id,
      config,
      draw: (utils: AnimatableUtils) => requester(animatableName, utils, payload)
    }
    this.onEnd = task;
  }

}
