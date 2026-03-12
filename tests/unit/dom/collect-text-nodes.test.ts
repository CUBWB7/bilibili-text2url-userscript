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

  it("collects text inside open shadow roots", () => {
    const host = document.createElement("bili-rich-text");
    const shadowRoot = host.attachShadow({ mode: "open" });
    shadowRoot.innerHTML = "<p><span>链接: https://pan.baidu.com/s/1RsgJqMoZorYsYHVTy31Rig?pwd=msxq</span></p>";
    document.body.append(host);

    const texts = collectTextNodes(host);
    expect(texts.map((node) => node.textContent)).toEqual([
      "链接: https://pan.baidu.com/s/1RsgJqMoZorYsYHVTy31Rig?pwd=msxq"
    ]);
  });
});
