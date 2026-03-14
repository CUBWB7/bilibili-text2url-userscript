// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { collectInlineSegmentGroups } from "../../../src/core/dom/collect-inline-segment-groups";

describe("collectInlineSegmentGroups", () => {
  it("groups consecutive text and neutral inline wrappers into one visible string", () => {
    document.body.innerHTML = `
      <div class="reply-content">
        <span>前缀 https://github.com/waylandzhang/ai-</span>
        <span class="bili-search-hotword"><span>quant</span><i aria-hidden="true">🔎</i></span>
        <span>-book</span>
      </div>
    `;

    const target = document.querySelector(".reply-content");
    expect(target).not.toBeNull();

    const groups = collectInlineSegmentGroups(target!);
    expect(groups).toHaveLength(1);
    expect(groups[0]?.text).toBe("前缀 https://github.com/waylandzhang/ai-quant-book");
  });

  it("stops grouping at existing anchors", () => {
    document.body.innerHTML = `
      <div class="reply-content">
        <span>https://example.com/left</span>
        <a href="https://bilibili.com/topic">热词</a>
        <span>https://example.com/right</span>
      </div>
    `;

    const target = document.querySelector(".reply-content");
    expect(target).not.toBeNull();

    const groups = collectInlineSegmentGroups(target!);
    expect(groups.map((group) => group.text)).toEqual([
      "https://example.com/left",
      "https://example.com/right"
    ]);
  });

  it("includes bilibili search anchors as recoverable inline text", () => {
    document.body.innerHTML =
      '<div class="reply-content"><span>https://github.com/waylandzhang/ai-</span><a href="//search.bilibili.com/all?keyword=quant" target="_blank" data-type="search" data-keyword="quant"><img src="https://example.com/icon.png" alt="">quant</a><span>-book</span></div>';

    const target = document.querySelector(".reply-content");
    expect(target).not.toBeNull();

    const groups = collectInlineSegmentGroups(target!);
    expect(groups).toHaveLength(1);
    expect(groups[0]?.text).toBe("https://github.com/waylandzhang/ai-quant-book");
  });

  it("stops grouping across block boundaries", () => {
    document.body.innerHTML = `
      <div class="reply-content">
        <span>https://example.com/left</span>
        <div>block break</div>
        <span>https://example.com/right</span>
      </div>
    `;

    const target = document.querySelector(".reply-content");
    expect(target).not.toBeNull();

    const groups = collectInlineSegmentGroups(target!);
    expect(groups.map((group) => group.text)).toEqual([
      "https://example.com/left",
      "block break",
      "https://example.com/right"
    ]);
  });
});
