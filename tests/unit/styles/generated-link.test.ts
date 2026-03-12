import { describe, expect, it } from "vitest";
import { GENERATED_LINK_STYLE } from "../../../src/styles/generated-link";

describe("GENERATED_LINK_STYLE", () => {
  it("uses blue links without underlines", () => {
    expect(GENERATED_LINK_STYLE).toContain("color: #1677ff;");
    expect(GENERATED_LINK_STYLE).toContain("text-decoration: none;");
  });
});
