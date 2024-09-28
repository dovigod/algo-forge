import { Phase } from "./phase";
export class Step {
  id!: string;
  name!: string;
  phases: Phase[];
  activePhaseIdx: number;
  activePhase: Phase | null;
  state: number;
  requester: (animatableName: string, payload: unknown) => void;
  next: Step | null;

  constructor(name: string, execRequester: (animatableName: string, payload: unknown) => void) {
    this.id = crypto.randomUUID();
    this.name = name;
    this.state = 0
    this.phases = [];
    this.activePhaseIdx = -1;
    this.activePhase = null;
    this.next = null;
    this.requester = execRequester;
  }
  addPhase(name: string) {
    const phase = new Phase(name, this.requester);
    const totalPhase = this.phases.length;

    if (totalPhase > 0) {
      const curPhase = this.phases[totalPhase - 1];
      curPhase.link(phase);
    }

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
  link(step: Step) {
    this.next = step;
  }

  isDone() {
    return this.activePhaseIdx >= this.phases.length;
  }

  phase() {
    const totalPhase = this.phases.length;
    if (this.activePhaseIdx >= totalPhase) {
      return null;
    }
    const phase = this.phases[this.activePhaseIdx];
    this.activePhaseIdx++;

    return phase;

  }
}
