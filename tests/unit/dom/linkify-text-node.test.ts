// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { linkifyTextNode } from "../../../src/core/dom/linkify-text-node";

describe("linkifyTextNode", () => {
  it("replaces a url substring with an anchor", () => {
    document.body.innerHTML = "<div>测评结果在线网页：https://modeltest.codermumu.top/。</div>";
    const textNode = document.querySelector("div")?.firstChild as Text | null;

    expect(textNode).not.toBeNull();
    linkifyTextNode(textNode!);

    const anchor = document.querySelector("a");
    expect(anchor?.getAttribute("href")).toBe("https://modeltest.codermumu.top/");
    expect(anchor?.textContent).toBe("https://modeltest.codermumu.top/");
    expect(document.querySelector("div")?.textContent).toBe(
      "测评结果在线网页：https://modeltest.codermumu.top/。"
    );
  });
});
