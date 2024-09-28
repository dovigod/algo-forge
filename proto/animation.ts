/* eslint-disable @typescript-eslint/no-explicit-any */
import { EventEmitter } from 'eventemitter3'
import { Phase } from './phase';
import { Step } from './step';
import { BridgeMethodCollection, IAnimationController, Task, AnimationState, HydrationRecipt, Animatable } from './types';


class AnimationController<AlgoFunction extends (param: BridgeMethodCollection) => unknown> implements IAnimationController {
  name: string;
  animation!: Animation<AlgoFunction>

  constructor(name: string) {
    this.name = name;
  }

  connect(animation: Animation<AlgoFunction>) {
    this.animation = animation
  }

  play() {
    this.animation.dispatchEvent('play')
  }
}

export abstract class IAnimationEngine {

}
export class AnimationEngine implements IAnimationEngine {

}
export class Animation<AlgoFunction extends ((param: BridgeMethodCollection) => unknown)> {
  private readonly engine: IAnimationEngine;
  private readonly algo: AlgoFunction; // algorithm functions with animatables binded
  readonly id: string;
  readonly name: string;
  readonly eventEmitter: EventEmitter // instance of EventEmitter3, this is useful for member instances to communicate with each other

  animatables!: Record<string, Animatable> // collections of animatable which current instance can invoke
  steps: Step[]; // steps to be handled in order
  stepsCollection: Record<string, Step>
  snapshots: WeakMap<Step, unknown> // p
  activeStepIdx: number;
  activePhaseIdx: number;
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
    this.snapshots = new Map()
    this.activeStepIdx = -1;
    this.activePhaseIdx = -1;
    this.eventEmitter = new EventEmitter()
    this.engine = new AnimationEngine();
    this.runnerId = null;
    this.stepsCollection = {};
    this.timer = 0;
    this.current = null;

    this.addControllerListeners();
  }

  connectDOM(canvas: HTMLCanvasElement) {
    this.domCanvas = canvas;
  }
  registerAnimatables(animatables: Record<string, Animatable>) {
    this.animatables = animatables;
  }
  createStep(name: string) {
    const totalStep = this.steps.length;
    const step = new Step(name, this.executeAnimatable.bind(this));

    if (totalStep > 0) {
      const curStep = this.steps[totalStep - 1];
      curStep.link(step);
    }
    this.stepsCollection[name] = step;
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
  animate() {
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

    const current = this.current;

    if (!current) {

      let currentStep = this.steps[this.activeStepIdx];

      if (!currentStep) {
        cancelAnimationFrame(this.runnerId!)
        return;
      }
      let currentPhase = currentStep.phase();

      if (!currentPhase) {
        currentStep = this.steps[++this.activeStepIdx];
      }

      currentPhase = currentStep.phase();


      const frame = currentPhase?.frame()






      this.timer = Date.now()
    } else {
      current.draw();
    }




    this.runnerId = requestAnimationFrame(this.animate);
  }
  dispatchEvent(event: string, payload?: unknown) {
    this.eventEmitter.emit(event, payload, this)
  }
  addListener(event: string, eventCb: (event: any[]) => void) {
    this.eventEmitter.addListener(event, eventCb, this)
  }

  private executeAnimatable(animatableName: keyof typeof this.animatables, payload: unknown) {
    const animatable = this.animatables[animatableName];
    const ctx = this.context;
    const utils = {
      delta: Date.now() - this.timer,
      snapshots: this.snapshots
    }

    animatable(ctx, utils, payload);
  }
  private stateTransition(state: AnimationState) {
    this.state = state;
  }
  private addControllerListeners() {
    this.eventEmitter.addListener('play', () => {
      this.stateTransition(AnimationState.PLAY)
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




const TestFunctionFrameCollection = {
  step: {
  },
  phase: {
  }
} as BridgeMethodCollection

function SmithWatermanAlgo(collections: BridgeMethodCollection) {

  const { step, phase } = collections;

  console.log(TestFunctionFrameCollection, collections)

  for (let i = 0; i < 10; i++) {
    console.log('running animation in phase ' + i)
  }
  return 3
}

const animation = new Animation<typeof SmithWatermanAlgo>('smith-waterman', SmithWatermanAlgo)

animation.createStep('initalizing')
  .addPhase('initializing-p1')
  .addPhase('initializing-p2')
  .addPhase('initializing-p3')
  .addPhase('initializing-p4')
animation.createStep('Fill Score Matrix')
  .addPhase('fillMatrix-p1')
  .addPhase('fillMatrix-p2')
  .addPhase('fillMatrix-p3')
  .addPhase('fillMatrix-p4')
animation.createStep('trace back')
  .addPhase('traceBack-p1')
  .addPhase('traceBack-p2')
  .addPhase('traceBack-p3');

const controller = new AnimationController('testAnimationController');

controller.connect(animation)

animation.hydrate();

animation.animate();


