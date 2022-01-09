import { JSXElementConstructor, PropsWithChildren, useCallback, useEffect, useRef, useState } from 'react';
import { getContentSize } from '../lib/dom';
import { defaultHeight, defaultWidth, Point, SizeProps } from '../models/common';

type NoSizeProps<T> = Omit<T, keyof SizeProps>;

export function withGrowingSize<P extends PropsWithChildren<SizeProps>>(
  Component: JSXElementConstructor<PropsWithChildren<P>>
) {
  return function (props: NoSizeProps<P>) {
    const ref = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState<Point>({ x: defaultWidth, y: defaultHeight });

    const resizeCallback = useCallback(() => {
      if (!ref.current || !ref.current.parentElement) {
        return;
      }
      const { width, height } = getContentSize(ref.current.parentElement);
      setSize({
        x: width,
        y: height,
      });
    }, []);
    useEffect(() => {
      window.addEventListener('resize', resizeCallback);
      return () => window.removeEventListener('resize', resizeCallback);
    }, [resizeCallback]);
    useEffect(resizeCallback, [resizeCallback]);
    return (
      <div ref={ref} style={{ width: size.x, height: size.y, minWidth: size.x, maxHeight: size.y }}>
        <Component {...(props as any)} width={size.x} height={size.y} />
      </div>
    );
  };
}
