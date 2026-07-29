import { describe, it, expect } from "vitest";
import { COLORS, RADIUS, RULE } from "../src/tokens.js";

describe("tokens", () => {
  it("matches the Modernist palette", () => {
    expect(COLORS.bg).toBe("#f3f2f2");
    expect(COLORS.surface).toBe("#eae9e9");
    expect(COLORS.text).toBe("#201e1d");
    expect(COLORS.accent).toBe("#ec3013");
    expect(COLORS.accent100).toBe("#fff2ef");
    expect(COLORS.accent700).toBe("#ae1800");
    expect(COLORS.accent800).toBe("#7c1405");
    expect(COLORS.divider).toBe("#d8d5d4");
    expect(COLORS.neutral600).toBe("#7d7979");
    expect(COLORS.neutral700).toBe("#605d5d");
    expect(COLORS.neutral800).toBe("#444141");
  });

  it("has zero radius everywhere", () => {
    expect(RADIUS.md).toBe(0);
  });

  it("defines hairline and strong rules", () => {
    expect(RULE.hairline).toBe(1);
    expect(RULE.strong).toBe(2);
  });
});
