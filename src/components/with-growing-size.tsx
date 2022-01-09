import { JSXElementConstructor, PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getContentSize, MicrotaskSingleton, Point } from '../lib/dom';
import { defaultHeight, defaultWidth, SizeProps } from '../models/common';

type NoSizeProps<T> = Omit<T, keyof SizeProps>;

export function withGrowingSize<P extends PropsWithChildren<SizeProps>>(
  Component: JSXElementConstructor<PropsWithChildren<P>>
) {
  return function (props: NoSizeProps<P>) {
    const ref = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState<Point>({ x: defaultWidth, y: defaultHeight });

    const microtask = useMemo(() => new MicrotaskSingleton(), []);
    const resizeCallback = useCallback(() => {
      if (!ref.current || !ref.current.parentElement) {
        return;
      }
      const newSize = getContentSize(ref.current.parentElement, [ref.current]);
      console.log('size-wrap', newSize);
      setSize(newSize);
    }, []);
    const deferredResizeCallback = useCallback(
      () => microtask.setCallback(resizeCallback),
      [microtask, resizeCallback]
    );
    useEffect(() => {
      window.addEventListener('resize', deferredResizeCallback);
      return () => window.removeEventListener('resize', deferredResizeCallback);
    }, [microtask, deferredResizeCallback]);
    useEffect(deferredResizeCallback, [deferredResizeCallback]);
    return (
      <div ref={ref} style={{ width: size.x, height: size.y, minWidth: size.x, maxHeight: size.y }}>
        <Component {...(props as any)} width={size.x} height={size.y} />
      </div>
    );
  };
}
