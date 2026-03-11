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
});
