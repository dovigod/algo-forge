import type { Phase } from './phase';
import type { Step } from './step';

export type StepBridgeMethod = Pick<Step, 'link'>;
export type PhaseBridgeMethod = Pick<Phase, 'add'>;

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

export type Animatable = ((context: CanvasRenderingContext2D, utils: AnimatableUtils, params: unknown) => unknown)
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
export interface Snapshot {
}

export interface AnimatableUtils {
  progress: number;
  snapshots: Record<string, Snapshot>
}

