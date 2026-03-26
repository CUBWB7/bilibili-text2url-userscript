// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { bootstrap } from "../../../src/userscript/main";

describe("bootstrap initial scan", () => {
  it("linkifies urls on watchlater pages", () => {
    document.body.innerHTML = '<div class="reply-content">稍后再看链接 https://watchlater.example.com</div>';

    bootstrap(document, {
      locationLike: {
        hostname: "www.bilibili.com",
        pathname: "/list/watchlater/"
      }
    });

    expect(document.querySelector("a")?.href).toBe("https://watchlater.example.com/");
  });

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

  it("recovers a hotword-interrupted http url as one generated link", () => {
    document.body.innerHTML = `
      <div class="reply-content">
        <span>链接 https://github.com/waylandzhang/ai-</span>
        <span class="bili-search-hotword"><span>quant</span><i aria-hidden="true">🔎</i></span>
        <span>-book</span>
      </div>
    `;

    bootstrap(document, {
      locationLike: {
        hostname: "www.bilibili.com",
        pathname: "/video/BV1xx"
      }
    });

    const anchors = [...document.querySelectorAll(".reply-content a")];
    expect(anchors).toHaveLength(1);
    expect(anchors[0]?.getAttribute("href")).toBe("https://github.com/waylandzhang/ai-quant-book");
    expect(anchors[0]?.textContent).toBe("https://github.com/waylandzhang/ai-quant-book");
    expect(document.querySelector(".bili-search-hotword")).toBeNull();
  });

  it("recovers a url interrupted by a bilibili search anchor hotword", () => {
    document.body.innerHTML =
      '<div class="reply-content"><span>《</span><a href="//search.bilibili.com/all?keyword=AI%E9%87%8F%E5%8C%96%E4%BA%A4%E6%98%93" target="_blank" data-type="search" data-keyword="AI量化交易"><img src="https://example.com/icon.png" alt="">AI量化交易</a><span>从0到1》https://github.com/waylandzhang/ai-</span><a href="//search.bilibili.com/all?keyword=quant" target="_blank" data-type="search" data-keyword="quant"><img src="https://example.com/icon.png" alt="">quant</a><span>-book</span></div>';

    bootstrap(document, {
      locationLike: {
        hostname: "www.bilibili.com",
        pathname: "/video/BV1xx"
      }
    });

    const anchors = [...document.querySelectorAll(".reply-content a")];
    expect(anchors).toHaveLength(2);
    expect(anchors[0]?.getAttribute("data-type")).toBe("search");
    expect(anchors[1]?.getAttribute("href")).toBe("https://github.com/waylandzhang/ai-quant-book");
    expect(anchors[1]?.textContent).toBe("https://github.com/waylandzhang/ai-quant-book");
    expect(document.querySelector('[data-keyword="quant"]')).toBeNull();
  });

  it("does not generate a partial link when only a truncated prefix is visible", () => {
    document.body.innerHTML = `
      <div class="reply-content">
        <span>https://github.com/waylandzhang/ai-</span>
        <span class="bili-search-hotword"><i aria-hidden="true">🔎</i></span>
      </div>
    `;

    bootstrap(document, {
      locationLike: {
        hostname: "www.bilibili.com",
        pathname: "/video/BV1xx"
      }
    });

    expect(document.querySelector(".reply-content a")).toBeNull();
    expect(document.querySelector(".reply-content")?.textContent).toContain(
      "https://github.com/waylandzhang/ai-"
    );
  });
});
