export function getContentSize(element: HTMLElement) {
  const boundingRect = element.getBoundingClientRect();
  const styles = window.getComputedStyle(element);
  return {
    width:
      boundingRect.width -
      parse(styles.marginLeft) -
      parse(styles.marginRight) -
      parse(styles.borderLeftWidth) -
      parse(styles.borderRightWidth) -
      parse(styles.paddingLeft) -
      parse(styles.paddingRight),
    height:
      boundingRect.height -
      parse(styles.marginTop) -
      parse(styles.marginBottom) -
      parse(styles.borderTopWidth) -
      parse(styles.borderBottomWidth) -
      parse(styles.paddingTop) -
      parse(styles.paddingBottom),
  };
}

function parse(value: string) {
  return Number.parseInt(value);
}
