// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { findProcessableTargets } from "../../../../src/site/bilibili/targets";

describe("findProcessableTargets", () => {
  it("returns description and comment containers", () => {
    document.body.innerHTML = `
      <div class="video-desc-container"><span>https://example.com</span></div>
      <div class="reply-content"><span>https://reply.example.com</span></div>
    `;

    expect(findProcessableTargets(document).length).toBe(2);
  });

  it("includes bili-rich-text hosts used by the new comment component", () => {
    document.body.innerHTML = `<div id="main"><bili-rich-text></bili-rich-text></div>`;

    expect(findProcessableTargets(document).map((element) => element.tagName)).toContain("BILI-RICH-TEXT");
  });

  it("finds bili-rich-text hosts nested inside other shadow roots", () => {
    const outerHost = document.createElement("bili-comment-renderer");
    const outerShadow = outerHost.attachShadow({ mode: "open" });
    outerShadow.innerHTML = `<div id="main"><bili-rich-text></bili-rich-text></div>`;
    document.body.append(outerHost);

    expect(findProcessableTargets(document).map((element) => element.tagName)).toContain("BILI-RICH-TEXT");
  });
});
