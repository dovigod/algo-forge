import { useRef, useEffect } from "react";

export function Canvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const pRef = useRef<number>(0);

  useEffect(() => {
    if (ref.current) {
      if (pRef.current !== 1) {
        pRef.current = start(ref.current, ref.current.getContext("2d")!);
      }
    }
  }, [ref, pRef]);
  return <canvas ref={ref}></canvas>;
}

function start(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const fps = 60;
  const frame = 0;
  const DPR = window.devicePixelRatio;
  let frameId: number;

  const dimension = {
    width: canvas.width * DPR,
    height: canvas.height * DPR,
  };

  function init() {
    if (!frameId) {
      console.log("set");
      addListener();
      animate();
    }
  }

  function addListener() {
    window.addEventListener("resize", resize);
    resize();
  }

  function resize() {
    canvas.style.width = canvas.parentElement!.clientWidth + "px";
    canvas.style.height = canvas.parentElement!.clientHeight + "px";
    canvas.width = canvas.parentElement!.clientWidth * DPR;
    canvas.height = canvas.parentElement!.clientHeight * DPR;

    dimension.width = canvas.parentElement!.clientWidth;
    dimension.height = canvas.parentElement!.clientHeight;
    ctx.scale(DPR, DPR);

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    draw();
  }

  function draw() {
    ctx.fillStyle = "black";
    ctx.arc(getXByPercent(50), getYByPercent(50), 100, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
    ctx.imageSmoothingEnabled = true;
  }

  function getXByPercent(percent: number) {
    return dimension.width * (percent / 100);
  }
  function getYByPercent(percent: number) {
    return dimension.height * (percent / 100);
  }

  // steps

  const canvas2 = document.createElement("canvas");
  // canvas2.width = dimension.width;
  // canvas2.height = dimension.height;
  const ctx2 = canvas2.getContext("2d");

  function aFunc(context, r) {
    // context.clearRect(0, 0, dimension.width, dimension.height);
    // context.strokeStyle = "black";
    // context.lineTo(50 * r, 500 * r);
    // context.stroke();

    ctx.beginPath();
    ctx.strokeStyle = "black";
    context.translate(0.5, 0.5);
    ctx.moveTo(0, 0);
    ctx.lineTo(50 * r, 500 * r);
    ctx.stroke();

    ctx.drawImage(canvas2, 0, 0);
  }
  const frame1 = {
    id: "frame1",
    data: [3, 2, 1],
    progress: 0,
    duration: 3000,
    startedAt: null,
    state: "idle",
    isAnimatable: function () {
      return this.state !== "fulfilled";
    },
    animate: async function () {
      const duration = this.duration;

      const delta = Date.now() - this.startedAt;
      this.progress = easeInOutCubic(delta / duration);

      if (this.progress >= 1) {
        this.state = "finished";
      }

      aFunc(ctx2, this.progress);
      console.log("play");
    },
    onFrameStart: async function () {
      this.state = "play";

      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(200);
        }, 3000);
      });

      this.startedAt = Date.now();
      console.log("started transition");
    },
    onFrameEnd: async function () {
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(200);
        }, 3000);
      });
      this.state = "fulfilled";
      console.log("done");
    },
  };

  const steps = [frame1, frame1];

  let runner: any[] = [];
  const currentStep: any = null;
  const currentFrame: any = null;

  runner = steps.pop();

  async function animate() {
    console.dir(runner);
    console.log(frameId);
    if (!runner) {
      cancelAnimationFrame(frameId);
      return;
    } else {
      const isAnimatable = runner.isAnimatable();

      if (isAnimatable) {
        const state = runner.state;
        if (state === "idle") {
          await runner.onFrameStart();
        } else if (state === "finished") {
          await runner.onFrameEnd();
        } else {
          await runner.animate();
        }
      } else {
        transitRunner();
      }
    }

    frameId = requestAnimationFrame(animate);
  }

  function transitRunner() {
    if (steps.length === 0) {
      runner = null;
      // update animation states
    } else {
      runner = steps.pop();
    }
  }

  init();
  return 1;
}

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

// canvas layering
// frame to frame transition
// step to step transition

function drawCircle(ctx, r, x, y) {
  ctx.arc(x, y, r, MAth.PI, 0);
}

function algo(phases) {
  let sum = 0;

  const { phases1, phases2, phases3, phases4 } = frames;

  for (let j = 0; j < 10; j++) {
    phases1.addTask("drawCircle", [j]);
    for (let i = 0; i < 10; i++) {
      sum += i;
      phases2.addTask("pointCell", [j, i]);
    }
    Animation();
    for (let i = 0; i < 10; i++) {
      sum += i;
      Animation();
    }
    Animation();
  }

  console.log(sum);
}

// new An(algo, injectors);

// const injector = new Injector([f1, f2, f3, f4, f5, f6]);

const sampleSchema = {
  type: "Generator",
  runner: function* () {},
};

(injectorType) => IterableFunc, Func;

class AlgoBridge {
  algo: any;
  frameTasks: any;
  frameCollection: any;
  reciept: any;

  constructor(algo, frameTasks) {
    const collections = {};
    this.algo = algo;
    this.frameTasks = frameTasks;

    params.forEach((param) => {
      if (param.constructor.name === "Function") {
        Reflect.defineProperty(collections, param.name, { writable: true, value: param });

        collections[param.name] = param;
      } else if (param.constructor.name === "GeneratorFunction") {
        Reflect.defineProperty(collections, param.name, { writable: true, value: param });
        Reflect.defineProperty(collections[param.name], "start", {
          writable: true,
          value: () => {
            collections;
          },
        });
      }
    });
  }

  computeReciept() {
    const reciept = {};

    this.algo();
  }
}

const sampleAnimation = new Animation(algo);
sampleAnimation.registerTasks({});
sampleAnimation.createStep("step1").addFrame("frame1");
