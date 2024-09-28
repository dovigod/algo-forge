/* eslint-disable @typescript-eslint/no-explicit-any */
import { EventEmitter } from 'eventemitter3'

type StepBridgeMethod = Pick<Step, 'onEndStep' | 'onStartStep'>;
type PhaseBridgeMethod = Pick<Phase, 'add' | 'onEndFrame' | 'onStartFrame'>;

type BridgeMethodCollection = {
  step: Record<string, StepBridgeMethod>;
  phase: Record<string, PhaseBridgeMethod>;
}

type Metadata = Record<string, unknown>
type ImperativHandlers = Record<string, unknown>

type Task = {
  id: string;
  draw: () => void
}

type Animatable = ((context: CanvasRenderingContext2D, utils: Metadata & ImperativHandlers, params: unknown) => unknown)
enum AnimationState {
  PLAY = 'play',
  IDLE = 'idle',
  PAUSE = 'pause',
  FINISH = 'finish',
  FULFILLED = 'fulfilled'
}

interface HydrationRecipt {
  name: string;
  duration: number;

}

class Phase {
  id: string;
  name: string;
  frames: Task[];
  activeFrameIdx: number;
  requester: (animatableName: string, payload: unknown) => void;

  constructor(name: string, execRequester: (animatableName: string, payload: unknown) => void) {
    this.id = crypto.randomUUID();
    this.name = name;
    this.requester = execRequester;
    this.frames = [];
    this.activeFrameIdx = 0;
  }

  onStartFrame() { }
  onEndFrame() { }
  add(animatableName: string, payload: unknown) {
    const id = `${this.name}-${this.frames.length + 1}`;
    const requester = this.requester;

    const frame = {
      id,
      draw: () => requester(animatableName, payload)
    }
    this.frames.push(frame);
  }
  exec() {
    if (this.activeFrameIdx >= this.frames.length) {
      this.activeFrameIdx = 0;
      return null;
    }

    const frame = this.frames[this.activeFrameIdx]
    this.activeFrameIdx++;

    return frame
  }
}

class Step {
  id!: string;
  name!: string;
  phases: Phase[];
  activePhaseIdx: number;
  activePhase: Phase | null;
  state: number;
  requester: (animatableName: string, payload: unknown) => void;

  constructor(name: string, execRequester: (animatableName: string, payload: unknown) => void) {
    this.id = crypto.randomUUID();
    this.name = name;
    this.state = 0
    this.phases = [];
    this.activePhaseIdx = -1;
    this.activePhase = null;
    this.requester = execRequester;
  }
  addPhase(name: string) {
    const phase = new Phase(name, this.requester);
    this.phases.push(phase);
    return this;
  }

  proceeed() {
    if (this.activePhaseIdx >= this.phases.length) {
      this.activePhaseIdx = 0;
      return null;
    }

    const phases = this.phases[this.activePhaseIdx]
    this.activePhaseIdx++;
    return phases
  }

  next() {
    this.activePhaseIdx++;
    this.activePhase = this.phases[this.activePhaseIdx];
  }
  onStartStep() {
    this.activePhaseIdx = 0;
    this.state = 1;
    this.activePhase = this.phases[this.activePhaseIdx];
  }
  onEndStep() {
    this.activePhaseIdx = 0;
    this.state = -1;
    this.activePhase = this.phases[this.activePhaseIdx];
  }
}


abstract class IAnimationController {
  public abstract play: () => void
}

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
    this.snapshots = new WeakMap()
    this.activeStepIdx = 0;
    this.eventEmitter = new EventEmitter()
    this.engine = new AnimationEngine();
    this.runnerId = null;
    this.stepsCollection = {};
    this.timer = 0;
    this.current = null;

    this.addDefaultListeners();
  }

  connectDOM(canvas: HTMLCanvasElement) {
    this.domCanvas = canvas;
  }
  registerAnimatables(animatables: Record<string, Animatable>) {
    this.animatables = animatables;
  }
  createStep(name: string) {
    const step = new Step(name, this.executeAnimatable.bind(this));
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
      this.dispatchState(AnimationState.PLAY)
    }

    const current = this.current;

    if (!current) {
      // to next step;
      const step = this.steps[this.activeStepIdx];
      const phase = step.phases[step.activePhaseIdx];

      this.timer = Date.now()
    } else {
      current.draw();
    }




    requestAnimationFrame(this.animate);
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
  private dispatchState(state: AnimationState) {
    this.state = state;
  }
  private addDefaultListeners() {
    this.eventEmitter.addListener('play', () => {
      this.dispatchState(AnimationState.PLAY)
    })
    this.eventEmitter.addListener('pause', () => {
      this.dispatchState(AnimationState.PAUSE)
    })
  }
}




const TestFunctionFrameCollection = {
  step: {
    step1: new Step('step1'),
  },
  phase: {
    frame1: new Phase('p1'),
    frame2: new Phase('p2'),
  }
} as BridgeMethodCollection

function SmithWatermanAlgo(collections: BridgeMethodCollection) {

  const { step, phase } = collections;

  step['step1'].onEndStep('partials', [1, 2, 3])

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



function drawCircle(ctx, utils, param) {

  utils.time
}

function createFrame() {
  return {
    id: 
  }
}