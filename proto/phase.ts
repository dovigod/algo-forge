import { Task } from "./types";

export class Phase {
  id: string;
  name: string;
  frames: Task[];
  activeFrameIdx: number;
  requester: (animatableName: string, payload: unknown) => void;
  next: Phase | null;

  constructor(name: string, execRequester: (animatableName: string, payload: unknown) => void) {
    this.id = crypto.randomUUID();
    this.name = name;
    this.requester = execRequester;
    this.frames = [];
    this.activeFrameIdx = 0;
    this.next = null;
  }

  add(animatableName: string, payload: unknown) {
    const id = `${this.name}-${this.frames.length + 1}`;
    const requester = this.requester;

    const frame = {
      id,
      draw: () => requester(animatableName, payload)
    }
    this.frames.push(frame);
  }
  link(phase: Phase) {
    this.next = phase;
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

  frame() {
    const totalFrame = this.frames.length;
    if (this.activeFrameIdx >= totalFrame) {
      return null;
    }
    const frame = this.frames[this.activeFrameIdx];
    this.activeFrameIdx++;

    return frame;
  }
}
