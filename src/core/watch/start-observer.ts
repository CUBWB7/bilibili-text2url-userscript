import { createMutationBatcher } from "./mutation-batcher";

export interface StartObserverOptions {
  delayMs?: number;
  processNode: (node: Node) => void;
}

export function startObserver(doc: Document, options: StartObserverOptions): MutationObserver | null {
  if (!doc.body || !doc.defaultView?.MutationObserver) {
    return null;
  }

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
      for (const node of record.addedNodes) {
        batcher.enqueue(node);
      }
    }
  });

  observer.observe(doc.body, {
    childList: true,
    subtree: true
  });

  return observer;
}
