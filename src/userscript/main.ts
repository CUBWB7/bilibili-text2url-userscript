import { collectTextNodes } from "../core/dom/collect-text-nodes";
import { linkifyTextNode } from "../core/dom/linkify-text-node";
import { startObserver } from "../core/watch/start-observer";
import { isSupportedBilibiliPage } from "../site/bilibili/page-type";
import { findOwningTarget, findProcessableTargets, findTargetsWithin } from "../site/bilibili/targets";
import {
  GENERATED_LINK_CLASS,
  GENERATED_LINK_STYLE,
  GENERATED_LINK_STYLE_ID
} from "../styles/generated-link";

export interface BootstrapResult {
  started: boolean;
  processedRoots: number;
  observer: MutationObserver | null;
}

export interface BootstrapOptions {
  locationLike?: Pick<Location, "hostname" | "pathname">;
}

function injectGeneratedLinkStyles(doc: Document): void {
  if (doc.getElementById(GENERATED_LINK_STYLE_ID)) {
    return;
  }

  const style = doc.createElement("style");
  style.id = GENERATED_LINK_STYLE_ID;
  style.textContent = GENERATED_LINK_STYLE;
  doc.head.append(style);
}

function processTarget(target: HTMLElement): number {
  let changedCount = 0;

  for (const node of collectTextNodes(target)) {
    if (linkifyTextNode(node)) {
      changedCount += 1;
    }
  }

  return changedCount;
}

function processNode(node: Node): number {
  const targets = new Set<HTMLElement>();
  const owningTarget = findOwningTarget(node);

  if (owningTarget) {
    targets.add(owningTarget);
  }

  for (const target of findTargetsWithin(node)) {
    targets.add(target);
  }

  return [...targets].reduce((count, target) => count + processTarget(target), 0);
}

export function bootstrap(doc: Document = document, options: BootstrapOptions = {}): BootstrapResult {
  const locationLike = options.locationLike ?? doc.location;

  if (!isSupportedBilibiliPage(locationLike)) {
    return { started: false, processedRoots: 0, observer: null };
  }

  injectGeneratedLinkStyles(doc);
  doc.documentElement.classList.add(`${GENERATED_LINK_CLASS}--ready`);

  let processedRoots = 0;

  for (const target of findProcessableTargets(doc)) {
    processedRoots += processTarget(target);
  }

  const observer = startObserver(doc, {
    processNode(node) {
      processNode(node);
    }
  });

  return { started: true, processedRoots, observer };
}
