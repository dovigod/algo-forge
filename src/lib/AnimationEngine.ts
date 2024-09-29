/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Snapshot, Task, MessageChannel, ProgressType } from "../types";
import { IAnimationEngine } from "../types/AnimationEngineImpl";
import { Step } from "./Step";

export class AnimationEngine implements IAnimationEngine {
  readonly id: string;
  domCanvas: HTMLCanvasElement | undefined;
  //@ts-ignore
  messageChannel: MessageChannel;

  private steps: Step[]; // steps to be handled in order
  private snapshots: Record<string, Record<string, Snapshot>> // p
  private activeStepIdx: number;
  current: Task | null;

  constructor(messageChannel: MessageChannel) {
    this.id = crypto.randomUUID();
    this.steps = [];
    this.snapshots = {}
    this.activeStepIdx = -1;
    this.current = null;
    this.messageChannel = messageChannel
  }


  connectDOM(canvas: HTMLCanvasElement) {
    this.domCanvas = canvas;
  }

  /**
   * `request` is an interface for any externals interact with `AnimationEngine`
   */
  request(func: string, ...args: any) {

    // @ts-ignore
    if (!this[func]) {
      throw new Error(`Method ${func} is not available in current engine`);
    }

    /**
     * 
     * guards or validation if needed
    */
    // @ts-ignore
    return this[func](...args)
  }


  private addStep(step: Step) {
    this.steps.push(step)
    return true;
  }


  /**
   * All settings(e.g, engine state transition, setups, engine global settings etc..) configuring before animation frame runs
   * 
   * This method MUST be execute ONLY ONCE before `getTask` method execution
   */
  private warmup() {

    console.log(this)
    // @TODO need to add guards so that it could be guaranteed it exec only once
    const step = this.nextStep();
    const phase = step.nextPhase();

    // take snapshot of inital canvas

    this.takeSnapshot('Init', 'snapshot');

    this.current = phase.nextTask();
  }

  // Returns Task which to compute at incoming period (incoming requestAnimationframe).
  private getTask() {
    const task = this.current;
    return task;
  }

  /**
   * Takes control of Step - Phase - Task hierarchy and set `current` to Task which to compute. `null` will be returned whenever entire animation process is done.
   * @returns - `Task` | `null` 
   */
  private update() {
    let step = this.steps[this.activeStepIdx];
    let phase = step.phases[step.activePhaseIdx];
    let task = phase.nextTask()
    const STEP_TRANSIION = 4;
    const PHASE_TRANSITION = 2;
    const TASK_TRANSITION = 1;
    const END_OF_ANIMATION = 8;
    let changes = 0;


    if (!task) {
      phase = step.nextPhase()
      changes |= PHASE_TRANSITION

      if (!phase) {
        step = this.nextStep();
        changes |= STEP_TRANSIION
        if (!step) {
          changes = END_OF_ANIMATION;
          this.current = null
          this.messageChannel.sendMessage('animation-end');
          return null;
        }
        phase = step.nextPhase();
      }

      task = phase.nextTask()
    }
    changes |= TASK_TRANSITION;


    /**
     * should be reverse-ordered to store snapshot properly
     */
    if (changes & STEP_TRANSIION) {
      this.onStepTransition()
      this.messageChannel.sendMessage('step-transition')

    }
    if (changes & PHASE_TRANSITION) {
      this.onPhaseTransition()
      this.messageChannel.sendMessage('phase-transition')
    }
    if (changes & TASK_TRANSITION) {
      this.onTaskTransition();
      this.messageChannel.sendMessage('task-transition')
    }
    this.current = task;

    return this.current;
  }

  private nextStep() {
    if (this.activeStepIdx === -1) {
      this.activeStepIdx = 0;
      return this.steps[this.activeStepIdx];
    }
    return this.steps[++this.activeStepIdx]
  }

  private onStepTransition() {
    const step = this.steps[this.activeStepIdx];
    this.takeSnapshot('Step', step.name);
  }
  private onPhaseTransition() {
    const step = this.steps[this.activeStepIdx];
    const phase = step.phases[step.activePhaseIdx]
    this.takeSnapshot('Phase', phase.name);
  }
  private onTaskTransition() {
    const id = this.current?.id // equals name of task
    this.takeSnapshot('Task', id!);
  }

  /**
   * Takes snapshot of current canvas image.
   * This is useful for senarios which needs to revert drawings back to specific period
   * You can take snapshot data by invoking `AnimationEngine.request('getSnapshot' , ...)`
   * 
   * 
   * @param progressType - Step , Phase , Task , 'special == Init'
   * @param name - name of Step | Phase | Task  
   * @returns 
   */
  private takeSnapshot(progressType: ProgressType, name: string) {

    if (!this.domCanvas) {
      return;
    }

    const data = this.domCanvas.toDataURL();

    if (!this.snapshots[progressType]) {
      this.snapshots[progressType] = {}
    }

    if (!this.snapshots[progressType][name]) {
      this.snapshots[progressType][name] = {
        type: progressType,
        period: `after-${name}`,
        data
      }
    }
  }


  /**
   * Get snapshot of specific period.
   * @param progressType 
   * @param name 
   * @returns 
   */
  private getSnapshot(progressType: ProgressType, name: string) {
    const snapshot = this.snapshots?.[progressType]?.[name]
    if (!snapshot) {
      return;
    }
    return snapshot
  }


  private bindAll(cb: (step: Step) => void) {
    for (const step of this.steps) {
      cb(step)
    }
  }
  private bind(stepName: string, cb: (step: Step) => void) {
    for (const step of this.steps) {
      if (step.name === stepName) {
        cb(step)
      }
    }
  }

  private getSnapshots() {
    return this.snapshots
  }
}
