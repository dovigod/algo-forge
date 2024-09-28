/**
 * An AnimationController gives functionalies to controll animation sequences
 * Basically, it is useful to provide control interface to user 
 */

import { Animation } from "./Animation";


export class AnimationController {

  // identifier, convention :: animation.id + -controller
  #id: string | null = null;
  #animation: Animation | null = null;

  constructor() {
    // open for one-many relation
  }

  connect(animation: Animation) {
    this.#id = `${animation.id}-controller`
    this.#animation = animation;
  }

  play() {

  }
  pause() {

  }
  reset() {

  }
  prev() {

  }
  next() {

  }
  seek() {

  }



}