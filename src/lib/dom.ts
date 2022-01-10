import { iterate } from 'iterare';
import { Nullable } from './types';

export interface Point {
  x: number;
  y: number;
}

export function getContentSize(element: HTMLElement, styleElements: Iterable<HTMLElement> = [element]): Point {
  const boundingRect = element.getBoundingClientRect();
  return iterate(styleElements).reduce(
    (p, e) => {
      const styles = window.getComputedStyle(e);
      p.x -=
        parse(styles.marginLeft) +
        parse(styles.marginRight) +
        parse(styles.borderLeftWidth) +
        parse(styles.borderRightWidth) +
        parse(styles.paddingLeft) +
        parse(styles.paddingRight);
      p.y -=
        parse(styles.marginTop) +
        parse(styles.marginBottom) +
        parse(styles.borderTopWidth) +
        parse(styles.borderBottomWidth) +
        parse(styles.paddingTop) +
        parse(styles.paddingBottom);
      return p;
    },
    { x: boundingRect.width, y: boundingRect.height }
  );
}

export class MacrotaskSingleton {
  private callback: Nullable<() => void> = null;
  private timeout: number = -1;

  setCallback(callback: () => void) {
    if (!this.callback) {
      this.timeout = setTimeout(() => {
        if (!this.callback) {
          return;
        }
        try {
          this.callback();
        } catch (error) {
          throw error;
        } finally {
          this.cancel();
        }
      });
    }
    this.callback = callback;
  }

  cancel() {
    this.callback = null;
    clearTimeout(this.timeout);
  }
}

function parse(value: string) {
  return Number.parseInt(value);
}
