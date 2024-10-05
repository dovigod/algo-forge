/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useEffect } from "react";
import { Animation } from "../lib/Animation";
import { AnimationController } from "../lib/AnimationController";
import { AnimatableUtils, BridgeMethodCollection } from "../types";

interface DrawCircleParam {
  radius: number;
  color: string;
  x: number;
  y: number;
}
interface DrawArraowParam {
  from: {
    x: number;
    y: number;
  };
  to: {
    x: number;
    y: number;
  };
  color: string;
}
interface DrawTextParam {
  x: number;
  y: number;
  val: number;
}

interface DrawTextParam {
  x: number;
  y: number;
  val: number;
}

export function Canvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<Animation<typeof simpleInorderTraverse> | null>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.width = document.body.offsetWidth;
      ref.current.height = document.body.offsetHeight;
      ref.current.style.width = document.body.offsetWidth + "px";
      ref.current.style.height = document.body.offsetHeight + "px";

      if (!animationRef.current) {
        animationRef.current = new Animation<typeof simpleInorderTraverse>(
          "Simple in-order traverse",
          simpleInorderTraverse
        );

        animationRef.current.connectDOM(ref.current);
        animationRef.current.createStep("initalizing").addPhase("color-white-bg");
        animationRef.current.createStep("Traverse").addPhase("startTraversing");

        animationRef.current.registerAnimatables({
          DrawCircle: DrawCircle,
          DrawArrow: DrawArrow,
          clearBg: clearBg,
          drawText: drawText,
        });
        const controller = new AnimationController("testAnimationController");
        controller.connect(animationRef.current);
        animationRef.current.hydrate();
        controller.play();
      }
    }
  }, [ref, animationRef]);
  return <canvas ref={ref}></canvas>;
}

function DrawCircle(
  ctx: CanvasRenderingContext2D,
  utils: AnimatableUtils,
  payload: DrawCircleParam
) {
  ctx.beginPath();
  ctx.fillStyle = payload.color;
  ctx.arc(payload.x, payload.y, payload.radius * utils.progress, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();
}
function DrawArrow(
  ctx: CanvasRenderingContext2D,
  utils: AnimatableUtils,
  payload: DrawArraowParam
) {
  const progress = utils.progress;
  ctx.closePath();
  ctx.beginPath();
  ctx.strokeStyle = payload.color;
  ctx.lineWidth = 1;
  ctx.moveTo(payload.from.x, payload.from.y);
  ctx.lineTo(
    payload.to.x * progress + (1 - progress) * payload.from.x,
    payload.to.y * progress + (1 - progress) * payload.from.y
  );
  ctx.stroke();
  ctx.closePath();
}
function clearBg(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, 2000, 2000);
  ctx.closePath();
}

function drawText(ctx: CanvasRenderingContext2D, utils: AnimatableUtils, payload: DrawTextParam) {
  ctx.closePath();
  ctx.beginPath();
  ctx.font = "32px serif";
  ctx.fillStyle = "orange";
  ctx.fillText(String(payload.val), payload.x, payload.y);
  ctx.fill();
  ctx.closePath();
}

const WIDTH = 240;

function simpleInorderTraverse(collections: BridgeMethodCollection) {
  const { phase } = collections;

  const tree = [1, 2, 3, 4, null, 5, 6, 7, 8];

  // 알고리즘 시행 중...

  // 알고리즘 시행 중 첫번째 페이즈에 캔버스에 배경색을 칠한다
  phase["color-white-bg"].add("clearBg");

  // 전형적인 inorder traverse
  function traverse(i: number, depth = 0, pos: any) {
    const node = tree[i];
    const x = pos.x;
    const y = pos.y;

    // 먼저 노드를 그린다 빨간색 원으로 , 만약 leaf면 검게 칠한다
    // 애니메이션 지속시간은 0.3초, linear하게
    phase["startTraversing"].add(
      "DrawCircle",
      {
        radius: 20,
        color: node ? "red" : "black",
        x,
        y,
      },
      {
        duration: 300,
        timingFunc: "linear",
      }
    );

    // 재귀를 이용한 트리 순회의 예외 케이스 (leaf node)
    if (!node) {
      return;
    }

    // 노드 (원)을 그렸으면, 노드 안에 노드의 값을 그리자
    phase["startTraversing"].add(
      "drawText",
      {
        val: node,
        x,
        y,
      },
      {
        duration: 100,
        timingFunc: "linear",
      }
    );

    // 노드와 연결된 자식 노드로 이어지는 선을 그리자 (inorder니까 왼쪽부터)
    phase["startTraversing"].add(
      "DrawArrow",
      {
        color: "blue",
        from: { ...pos },
        to: {
          x: x - WIDTH / (depth + 1),
          y: y + 60,
        },
      },
      {
        duration: 100,
        timingFunc: "linear",
      }
    );

    traverse(i * 2 + 1, depth + 1, {
      x: x - WIDTH / (depth + 1),
      y: y + 60,
    });

    // 오른쪽 노드로 이어지는 선을 그리자
    phase["startTraversing"].add(
      "DrawArrow",
      {
        color: "green",
        from: { x, y },
        to: {
          x: x + WIDTH / (depth + 1),
          y: y + 60,
        },
      },
      {
        duration: 100,
        timingFunc: "linear",
      }
    );

    traverse(i * 2 + 2, depth + 1, {
      x: x + WIDTH / (depth + 1),
      y: y + 60,
    });
  }
  traverse(0, 0, { x: 600, y: 100 });
}
