import { AnimationState, MessageChannel } from ".";

export interface IAnimation {
  readonly id: string;
  readonly name: string;
  domCanvas: HTMLCanvasElement;
  messageChannel: MessageChannel;
  context: CanvasRenderingContext2D
  state: AnimationState
  start(): void;
  connectDOM(canvas: HTMLCanvasElement): void;
  createStep(name: string): void;
}
