import { AnimatableConfig, AnimatableUtils, Task } from "../types";
import { Phase } from "./Phase";
export class Step {
  id!: string;
  name!: string;
  phases: Phase[];
  activePhaseIdx: number;
  state: number;
  requester: (animatableName: string, utils: AnimatableUtils, payload: unknown) => void;
  next: Step | null;
  onStart: Task | null;
  onEnd: Task | null;


  constructor(name: string, execRequester: (animatableName: string, utils: AnimatableUtils, payload: unknown) => void) {
    this.id = crypto.randomUUID();
    this.name = name;
    this.state = 0
    this.phases = [];
    this.activePhaseIdx = -1;
    this.next = null;
    this.requester = execRequester;
    this.onStart = null;
    this.onEnd = null;
  }

  addPhase(name: string) {
    const phase = new Phase(name, this.requester);
    this.phases.push(phase);
    return this;
  }


  nextPhase() {

    if (this.activePhaseIdx === -1) {
      this.activePhaseIdx = 0;
      return this.phases[this.activePhaseIdx];
    }
    return this.phases[++this.activePhaseIdx]
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
