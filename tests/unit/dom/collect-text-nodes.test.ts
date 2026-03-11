// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { collectTextNodes } from "../../../src/core/dom/collect-text-nodes";

describe("collectTextNodes", () => {
  it("skips text inside anchors", () => {
    document.body.innerHTML = "<div><a>https://a.com</a><span>https://b.com</span></div>";
    const root = document.querySelector("div");

    expect(root).not.toBeNull();
    const texts = collectTextNodes(root!);
    expect(texts.map((node) => node.textContent)).toEqual(["https://b.com"]);
  });
});
