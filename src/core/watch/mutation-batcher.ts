export interface MutationBatcherOptions {
  delayMs: number;
  processNodes: (nodes: Node[]) => void;
}

export interface MutationBatcher {
  enqueue(node: Node): void;
  flush(): void;
}

export function createMutationBatcher(options: MutationBatcherOptions): MutationBatcher {
  const queuedNodes = new Set<Node>();
  let timer: ReturnType<typeof setTimeout> | null = null;

  function flush() {
    if (queuedNodes.size === 0) {
      return;
    }

    const nodes = [...queuedNodes];
    queuedNodes.clear();
    timer = null;
    options.processNodes(nodes);
  }

  function enqueue(node: Node) {
    queuedNodes.add(node);

    if (timer !== null) {
      return;
    }

    timer = setTimeout(flush, options.delayMs);
  }

  return { enqueue, flush };
}
