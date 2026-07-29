import { describe, it, expect } from "vitest";
import { classifyIntent, parsePriceConstraint } from "../src/intent.js";

describe("classifyIntent", () => {
  it("classifies product nouns as product", () => {
    expect(classifyIntent("I need a desk chair under $300")).toBe("product");
    expect(classifyIntent("Find me an ergonomic office chair")).toBe("product");
    expect(classifyIntent("a small side table")).toBe("product");
  });

  it("classifies service verbs as service", () => {
    expect(classifyIntent("Book a haircut this Saturday afternoon")).toBe("service");
    expect(classifyIntent("I'd like a beard trim near me")).toBe("service");
    expect(classifyIntent("barber near me")).toBe("service");
  });

  it("never mistakes chair for hair", () => {
    expect(classifyIntent("chair")).toBe("product");
    expect(classifyIntent("chairs")).toBe("product");
    expect(classifyIntent("armchair")).toBe("product");
    expect(classifyIntent("desk chair under $300")).toBe("product");
  });

  it("prefers the product noun when both appear", () => {
    expect(classifyIntent("book a chair for my desk")).toBe("product");
  });

  it("defaults to product for unmatched text", () => {
    expect(classifyIntent("something nice")).toBe("product");
  });
});

describe("parsePriceConstraint", () => {
  it("parses 'under $300' as cents", () => {
    expect(parsePriceConstraint("I need a desk chair under $300")).toBe(30000);
  });

  it("tolerates spacing and casing", () => {
    expect(parsePriceConstraint("UNDER 250")).toBe(25000);
    expect(parsePriceConstraint("under $ 99")).toBe(9900);
  });

  it("parses 'less than' and 'below'", () => {
    expect(parsePriceConstraint("less than $150")).toBe(15000);
    expect(parsePriceConstraint("below $80")).toBe(8000);
  });

  it("returns null when no constraint is present", () => {
    expect(parsePriceConstraint("a nice chair")).toBeNull();
  });
});
