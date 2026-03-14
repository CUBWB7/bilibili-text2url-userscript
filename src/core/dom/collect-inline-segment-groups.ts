import { isInsideGeneratedLink } from "./processed-markers";
import { getSearchRoots } from "./shadow-roots";

const BLOCKED_SELECTOR =
  "a, button, input, textarea, script, style, code, pre, [contenteditable=''], [contenteditable='true']";

const BLOCK_BOUNDARY_TAGS = new Set([
  "ADDRESS",
  "ARTICLE",
  "ASIDE",
  "BLOCKQUOTE",
  "BR",
  "DD",
  "DIV",
  "DL",
  "DT",
  "FIELDSET",
  "FIGCAPTION",
  "FIGURE",
  "FOOTER",
  "FORM",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "HEADER",
  "HR",
  "LI",
  "MAIN",
  "NAV",
  "OL",
  "P",
  "SECTION",
  "TABLE",
  "TBODY",
  "TD",
  "TFOOT",
  "TH",
  "THEAD",
  "TR",
  "UL"
]);

export interface InlineSegmentPiece {
  node: Text;
  start: number;
  end: number;
}

export interface InlineSegmentGroup {
  text: string;
  pieces: InlineSegmentPiece[];
  trailingOpaqueInlineBoundary: boolean;
}

interface GroupBuilder {
  text: string;
  pieces: InlineSegmentPiece[];
  trailingOpaqueInlineBoundary: boolean;
}

function createBuilder(): GroupBuilder {
  return {
    text: "",
    pieces: [],
    trailingOpaqueInlineBoundary: false
  };
}

function isElement(node: Node): node is HTMLElement {
  return node.nodeType === Node.ELEMENT_NODE;
}

function isBlockedElement(element: HTMLElement): boolean {
  if (isRecoverableSearchAnchor(element)) {
    return false;
  }

  return element.matches(BLOCKED_SELECTOR) || isInsideGeneratedLink(element);
}

function isBlockBoundary(element: HTMLElement): boolean {
  return BLOCK_BOUNDARY_TAGS.has(element.tagName);
}

function isRecoverableSearchAnchor(element: HTMLElement): boolean {
  return (
    element.tagName === "A" &&
    element.getAttribute("data-type") === "search" &&
    element.hasAttribute("data-keyword")
  );
}

function flushBuilder(groups: InlineSegmentGroup[], builder: GroupBuilder): void {
  if (!builder.text.trim()) {
    builder.text = "";
    builder.pieces = [];
    builder.trailingOpaqueInlineBoundary = false;
    return;
  }

  groups.push({
    text: builder.text,
    pieces: [...builder.pieces],
    trailingOpaqueInlineBoundary: builder.trailingOpaqueInlineBoundary
  });

  builder.text = "";
  builder.pieces = [];
  builder.trailingOpaqueInlineBoundary = false;
}

function appendText(builder: GroupBuilder, node: Text, text: string): void {
  if (!text.trim()) {
    return;
  }

  builder.pieces.push({
    node,
    start: builder.text.length,
    end: builder.text.length + text.length
  });
  builder.text += text;
  builder.trailingOpaqueInlineBoundary = false;
}

function markOpaqueInlineBoundary(builder: GroupBuilder): void {
  if (!builder.text) {
    return;
  }

  builder.trailingOpaqueInlineBoundary = true;
}

function traverseNode(node: Node, groups: InlineSegmentGroup[], builder: GroupBuilder): boolean {
  if (node.nodeType === Node.TEXT_NODE) {
    if (isInsideGeneratedLink(node)) {
      return false;
    }

    const text = node.textContent ?? "";

    if (!text.trim()) {
      return false;
    }

    if (node.parentElement?.closest("[aria-hidden='true']")) {
      return false;
    }

    appendText(builder, node as Text, text);
    return true;
  }

  if (!isElement(node)) {
    return false;
  }

  if (node.matches("[aria-hidden='true']")) {
    markOpaqueInlineBoundary(builder);
    return false;
  }

  if (isBlockedElement(node)) {
    flushBuilder(groups, builder);
    return false;
  }

  if (isBlockBoundary(node)) {
    flushBuilder(groups, builder);

    let hasText = false;
    for (const child of node.childNodes) {
      hasText = traverseNode(child, groups, builder) || hasText;
    }

    flushBuilder(groups, builder);
    return hasText;
  }

  let hasText = false;

  for (const child of node.childNodes) {
    hasText = traverseNode(child, groups, builder) || hasText;
  }

  if (!hasText) {
    markOpaqueInlineBoundary(builder);
  }

  return hasText;
}

function collectFromSingleRoot(root: ParentNode): InlineSegmentGroup[] {
  const groups: InlineSegmentGroup[] = [];
  const builder = createBuilder();

  for (const child of root.childNodes) {
    traverseNode(child, groups, builder);
  }

  flushBuilder(groups, builder);
  return groups;
}

export function collectInlineSegmentGroups(root: ParentNode): InlineSegmentGroup[] {
  const groups: InlineSegmentGroup[] = [];

  for (const searchRoot of getSearchRoots(root)) {
    groups.push(...collectFromSingleRoot(searchRoot));
  }

  return groups;
}
