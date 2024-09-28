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
  draw: () => void
}

export type Animatable = ((context: CanvasRenderingContext2D, utils: Metadata & ImperativHandlers, params: unknown) => unknown)
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
