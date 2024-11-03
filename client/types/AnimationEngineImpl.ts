/* eslint-disable @typescript-eslint/no-explicit-any */
import { Task, MessageChannel } from '.';

export interface IAnimationEngine {
  readonly id: string;
  domCanvas: HTMLCanvasElement | undefined;
  current: Task | null;
  messageChannel: MessageChannel;

  request(func: string, ...args: any): any;
  connectDOM(dom: HTMLCanvasElement): void;
}
