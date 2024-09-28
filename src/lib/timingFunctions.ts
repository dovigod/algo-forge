
function easeInSine(x: number): number {
  return 1 - Math.cos((x * Math.PI) / 2);
}
function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}
function easeOutSine(x: number): number {
  return Math.sin((x * Math.PI) / 2);
}
function easeInCubic(x: number): number {
  return x * x * x;
}
function easeOutCubic(x: number): number {
  return 1 - Math.pow(1 - x, 3);
}
function linear(x: number): number {
  return x;
}


export const TimingFunction = {
  'ease-in-sine': easeInSine,
  'ease-in-out-cubic': easeInOutCubic,
  'ease-out-sine': easeOutSine,
  'ease-in-cubic': easeInCubic,
  'ease-out-cubic': easeOutCubic,
  'linear': linear
}