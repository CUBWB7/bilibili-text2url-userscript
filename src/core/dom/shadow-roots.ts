function isElementNode(node: Node | ParentNode): node is Element {
  return (node as Node).nodeType === 1;
}

function collectDirectElements(root: ParentNode): Element[] {
  const elements: Element[] = [];

  if (isElementNode(root)) {
    elements.push(root as Element);
  }

  if ("querySelectorAll" in root) {
    root.querySelectorAll("*").forEach((element) => {
      elements.push(element);
    });
  }

  return elements;
}

export function getSearchRoots(root: ParentNode): ParentNode[] {
  const roots: ParentNode[] = [root];

  for (const element of collectDirectElements(root)) {
    if (element.shadowRoot) {
      roots.push(...getSearchRoots(element.shadowRoot));
    }
  }

  return roots;
}

export function findClosestAcrossShadow(node: Node, selector: string): Element | null {
  let current: Node | null = isElementNode(node) ? node : node.parentNode;

  while (current) {
    if (isElementNode(current) && current.matches(selector)) {
      return current as Element;
    }

    if (current.parentNode) {
      current = current.parentNode;
      continue;
    }

    const root = current.getRootNode();
    current = root instanceof ShadowRoot ? root.host : null;
  }

  return null;
}
