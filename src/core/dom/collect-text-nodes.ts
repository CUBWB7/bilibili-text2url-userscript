import { isInsideGeneratedLink } from "./processed-markers";

const BLOCKED_SELECTOR =
  "a, button, input, textarea, script, style, code, pre, [contenteditable=''], [contenteditable='true']";

function getDocument(root: ParentNode): Document {
  return root instanceof Document ? root : root.ownerDocument ?? document;
}

export function collectTextNodes(root: ParentNode): Text[] {
  const doc = getDocument(root);
  const nodeFilter = doc.defaultView?.NodeFilter ?? NodeFilter;

  const walker = doc.createTreeWalker(root, nodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const text = node.textContent?.trim() ?? "";
      const parent = node.parentElement;

      if (!text || !parent) {
        return nodeFilter.FILTER_REJECT;
      }

      if (parent.closest(BLOCKED_SELECTOR)) {
        return nodeFilter.FILTER_REJECT;
      }

      if (isInsideGeneratedLink(node)) {
        return nodeFilter.FILTER_REJECT;
      }

      return nodeFilter.FILTER_ACCEPT;
    }
  });

  const nodes: Text[] = [];
  let current = walker.nextNode();

  while (current) {
    nodes.push(current as Text);
    current = walker.nextNode();
  }

  return nodes;
}
