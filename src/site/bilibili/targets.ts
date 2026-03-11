import { ALL_BILIBILI_TARGET_SELECTORS } from "./selectors";

function isElement(node: Node): node is HTMLElement {
  return node.nodeType === Node.ELEMENT_NODE;
}

export function isProcessableTarget(element: Element): boolean {
  return ALL_BILIBILI_TARGET_SELECTORS.some((selector) => element.matches(selector));
}

export function findProcessableTargets(root: ParentNode): HTMLElement[] {
  const targets = new Set<HTMLElement>();

  if (root instanceof Element && isProcessableTarget(root)) {
    targets.add(root as HTMLElement);
  }

  for (const selector of ALL_BILIBILI_TARGET_SELECTORS) {
    root.querySelectorAll<HTMLElement>(selector).forEach((element) => {
      targets.add(element);
    });
  }

  return [...targets];
}

export function findTargetsWithin(node: Node): HTMLElement[] {
  if (!isElement(node)) {
    return [];
  }

  return findProcessableTargets(node);
}

export function findOwningTarget(node: Node): HTMLElement | null {
  const element = isElement(node) ? node : node.parentElement;

  if (!element) {
    return null;
  }

  const owningTarget = element.closest(ALL_BILIBILI_TARGET_SELECTORS.join(", "));
  return owningTarget instanceof HTMLElement ? owningTarget : null;
}
