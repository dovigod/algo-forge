import {
  createContext,
  PropsWithChildren,
  useLayoutEffect,
  useState,
  useRef,
} from 'react';

interface CanvasContext {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
}
const CanvasContext_ = createContext<CanvasContext | null>(null);

export function CanvasProvider({ children }: PropsWithChildren) {
  const [context, setContext] = useState<CanvasContext | null>(null);
  const ref = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    if (ref.current) {
      setContext({
        canvas: ref.current,
        ctx: ref.current.getContext('2d')!,
      });
    }
  }, [ref]);

  return context ? (
    <CanvasContext_.Provider value={context}>
      <canvas id="stage" ref={ref}></canvas>
      {children}
    </CanvasContext_.Provider>
  ) : null;
}
