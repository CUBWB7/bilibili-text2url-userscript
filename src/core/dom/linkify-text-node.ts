import { findUrlCandidates } from "../url/find-url-candidates";
import { GENERATED_LINK_ATTR, GENERATED_LINK_CLASS } from "../../styles/generated-link";
import { isInsideExistingAnchor, isInsideGeneratedLink } from "./processed-markers";

export function linkifyTextNode(node: Text): boolean {
  if (!node.parentNode || isInsideExistingAnchor(node) || isInsideGeneratedLink(node)) {
    return false;
  }

  const text = node.textContent ?? "";
  const matches = findUrlCandidates(text);

  if (matches.length === 0) {
    return false;
  }

  const fragment = node.ownerDocument.createDocumentFragment();
  let cursor = 0;

  for (const match of matches) {
    if (match.start > cursor) {
      fragment.append(text.slice(cursor, match.start));
    }

    const anchor = node.ownerDocument.createElement("a");
    anchor.href = match.href;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.className = GENERATED_LINK_CLASS;
    anchor.setAttribute(GENERATED_LINK_ATTR, "true");
    anchor.textContent = match.displayText;
    fragment.append(anchor);

    cursor = match.end;
  }

  if (cursor < text.length) {
    fragment.append(text.slice(cursor));
  }

  node.parentNode.replaceChild(fragment, node);
  return true;
}
