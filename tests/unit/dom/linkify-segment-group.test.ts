// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { collectInlineSegmentGroups } from "../../../src/core/dom/collect-inline-segment-groups";
import { linkifySegmentGroup } from "../../../src/core/dom/linkify-segment-group";

describe("linkifySegmentGroup", () => {
  it("replaces a url spanning text and hotword wrappers with one anchor", () => {
    document.body.innerHTML = `
      <div class="reply-content">
        <span>链接 https://github.com/waylandzhang/ai-</span>
        <span class="bili-search-hotword"><span>quant</span><i aria-hidden="true">🔎</i></span>
        <span>-book</span>
      </div>
    `;

    const target = document.querySelector(".reply-content");
    const group = collectInlineSegmentGroups(target!).at(0);

    expect(group).toBeDefined();
    expect(linkifySegmentGroup(group!)).toBe(true);

    const anchors = [...document.querySelectorAll(".reply-content a")];
    expect(anchors).toHaveLength(1);
    expect(anchors[0]?.getAttribute("href")).toBe("https://github.com/waylandzhang/ai-quant-book");
    expect(anchors[0]?.textContent).toBe("https://github.com/waylandzhang/ai-quant-book");
    expect(document.querySelector(".bili-search-hotword")).toBeNull();
  });

  it("removes decorative icon nodes inside the replaced range", () => {
    document.body.innerHTML = `
      <div class="reply-content">
        <span>https://example.com/ai-</span>
        <span class="bili-search-hotword"><span>quant</span><i class="icon" aria-hidden="true">🔎</i></span>
        <span>-book</span>
      </div>
    `;

    const target = document.querySelector(".reply-content");
    const group = collectInlineSegmentGroups(target!).at(0);

    expect(group).toBeDefined();
    expect(linkifySegmentGroup(group!)).toBe(true);
    expect(document.querySelector(".icon")).toBeNull();
  });

  it("rejects a truncated prefix that only reaches the segment boundary", () => {
    document.body.innerHTML = `
      <div class="reply-content">
        <span>https://github.com/waylandzhang/ai-</span>
        <span class="bili-search-hotword"><i aria-hidden="true">🔎</i></span>
      </div>
    `;

    const target = document.querySelector(".reply-content");
    const group = collectInlineSegmentGroups(target!).at(0);

    expect(group).toBeDefined();
    expect(linkifySegmentGroup(group!)).toBe(false);
    expect(document.querySelector(".reply-content a")).toBeNull();
  });
});
