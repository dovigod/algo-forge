import type { Animation } from './Animation'
import type { BridgeMethodCollection, IAnimationController } from '../types';

export class AnimationController<AlgoFunction extends (param: BridgeMethodCollection) => unknown> implements IAnimationController {
  name: string;
  animation!: Animation<AlgoFunction>

  constructor(name: string) {
    this.name = name;
  }

  connect(animation: Animation<AlgoFunction>) {
    this.animation = animation
  }

  play() {
    this.animation.dispatchEvent('play')
  }
}
