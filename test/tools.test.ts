import { describe, it, expect } from "vitest";
import {
  TOOL_NAMES, SearchProductsInputSchema, SearchProductsResultSchema,
  SearchServicesResultSchema,
} from "../src/index.js";

describe("tool contract", () => {
  it("names the seven PRD §7 tools", () => {
    expect(TOOL_NAMES).toEqual([
      "searchProducts", "searchServices", "getAvailability",
      "addToCart", "createOrder", "createBooking", "compareItems", "saveSearch",
    ]);
  });

  it("accepts a product search with constraints", () => {
    const input = SearchProductsInputSchema.parse({ query: "desk chair", maxPriceCents: 30000 });
    expect(input.maxPriceCents).toBe(30000);
  });

  it("requires a recovery payload when a product search is empty", () => {
    expect(() => SearchProductsResultSchema.parse({ summary: "none", items: [] })).toThrow();
    const ok = SearchProductsResultSchema.parse({
      summary: "Nothing in stock under $50 right now — the lowest I can find is $179. Want me to loosen that?",
      items: [],
      recovery: { failedConstraint: "maxPrice", closestPriceCents: 17900, chips: ["Show me under $229"] },
      chips: [],
    });
    expect(ok.recovery?.closestPriceCents).toBe(17900);
  });

  it("allows a non-empty service result without recovery", () => {
    const ok = SearchServicesResultSchema.parse({
      summary: "2 barbers with Saturday afternoon openings near you — tap to book.",
      items: [{
        id: "fade", merchantId: "m1", name: "Fade & Co.", rating: 4.8, reviewCount: 210,
        distanceMiles: 0.4, fromPriceCents: 3500, image: "shop",
        slots: [{ id: "s1", startsAt: "2026-08-01T20:30:00.000Z", label: "1:30" }],
      }],
      chips: ["Only beard trims", "Sooner", "Higher rated", "Save this search"],
    });
    expect(ok.items).toHaveLength(1);
  });
});
