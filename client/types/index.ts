/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Phase } from '../lib/Phase';
import type { Step } from '../lib/Step';

export type StepBridgeMethod = Pick<Step, 'onStart' | 'onEnd'>;
export type PhaseBridgeMethod = Pick<Phase, 'add' | 'onStart' | 'onEnd'>;

export type BridgeMethodCollection = {
  step: Record<string, StepBridgeMethod>;
  phase: Record<string, PhaseBridgeMethod>;
}

export type Metadata = Record<string, unknown>
export type ImperativHandlers = Record<string, unknown>

export type Task = {
  id: string;
  config: AnimatableConfig;
  draw: (utils: AnimatableUtils) => void
}

export type Animatable = ((context: CanvasRenderingContext2D, utils: AnimatableUtils, params: any) => unknown)
export enum AnimationState {
  PLAY = 'play',
  IDLE = 'idle',
  PAUSE = 'pause',
  FINISH = 'finish',
  FULFILLED = 'fulfilled'
}

export interface HydrationRecipt {
  name: string;
  duration: number;

}

export abstract class IAnimationController {
  public abstract play: () => void
}


export type TimingFunction = 'ease-in' |
  'ease-in-out-cubic' |
  'ease-out' |
  'ease-out-sine' |
  'ease-in-cubic' |
  'ease-out-cubic' |
  'linear'

export interface AnimatableConfig {
  duration?: number;
  timingFunc?: TimingFunction
}
export type ProgressType = 'Step' | 'Phase' | 'Task' | 'Init'
export interface Snapshot {
  type: ProgressType,
  period: string,
  data: string
}

export interface AnimatableUtils {
  progress: number;
  restore: (progressType: ProgressType, name: string) => void
}

export interface MessageChannel {
  sendMessage: (msg: string, payload?: unknown) => void
}

export type Requestable = 'getTask' | 'warmup' | 'getTask' | 'update' | 'takeSnapshot' | 'getSnapshot' | 'bindAll' | 'bind' | 'getSnapshots'