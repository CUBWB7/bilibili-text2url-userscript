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
});
