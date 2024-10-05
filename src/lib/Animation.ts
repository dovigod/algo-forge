/* eslint-disable @typescript-eslint/no-explicit-any */
import { EventEmitter } from 'eventemitter3'
import { Step } from './Step';
import { BridgeMethodCollection, AnimationState, HydrationRecipt, Animatable, AnimatableUtils, ProgressType, MessageChannel } from '../types/index';
import { TimingFunction } from './timingFunctions';
import { IAnimationEngine } from '../types/AnimationEngineImpl';
import { AnimationEngine } from './AnimationEngine';
import { IAnimation } from '../types/AnimationImpl';




export class Animation<AlgoFunction extends ((param: BridgeMethodCollection) => unknown)> implements IAnimation {
  readonly engine: IAnimationEngine;
  private readonly algo: AlgoFunction; // algorithm functions with animatables binded
  readonly id: string;
  readonly name: string;
  readonly eventEmitter: EventEmitter // instance of EventEmitter3, this is useful for member instances to communicate with each other

  animatables!: Record<string, Animatable> // collections of animatable which current instance can invoke
  domCanvas!: HTMLCanvasElement;
  context!: CanvasRenderingContext2D;
  state: AnimationState = AnimationState.IDLE;
  timer: number;
  runnerId: number;
  messageChannel: MessageChannel

  constructor(name: string, animatableAlgoFunction: AlgoFunction) {
    this.id = crypto.randomUUID();
    this.name = name;
    this.algo = animatableAlgoFunction;
    this.eventEmitter = new EventEmitter()
    this.timer = -1;
    this.messageChannel = {
      sendMessage: this.dispatchEvent.bind(this)
    }
    this.engine = new AnimationEngine(this.messageChannel);
    this.runnerId = -1;

    this.addControllerListeners();
    this.addTransitionListeners();
  }

  connectDOM(canvas: HTMLCanvasElement) {
    this.domCanvas = canvas;
    this.context = this.domCanvas.getContext('2d')!;
    this.engine.connectDOM(this.domCanvas);
    if (!this.context) {
      throw new Error('Canvas context not defined')
    }
  }
  registerAnimatables(animatables: Record<string, Animatable>) {
    this.animatables = animatables;
  }
  createStep(name: string) {
    const step = new Step(name, this.executeAnimatable.bind(this));
    this.engine.request('addStep', step);
    return step;
  }

  hydrate() {
    const bridges: BridgeMethodCollection = {
      step: {},
      phase: {}
    }
    const animatableAlgo = this.algo;

    // populate BridgeMethods for algo
    this.engine.request('bindAll', (step: Step) => {
      const name = step.name;
      bridges.step[name] = step;

      for (const phase of step.phases) {
        const name = phase.name;
        bridges.phase[name] = phase;
      }
    })

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


  start() {
    this.engine.request('warmup')
    this.timer = Date.now()
    this.animate()
  }


  private async animate() {
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

    const task = this.engine.request('getTask');

    if (!task) {
      cancelAnimationFrame(this.runnerId);
      return;
    }

    const config = task.config;
    const delta = Date.now() - this.timer;
    const duration = config.duration || 500;

    const timingFunction = TimingFunction[config.timingFunc as keyof typeof TimingFunction] || TimingFunction['linear'];
    const progress = timingFunction(delta / duration);

    const utils: AnimatableUtils = {
      progress,
      restore: this.restore.bind(this)
    }
    await task.draw(utils);
  }

  private async restore(progressType: ProgressType, name: string) {

    /**
     * Do not add restore action to snapshot history.
     * 
     * snapshots should only contain sequentially processed animation tasks in order.
     */
    const snapshot = this.engine.request('getSnapshot', progressType, name);
    if (!snapshot) {
      return;
    }
    const image = document.createElement('img')
    image.src = snapshot.data

    return await new Promise((resolve, reject) => {
      if (!image) reject();

      // fallback, reject timeout within 500ms
      const timer = setTimeout(() => {
        reject()
      }, 500)

      image.onload = () => {
        this.context.drawImage(image, 0, 0, this.domCanvas.width, this.domCanvas.height);
        clearTimeout(timer);
        resolve(true)
      }

    })



  }

  dispatchEvent(event: string, payload?: unknown) {
    this.eventEmitter.emit(event, payload, this)
  }
  addListener(event: string, eventCb: (event: any[]) => void) {
    this.eventEmitter.addListener(event, eventCb, this)
  }

  private async executeAnimatable(animatableName: keyof typeof this.animatables, utils: AnimatableUtils, payload: unknown) {
    const animatable = this.animatables[animatableName];
    const ctx = this.context;
    const { progress } = utils;

    if (progress >= 1) {
      this.dispatchEvent('proceed')
      return;
    }
    await animatable(ctx, utils, payload);
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
    this.eventEmitter.addListener('animation-end', () => {
    })

    this.eventEmitter.addListener('proceed', () => {
      this.engine.request('update')
      this.timer = Date.now()
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
      if (this.state !== AnimationState.PAUSE) return;
    })
    this.eventEmitter.addListener('backward', () => {
      if (this.state !== AnimationState.PAUSE) return;
    })
    this.eventEmitter.addListener('seek-forward', () => {
      if (this.state !== AnimationState.PAUSE) return;
    })
    this.eventEmitter.addListener('seek-backward', () => {
      if (this.state !== AnimationState.PAUSE) return;
    })
  }
}

