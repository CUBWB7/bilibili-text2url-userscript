import { describe, expect, it } from "vitest";
import { bootstrap } from "../../../src/userscript/main";

describe("bootstrap", () => {
  it("is defined", () => {
    expect(typeof bootstrap).toBe("function");
  });
});
