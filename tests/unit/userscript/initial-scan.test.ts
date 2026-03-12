// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { bootstrap } from "../../../src/userscript/main";

describe("bootstrap initial scan", () => {
  it("linkifies a plain-text url in a supported target", () => {
    document.body.innerHTML = '<div class="reply-content">看这里 https://example.com</div>';

    bootstrap(document, {
      locationLike: {
        hostname: "www.bilibili.com",
        pathname: "/video/BV1xx"
      }
    });

    expect(document.querySelector("a")?.href).toBe("https://example.com/");
  });

  it("linkifies urls inside bili-rich-text shadow content", () => {
    const host = document.createElement("bili-rich-text");
    const shadowRoot = host.attachShadow({ mode: "open" });
    shadowRoot.innerHTML =
      "<p id='contents'><span>链接: https://pan.baidu.com/s/1RsgJqMoZorYsYHVTy31Rig?pwd=msxq 提取码: msxq</span></p>";
    document.body.append(host);

    bootstrap(document, {
      locationLike: {
        hostname: "www.bilibili.com",
        pathname: "/video/BV1xx"
      }
    });

    const anchor = shadowRoot.querySelector("a");
    expect(anchor?.getAttribute("href")).toBe("https://pan.baidu.com/s/1RsgJqMoZorYsYHVTy31Rig?pwd=msxq");
    expect(anchor?.textContent).toBe("https://pan.baidu.com/s/1RsgJqMoZorYsYHVTy31Rig?pwd=msxq");
  });

  it("linkifies urls inside bili-rich-text hosts nested in outer shadow roots", () => {
    const outerHost = document.createElement("bili-comment-thread");
    const outerShadow = outerHost.attachShadow({ mode: "open" });
    outerShadow.innerHTML = "<div id='main'><bili-rich-text></bili-rich-text></div>";
    document.body.append(outerHost);

    const richText = outerShadow.querySelector("bili-rich-text") as HTMLElement | null;
    expect(richText).not.toBeNull();

    const innerShadow = richText!.attachShadow({ mode: "open" });
    innerShadow.innerHTML =
      "<p id='contents'><span>链接: https://www.kdocs.cn/l/cd8zue8rZ5sD?f=301</span></p>";

    bootstrap(document, {
      locationLike: {
        hostname: "www.bilibili.com",
        pathname: "/video/BV1xx"
      }
    });

    const anchor = innerShadow.querySelector("a");
    expect(anchor?.getAttribute("href")).toBe("https://www.kdocs.cn/l/cd8zue8rZ5sD?f=301");
  });
});
