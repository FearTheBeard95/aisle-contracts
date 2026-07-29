import { describe, it, expect } from "vitest";
import { CONTRACTS_VERSION } from "../src/index.js";

describe("package", () => {
  it("exports a version", () => {
    expect(CONTRACTS_VERSION).toBe("0.1.2");
  });
});
