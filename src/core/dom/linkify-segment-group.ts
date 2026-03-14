import { findUrlCandidates } from "../url/find-url-candidates";
import { GENERATED_LINK_ATTR, GENERATED_LINK_CLASS } from "../../styles/generated-link";
import { InlineSegmentGroup, InlineSegmentPiece } from "./collect-inline-segment-groups";

interface ResolvedBoundary {
  node: Text;
  offset: number;
}

function resolveStart(pieces: InlineSegmentPiece[], offset: number): ResolvedBoundary | null {
  for (const piece of pieces) {
    if (offset >= piece.start && offset < piece.end) {
      return {
        node: piece.node,
        offset: offset - piece.start
      };
    }
  }

  return null;
}

function resolveEnd(pieces: InlineSegmentPiece[], offset: number): ResolvedBoundary | null {
  if (offset === 0) {
    const firstPiece = pieces[0];
    return firstPiece ? { node: firstPiece.node, offset: 0 } : null;
  }

  for (let index = 0; index < pieces.length; index += 1) {
    const piece = pieces[index];

    if (offset > piece.start && offset <= piece.end) {
      return {
        node: piece.node,
        offset: offset - piece.start
      };
    }

    if (offset === piece.start && index > 0) {
      const previousPiece = pieces[index - 1];
      return {
        node: previousPiece.node,
        offset: previousPiece.node.textContent?.length ?? 0
      };
    }
  }

  return null;
}

function createGeneratedAnchor(doc: Document, href: string, text: string): HTMLAnchorElement {
  const anchor = doc.createElement("a");
  anchor.href = href;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  anchor.className = GENERATED_LINK_CLASS;
  anchor.setAttribute(GENERATED_LINK_ATTR, "true");
  anchor.textContent = text;
  return anchor;
}

export function linkifySegmentGroup(group: InlineSegmentGroup): boolean {
  if (group.pieces.length === 0) {
    return false;
  }

  const match = findUrlCandidates(group.text).find((candidate) => /^https?:\/\//i.test(candidate.displayText));

  if (!match) {
    return false;
  }

  if (group.trailingOpaqueInlineBoundary && match.end === group.text.length) {
    return false;
  }

  const start = resolveStart(group.pieces, match.start);
  const end = resolveEnd(group.pieces, match.end);

  if (!start || !end) {
    return false;
  }

  const doc = start.node.ownerDocument;
  const range = doc.createRange();
  range.setStart(start.node, start.offset);
  range.setEnd(end.node, end.offset);

  range.deleteContents();
  range.insertNode(createGeneratedAnchor(doc, match.href, match.displayText));
  range.detach();

  return true;
}
