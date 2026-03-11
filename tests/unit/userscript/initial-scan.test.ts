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
});
