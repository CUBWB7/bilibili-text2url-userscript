import { GENERATED_LINK_ATTR } from "../../styles/generated-link";

export const PROCESSED_ROOT_ATTR = "data-bili-text2url-root";

export function isInsideGeneratedLink(node: Node): boolean {
  const element = node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement;
  return element?.closest(`[${GENERATED_LINK_ATTR}="true"]`) !== null;
}

export function isInsideExistingAnchor(node: Node): boolean {
  const element = node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement;
  return element?.closest("a") !== null;
}

export function markRootProcessed(element: Element): void {
  element.setAttribute(PROCESSED_ROOT_ATTR, "true");
}

export function wasRootProcessed(element: Element): boolean {
  return element.getAttribute(PROCESSED_ROOT_ATTR) === "true";
}
