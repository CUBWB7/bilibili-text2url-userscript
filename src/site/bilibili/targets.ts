import { findClosestAcrossShadow, getSearchRoots } from "../../core/dom/shadow-roots";
import { ALL_BILIBILI_TARGET_SELECTORS } from "./selectors";

function isElement(node: Node): node is HTMLElement {
  return node.nodeType === Node.ELEMENT_NODE;
}

export function isProcessableTarget(element: Element): boolean {
  return ALL_BILIBILI_TARGET_SELECTORS.some((selector) => element.matches(selector));
}

export function findProcessableTargets(root: ParentNode): HTMLElement[] {
  const targets = new Set<HTMLElement>();

  for (const searchRoot of getSearchRoots(root)) {
    if (searchRoot instanceof Element && isProcessableTarget(searchRoot)) {
      targets.add(searchRoot as HTMLElement);
    }

    for (const selector of ALL_BILIBILI_TARGET_SELECTORS) {
      searchRoot.querySelectorAll<HTMLElement>(selector).forEach((element) => {
        targets.add(element);
      });
    }
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
  const owningTarget = findClosestAcrossShadow(node, ALL_BILIBILI_TARGET_SELECTORS.join(", "));
  return owningTarget instanceof HTMLElement ? owningTarget : null;
}
