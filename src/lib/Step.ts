import { Phase } from "./Phase";
export class Step {
  id!: string;
  name!: string;
  phases: Phase[];
  activePhaseIdx: number;
  state: number;
  requester: (animatableName: string, payload: unknown) => void;
  next: Step | null;

  constructor(name: string, execRequester: (animatableName: string, payload: unknown) => void) {
    this.id = crypto.randomUUID();
    this.name = name;
    this.state = 0
    this.phases = [];
    this.activePhaseIdx = -1;
    this.next = null;
    this.requester = execRequester;
  }
  addPhase(name: string) {
    const phase = new Phase(name, this.requester);
    this.phases.push(phase);
    return this;
  }


  nextPhase() {

    if (this.activePhaseIdx === -1) {
      this.activePhaseIdx = 0;
      return this.phases[this.activePhaseIdx];
    }
    return this.phases[++this.activePhaseIdx]
  }



}
