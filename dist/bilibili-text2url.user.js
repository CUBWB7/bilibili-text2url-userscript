// ==UserScript==
// @name         Bilibili使用增强-文本网址转链接（Text to URL）
// @namespace    https://github.com/CUBWB7/bilibili-text2url-userscript
// @version      0.1.0
// @description  将 Bilibili 页面中的纯文本网址转换为可点击链接，支持简介、评论区和动态正文。
// @author       CUBWB7
// @license      MIT
// @homepageURL  https://github.com/CUBWB7/bilibili-text2url-userscript
// @supportURL   https://github.com/CUBWB7/bilibili-text2url-userscript/issues
// @match        https://www.bilibili.com/*
// @match        https://t.bilibili.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==
"use strict";
(() => {
  // src/styles/generated-link.ts
  var GENERATED_LINK_CLASS = "bili-text2url-link";
  var GENERATED_LINK_ATTR = "data-bili-text2url-generated";
  var GENERATED_LINK_STYLE_ID = "bili-text2url-style";
  var GENERATED_LINK_STYLE = `
.${GENERATED_LINK_CLASS}[${GENERATED_LINK_ATTR}="true"] {
  color: #1677ff;
  text-decoration: underline;
  text-underline-offset: 2px;
  word-break: break-all;
}
`;

  // src/core/dom/processed-markers.ts
  function isInsideGeneratedLink(node) {
    const element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
    return element?.closest(`[${GENERATED_LINK_ATTR}="true"]`) !== null;
  }
  function isInsideExistingAnchor(node) {
    const element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
    return element?.closest("a") !== null;
  }

  // src/core/dom/collect-text-nodes.ts
  var BLOCKED_SELECTOR = "a, button, input, textarea, script, style, code, pre, [contenteditable=''], [contenteditable='true']";
  function getDocument(root) {
    return root instanceof Document ? root : root.ownerDocument ?? document;
  }
  function collectTextNodes(root) {
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
    const nodes = [];
    let current = walker.nextNode();
    while (current) {
      nodes.push(current);
      current = walker.nextNode();
    }
    return nodes;
  }

  // src/core/url/trim-trailing-punctuation.ts
  var SIMPLE_TRAILING_PUNCTUATION_RE = /[。，；：！？、,.!?:;]+$/u;
  function hasMoreClosingsThanOpenings(text, opening, closing) {
    let openings = 0;
    let closings = 0;
    for (const character of text) {
      if (character === opening) openings += 1;
      if (character === closing) closings += 1;
    }
    return closings > openings;
  }
  function trimTrailingPunctuation(input) {
    let result = input.replace(SIMPLE_TRAILING_PUNCTUATION_RE, "");
    while (result.endsWith(")") && hasMoreClosingsThanOpenings(result, "(", ")")) {
      result = result.slice(0, -1);
    }
    while (result.endsWith("]") && hasMoreClosingsThanOpenings(result, "[", "]")) {
      result = result.slice(0, -1);
    }
    while (result.endsWith("}") && hasMoreClosingsThanOpenings(result, "{", "}")) {
      result = result.slice(0, -1);
    }
    return result;
  }

  // src/core/url/validate-url-candidate.ts
  var HOST_LABEL_RE = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;
  var NUMERIC_DOTTED_RE = /^\d+(?:\.\d+)+$/;
  function toUrl(input) {
    const withProtocol = /^(?:https?:\/\/)/i.test(input) ? input : `https://${input}`;
    try {
      return new URL(withProtocol);
    } catch {
      return null;
    }
  }
  function validateUrlCandidate(input) {
    const candidate = trimTrailingPunctuation(input).trim();
    if (!candidate) return false;
    if (!candidate.includes(".")) return false;
    if (NUMERIC_DOTTED_RE.test(candidate)) return false;
    const url = toUrl(candidate);
    if (!url) return false;
    const { hostname } = url;
    if (!hostname.includes(".")) return false;
    if (/^\d+(?:\.\d+)+$/.test(hostname)) return false;
    if (!/^[a-z0-9]/i.test(hostname)) return false;
    const labels = hostname.split(".");
    const topLevelDomain = labels.at(-1);
    if (!topLevelDomain || !/^[a-z]{2,63}$/i.test(topLevelDomain)) {
      return false;
    }
    return labels.every((label) => HOST_LABEL_RE.test(label));
  }

  // src/core/url/normalize-url.ts
  function normalizeUrl(input) {
    const candidate = trimTrailingPunctuation(input).trim();
    if (!validateUrlCandidate(candidate)) {
      return null;
    }
    const withProtocol = /^(?:https?:\/\/)/i.test(candidate) ? candidate : `https://${candidate}`;
    try {
      return new URL(withProtocol).toString();
    } catch {
      return null;
    }
  }

  // src/core/url/find-url-candidates.ts
  var CANDIDATE_RE = /(?:https?:\/\/|www\.)(?:[^\s<>"'`]+)|(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,63}(?::\d{2,5})?(?:[/?#][^\s<>"'`]*)?/giu;
  var INVALID_PREVIOUS_CHAR_RE = /[A-Za-z0-9@_-]/;
  var INVALID_NEXT_CHAR_RE = /[A-Za-z0-9_-]/;
  function hasValidBoundaries(input, start, end) {
    const previousCharacter = start > 0 ? input[start - 1] : "";
    const nextCharacter = end < input.length ? input[end] : "";
    if (previousCharacter && INVALID_PREVIOUS_CHAR_RE.test(previousCharacter)) {
      return false;
    }
    if (nextCharacter && INVALID_NEXT_CHAR_RE.test(nextCharacter)) {
      return false;
    }
    return true;
  }
  function findUrlCandidates(input) {
    const matches = [];
    for (const match of input.matchAll(CANDIDATE_RE)) {
      const raw = match[0];
      const start = match.index ?? 0;
      const rawEnd = start + raw.length;
      if (!hasValidBoundaries(input, start, rawEnd)) {
        continue;
      }
      const displayText = trimTrailingPunctuation(raw);
      const href = normalizeUrl(displayText);
      if (!displayText || !href) {
        continue;
      }
      matches.push({
        raw,
        displayText,
        href,
        start,
        end: start + displayText.length
      });
    }
    return matches;
  }

  // src/core/dom/linkify-text-node.ts
  function linkifyTextNode(node) {
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

  // src/core/watch/mutation-batcher.ts
  function createMutationBatcher(options) {
    const queuedNodes = /* @__PURE__ */ new Set();
    let timer = null;
    function flush() {
      if (queuedNodes.size === 0) {
        return;
      }
      const nodes = [...queuedNodes];
      queuedNodes.clear();
      timer = null;
      options.processNodes(nodes);
    }
    function enqueue(node) {
      queuedNodes.add(node);
      if (timer !== null) {
        return;
      }
      timer = setTimeout(flush, options.delayMs);
    }
    return { enqueue, flush };
  }

  // src/core/watch/start-observer.ts
  function startObserver(doc, options) {
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

  // src/site/bilibili/page-type.ts
  function getBilibiliPageType(locationLike) {
    if (locationLike.hostname === "www.bilibili.com" && locationLike.pathname.startsWith("/video/")) {
      return "video";
    }
    if (locationLike.hostname === "t.bilibili.com" || locationLike.pathname.startsWith("/opus/")) {
      return "dynamic";
    }
    return "unsupported";
  }
  function isSupportedBilibiliPage(locationLike) {
    return getBilibiliPageType(locationLike) !== "unsupported";
  }

  // src/site/bilibili/selectors.ts
  var BILIBILI_TARGET_SELECTORS = {
    videoDescription: [
      ".video-desc-container",
      ".desc-info-text",
      ".basic-desc-info",
      ".desc-info"
    ],
    commentBody: [
      ".reply-content",
      ".sub-reply-item .reply-content",
      ".root-reply-container .reply-content",
      ".reply-box .reply-content"
    ],
    dynamicBody: [
      ".bili-rich-text__content",
      ".opus-module-content",
      ".opus-module-text",
      ".dyn-card-opus__content"
    ]
  };
  var ALL_BILIBILI_TARGET_SELECTORS = Object.values(BILIBILI_TARGET_SELECTORS).flat();

  // src/site/bilibili/targets.ts
  function isElement(node) {
    return node.nodeType === Node.ELEMENT_NODE;
  }
  function isProcessableTarget(element) {
    return ALL_BILIBILI_TARGET_SELECTORS.some((selector) => element.matches(selector));
  }
  function findProcessableTargets(root) {
    const targets = /* @__PURE__ */ new Set();
    if (root instanceof Element && isProcessableTarget(root)) {
      targets.add(root);
    }
    for (const selector of ALL_BILIBILI_TARGET_SELECTORS) {
      root.querySelectorAll(selector).forEach((element) => {
        targets.add(element);
      });
    }
    return [...targets];
  }
  function findTargetsWithin(node) {
    if (!isElement(node)) {
      return [];
    }
    return findProcessableTargets(node);
  }
  function findOwningTarget(node) {
    const element = isElement(node) ? node : node.parentElement;
    if (!element) {
      return null;
    }
    const owningTarget = element.closest(ALL_BILIBILI_TARGET_SELECTORS.join(", "));
    return owningTarget instanceof HTMLElement ? owningTarget : null;
  }

  // src/userscript/main.ts
  function injectGeneratedLinkStyles(doc) {
    if (doc.getElementById(GENERATED_LINK_STYLE_ID)) {
      return;
    }
    const style = doc.createElement("style");
    style.id = GENERATED_LINK_STYLE_ID;
    style.textContent = GENERATED_LINK_STYLE;
    doc.head.append(style);
  }
  function processTarget(target) {
    let changedCount = 0;
    for (const node of collectTextNodes(target)) {
      if (linkifyTextNode(node)) {
        changedCount += 1;
      }
    }
    return changedCount;
  }
  function processNode(node) {
    const targets = /* @__PURE__ */ new Set();
    const owningTarget = findOwningTarget(node);
    if (owningTarget) {
      targets.add(owningTarget);
    }
    for (const target of findTargetsWithin(node)) {
      targets.add(target);
    }
    return [...targets].reduce((count, target) => count + processTarget(target), 0);
  }
  function bootstrap(doc = document, options = {}) {
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

  // src/userscript/entry.ts
  bootstrap(document);
})();
