// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { bootstrap } from "../../../src/userscript/main";

describe("bootstrap observer", () => {
  it("linkifies text added after startup", async () => {
    document.body.innerHTML = '<div id="root"></div>';

    bootstrap(document, {
      locationLike: {
        hostname: "www.bilibili.com",
        pathname: "/video/BV1xx"
      }
    });

    const reply = document.createElement("div");
    reply.className = "reply-content";
    reply.textContent = "新增评论 https://late.example.com";
    document.body.append(reply);

    await new Promise((resolve) => window.setTimeout(resolve, 120));

    expect(document.querySelector("a")?.href).toBe("https://late.example.com/");
  });

  it("reprocesses an existing target when new content is appended inside it", async () => {
    document.body.innerHTML = '<div class="reply-content"><span>原始文本</span></div>';

    bootstrap(document, {
      locationLike: {
        hostname: "www.bilibili.com",
        pathname: "/video/BV1xx"
      }
    });

    const reply = document.querySelector(".reply-content");
    expect(reply).not.toBeNull();

    const appended = document.createElement("span");
    appended.textContent = " 追加链接 https://inside.example.com";
    reply!.append(appended);

    await new Promise((resolve) => window.setTimeout(resolve, 120));

    expect(document.querySelector('a[href="https://inside.example.com/"]')).not.toBeNull();
  });

  it("observes text rendered later inside an existing bili-rich-text shadow root", async () => {
    const host = document.createElement("bili-rich-text");
    const shadowRoot = host.attachShadow({ mode: "open" });
    shadowRoot.innerHTML = "<p id='contents'></p>";
    document.body.append(host);

    bootstrap(document, {
      locationLike: {
        hostname: "www.bilibili.com",
        pathname: "/video/BV1xx"
      }
    });

    const text = document.createElement("span");
    text.textContent = "链接: https://pan.baidu.com/s/1RsgJqMoZorYsYHVTy31Rig?pwd=msxq";
    shadowRoot.querySelector("#contents")?.append(text);

    await new Promise((resolve) => window.setTimeout(resolve, 120));

    const anchor = shadowRoot.querySelector("a");
    expect(anchor?.getAttribute("href")).toBe("https://pan.baidu.com/s/1RsgJqMoZorYsYHVTy31Rig?pwd=msxq");
  });

  it("observes text rendered inside a newly added bili-rich-text shadow root", async () => {
    document.body.innerHTML = '<div id="root"></div>';

    bootstrap(document, {
      locationLike: {
        hostname: "www.bilibili.com",
        pathname: "/video/BV1xx"
      }
    });

    const host = document.createElement("bili-rich-text");
    const shadowRoot = host.attachShadow({ mode: "open" });
    shadowRoot.innerHTML = "<p id='contents'></p>";
    document.body.append(host);

    const text = document.createElement("span");
    text.textContent = "链接: https://www.kdocs.cn/l/cd8zue8rZ5sD?f=301";
    shadowRoot.querySelector("#contents")?.append(text);

    await new Promise((resolve) => window.setTimeout(resolve, 120));

    const anchor = shadowRoot.querySelector("a");
    expect(anchor?.getAttribute("href")).toBe("https://www.kdocs.cn/l/cd8zue8rZ5sD?f=301");
  });

  it("observes text rendered inside bili-rich-text nested under another shadow root", async () => {
    const outerHost = document.createElement("bili-comment-thread");
    const outerShadow = outerHost.attachShadow({ mode: "open" });
    outerShadow.innerHTML = "<div id='main'><bili-rich-text></bili-rich-text></div>";
    document.body.append(outerHost);

    const richText = outerShadow.querySelector("bili-rich-text") as HTMLElement | null;
    expect(richText).not.toBeNull();
    const innerShadow = richText!.attachShadow({ mode: "open" });
    innerShadow.innerHTML = "<p id='contents'></p>";

    bootstrap(document, {
      locationLike: {
        hostname: "www.bilibili.com",
        pathname: "/video/BV1xx"
      }
    });

    const text = document.createElement("span");
    text.textContent = "链接: https://pan.baidu.com/s/1RsgJqMoZorYsYHVTy31Rig?pwd=msxq";
    innerShadow.querySelector("#contents")?.append(text);

    await new Promise((resolve) => window.setTimeout(resolve, 120));

    const anchor = innerShadow.querySelector("a");
    expect(anchor?.getAttribute("href")).toBe("https://pan.baidu.com/s/1RsgJqMoZorYsYHVTy31Rig?pwd=msxq");
  });
});
