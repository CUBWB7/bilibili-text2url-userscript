import { createMutationBatcher } from "./mutation-batcher";
import { getSearchRoots } from "../dom/shadow-roots";

export interface StartObserverOptions {
  delayMs?: number;
  processNode: (node: Node) => void;
}

export function startObserver(doc: Document, options: StartObserverOptions): MutationObserver | null {
  if (!doc.body || !doc.defaultView?.MutationObserver) {
    return null;
  }

  const ElementCtor = doc.defaultView.Element;
  const ShadowRootCtor = doc.defaultView.ShadowRoot;

  const batcher = createMutationBatcher({
    delayMs: options.delayMs ?? 80,
    processNodes(nodes) {
      for (const node of nodes) {
        options.processNode(node);
      }
    }
  });

  const observer = new doc.defaultView.MutationObserver((records) => {
    for (const record of records) {
      if (record.target instanceof ElementCtor || record.target instanceof ShadowRootCtor) {
        observeNestedShadowRoots(record.target);
      }

      for (const node of record.addedNodes) {
        if (node instanceof ElementCtor) {
          observeNestedShadowRoots(node);
        }
        batcher.enqueue(node);
      }
    }
  });

  const observedRoots = new WeakSet<Node>();

  function observeRoot(root: Document | Element | ShadowRoot): void {
    if (observedRoots.has(root)) {
      return;
    }

    observer.observe(root, {
      childList: true,
      subtree: true
    });
    observedRoots.add(root);
  }

  function observeNestedShadowRoots(root: ParentNode): void {
    for (const searchRoot of getSearchRoots(root)) {
      if (searchRoot instanceof ShadowRootCtor) {
        observeRoot(searchRoot);
      }
    }
  }

  observeRoot(doc.body);
  observeNestedShadowRoots(doc.body);

  return observer;
}
