import { describe, it, expect } from "vitest";
import {
  TOOL_NAMES, SearchProductsInputSchema, SearchProductsResultSchema,
  SearchServicesResultSchema, RecoverySchema, CompareItemsInputSchema,
  AddToCartToolInputSchema, CreateBookingToolInputSchema,
  GetAvailabilityInputSchema, SaveSearchInputSchema, CreateOrderInputSchema,
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

  it("rejects a compareItems input with fewer than 2 items", () => {
    expect(() => CompareItemsInputSchema.parse({ itemIds: ["a"] })).toThrow();
  });

  it("rejects a compareItems input with more than 3 items", () => {
    expect(() => CompareItemsInputSchema.parse({ itemIds: ["a", "b", "c", "d"] })).toThrow();
  });

  it("accepts a compareItems input with 2 items", () => {
    const ok = CompareItemsInputSchema.parse({ itemIds: ["a", "b"] });
    expect(ok.itemIds).toHaveLength(2);
  });

  it("accepts a compareItems input with 3 items", () => {
    const ok = CompareItemsInputSchema.parse({ itemIds: ["a", "b", "c"] });
    expect(ok.itemIds).toHaveLength(3);
  });

  it("rejects a recovery with no chips", () => {
    expect(() =>
      RecoverySchema.parse({ failedConstraint: "noMatch", chips: [] })
    ).toThrow();
  });

  it("rejects a maxPrice recovery without closestPriceCents (CUS-C-08)", () => {
    expect(() =>
      RecoverySchema.parse({ failedConstraint: "maxPrice", chips: ["Loosen it"] })
    ).toThrow(/closest available price/);
  });

  it("accepts a complete maxPrice recovery", () => {
    const ok = RecoverySchema.parse({
      failedConstraint: "maxPrice", closestPriceCents: 17900, chips: ["Show me under $229"],
    });
    expect(ok.closestPriceCents).toBe(17900);
  });

  it("accepts a noMatch recovery without a price", () => {
    const ok = RecoverySchema.parse({ failedConstraint: "noMatch", chips: ["Try a broader search"] });
    expect(ok.failedConstraint).toBe("noMatch");
  });

  it("accepts an addToCart input with qty", () => {
    const ok = AddToCartToolInputSchema.parse({ productId: "p1", variant: "Graphite", qty: 3 });
    expect(ok.qty).toBe(3);
  });

  it("defaults addToCart qty to 1 when omitted", () => {
    const ok = AddToCartToolInputSchema.parse({ productId: "p1" });
    expect(ok.qty).toBe(1);
  });

  it("rejects an addToCart qty of 0", () => {
    expect(() => AddToCartToolInputSchema.parse({ productId: "p1", qty: 0 })).toThrow();
  });

  it("rejects a createBooking input missing slotId", () => {
    expect(() =>
      CreateBookingToolInputSchema.parse({ merchantId: "m1", serviceId: "s1" })
    ).toThrow();
  });

  it("accepts a valid createBooking input", () => {
    const ok = CreateBookingToolInputSchema.parse({
      merchantId: "m1", serviceId: "s1", slotId: "slot1", addOnKeys: [], repeat: "once",
    });
    expect(ok.addOnKeys).toEqual([]);
    expect(ok.repeat).toBe("once");
  });

  it("rejects a getAvailability input with a non-ISO date", () => {
    expect(() =>
      GetAvailabilityInputSchema.parse({ merchantId: "m1", date: "tomorrow" })
    ).toThrow();
  });

  it("rejects a saveSearch input with an empty query", () => {
    expect(() => SaveSearchInputSchema.parse({ query: "" })).toThrow();
  });

  it("accepts an empty createOrder input, because the order is built entirely from server-side cart state — the client has nothing to supply", () => {
    const ok = CreateOrderInputSchema.parse({});
    expect(ok).toEqual({});
  });
});
