/* eslint-disable @typescript-eslint/no-explicit-any */
import { EventEmitter } from 'eventemitter3'
import { Step } from './Step';
import { BridgeMethodCollection, Task, AnimationState, HydrationRecipt, Animatable, AnimatableUtils, Snapshot } from '../types';
import { TimingFunction } from './timingFunctions';


export interface IAnimationEngine {
  readonly id: string;

}
export class AnimationEngine implements IAnimationEngine {
  readonly id: string;
  constructor() {
    this.id = crypto.randomUUID();

  }
}

export interface IAnimation {
  private readonly engine: IAnimationEngine;
  readonly id: string;
}
export class Animation<AlgoFunction extends ((param: BridgeMethodCollection) => unknown)> implements IAnimation {
  private readonly engine: IAnimationEngine;
  private readonly algo: AlgoFunction; // algorithm functions with animatables binded
  readonly id: string;
  readonly name: string;
  readonly eventEmitter: EventEmitter // instance of EventEmitter3, this is useful for member instances to communicate with each other

  animatables!: Record<string, Animatable> // collections of animatable which current instance can invoke
  steps: Step[]; // steps to be handled in order
  snapshots: Record<string, Snapshot> // p
  activeStepIdx: number;
  current: Task | null;
  domCanvas!: HTMLCanvasElement;
  context!: CanvasRenderingContext2D;
  state: AnimationState = AnimationState.IDLE;
  runnerId: number | null;
  timer: number;

  constructor(name: string, animatableAlgoFunction: AlgoFunction) {
    this.id = crypto.randomUUID();
    this.name = name;
    this.algo = animatableAlgoFunction;
    this.steps = [];
    this.snapshots = {};
    this.eventEmitter = new EventEmitter()
    this.engine = new AnimationEngine();
    this.runnerId = null;
    this.timer = 0;
    this.activeStepIdx = -1;
    this.current = null;

    this.addControllerListeners();
    this.addTransitionListeners();
  }

  connectDOM(canvas: HTMLCanvasElement) {
    this.domCanvas = canvas;
    this.context = this.domCanvas.getContext('2d')!;

    if (!this.context) {
      throw new Error('Canvas context not defined')
    }
  }
  registerAnimatables(animatables: Record<string, Animatable>) {
    this.animatables = animatables;
  }
  createStep(name: string) {
    const step = new Step(name, this.executeAnimatable.bind(this));
    this.steps.push(step);
    return step;
  }

  hydrate() {
    const bridges: BridgeMethodCollection = {
      step: {},
      phase: {}
    }


    const animatableAlgo = this.algo;

    // populate BridgeMethods for algo
    for (const step of this.steps) {
      const name = step.name;
      bridges.step[name] = step;

      for (const phase of step.phases) {
        const name = phase.name;
        bridges.phase[name] = phase;
      }
    }



    // dry-run + hydration as well
    const start = performance.now()
    animatableAlgo(bridges);
    const end = performance.now();

    const name = this.name;
    const duration = end - start;
    const reciept: HydrationRecipt = {
      name,
      duration
    }
    return reciept
  }
  private animate() {
    this.runnerId = requestAnimationFrame(this.animate.bind(this));
    const state = this.state;

    // animation is finished.
    if (state === AnimationState.FINISH || state === AnimationState.FULFILLED) {
      if (this.runnerId) {
        cancelAnimationFrame(this.runnerId);
      }
      return;
    }
    if (state === AnimationState.PAUSE) {
      if (this.runnerId) {
        cancelAnimationFrame(this.runnerId)
      }
      return;
    }
    if (state === AnimationState.IDLE) {
      this.stateTransition(AnimationState.PLAY)
    }

    const task = this.current;

    console.log('t ', task)
    // console.log(task)
    if (!task) {

      console.log('canccel')
      cancelAnimationFrame(this.runnerId);
      return;
    }

    const config = task.config;
    const delta = Date.now() - this.timer;
    const duration = config.duration || 500;

    const timingFunction = TimingFunction[config.timingFunc as keyof typeof TimingFunction] || TimingFunction['linear'];
    const progress = timingFunction(delta / duration)
    const snapshots = this.snapshots;



    const utils: AnimatableUtils = {
      progress,
      snapshots
    }

    task.draw(utils);
  }

  start() {
    const step = this.nextStep()
    const phase = step.nextPhase();
    this.current = phase.nextTask()
    this.timer = Date.now()
    console.log(phase, step)
    this.animate()
  }

  /**
   * Tasks control of Step - Phase - Task hierarchy and returns Task to compute. `null` will be returned whenever entire animation process is done.
   * @returns - `Task` | `null` 
   */
  private next() {
    let step = this.steps[this.activeStepIdx];
    let phase = step.phases[step.activePhaseIdx];
    let task = phase.nextTask()
    const STEP_TRANSIION = 4;
    const PHASE_TRANSITION = 2;
    const TASK_TRANSITION = 1;
    const END_OF_ANIMATION = 8;
    let changes = 0;


    if (!task) {
      phase = step.nextPhase()
      changes |= TASK_TRANSITION
      changes |= PHASE_TRANSITION;

      if (!phase) {
        step = this.nextStep();
        changes |= STEP_TRANSIION
        if (!step) {
          changes = END_OF_ANIMATION;
          this.current = null
          return null;
        }
        phase = step.nextPhase();
      }

      task = phase.nextTask()
    }

    if (changes & TASK_TRANSITION) {
      this.dispatchEvent('task-transition')
    }
    if (changes & PHASE_TRANSITION) {
      this.dispatchEvent('phase-transition')
    }
    if (changes & STEP_TRANSIION) {
      this.dispatchEvent('step-transition')
    }
    this.timer = Date.now();
    this.current = task;
  }

  private taskSnapshot(currentProgressType: string) {
  }
  private nextStep() {
    if (this.activeStepIdx === -1) {
      this.activeStepIdx = 0;
      return this.steps[this.activeStepIdx];
    }
    return this.steps[++this.activeStepIdx]
  }

  dispatchEvent(event: string, payload?: unknown) {
    this.eventEmitter.emit(event, payload, this)
  }
  addListener(event: string, eventCb: (event: any[]) => void) {
    this.eventEmitter.addListener(event, eventCb, this)
  }

  private executeAnimatable(animatableName: keyof typeof this.animatables, utils: AnimatableUtils, payload: unknown) {
    const animatable = this.animatables[animatableName];
    const ctx = this.context;
    const { progress } = utils;

    if (progress >= 1) {
      this.dispatchEvent('task-transition')
      return;
    }
    animatable(ctx, utils, payload);
  }
  private stateTransition(state: AnimationState) {
    this.state = state;
  }

  private addTransitionListeners() {
    this.eventEmitter.addListener('step-transition', () => {

    })
    this.eventEmitter.addListener('phase-transition', () => {

    })
    this.eventEmitter.addListener('task-transition', () => {
    })

    this.eventEmitter.addListener('proceed', () => {
      this.next();
    })
  }
  private addControllerListeners() {
    this.eventEmitter.addListener('play', () => {
      this.stateTransition(AnimationState.PLAY)
      this.start();
    })
    this.eventEmitter.addListener('pause', () => {
      this.stateTransition(AnimationState.PAUSE)
    })
    this.eventEmitter.addListener('forward', () => {
    })
    this.eventEmitter.addListener('backward', () => {
    })
    this.eventEmitter.addListener('seek-forward', () => {
    })
    this.eventEmitter.addListener('seek-backward', () => {
    })
  }
}

