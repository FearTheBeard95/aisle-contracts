import { describe, it, expect } from "vitest";
import {
  ProductCardSchema, ServiceCardSchema, OrderStageSchema, BookingStatusSchema,
  ApiErrorSchema, CartLineSchema,
} from "../src/index.js";

describe("dto schemas", () => {
  it("validates a product card", () => {
    const card = {
      id: "aro", merchantId: "m1", name: "Aro Task Chair", kicker: "ERGONOMIC",
      priceCents: 24800, rating: 4.6, meta: "Mesh back", image: "chair",
      category: "Task chair", material: "Mesh",
    };
    expect(ProductCardSchema.parse(card).priceCents).toBe(24800);
  });

  it("rejects a product card with a float price", () => {
    expect(() => ProductCardSchema.parse({
      id: "a", merchantId: "m1", name: "x", priceCents: 248.5, rating: 4, image: "chair",
    })).toThrow();
  });

  it("validates a service card with slots", () => {
    const card = {
      id: "fade", merchantId: "m1", name: "Fade & Co.", rating: 4.8, reviewCount: 210,
      distanceMiles: 0.4, fromPriceCents: 3500, image: "shop",
      slots: [{ id: "s1", startsAt: "2026-08-01T20:30:00.000Z", label: "1:30" }],
    };
    expect(ServiceCardSchema.parse(card).slots).toHaveLength(1);
  });

  it("enumerates order stages in fulfilment order", () => {
    expect(OrderStageSchema.options).toEqual(["placed", "packed", "in_transit", "delivered"]);
  });

  it("enumerates booking statuses", () => {
    expect(BookingStatusSchema.options).toEqual([
      "pending", "confirmed", "declined", "cancelled", "expired", "done",
    ]);
  });

  it("validates the error envelope", () => {
    const parsed = ApiErrorSchema.parse({ error: { code: "PLAN_LIMIT", message: "Upgrade needed" } });
    expect(parsed.error.code).toBe("PLAN_LIMIT");
  });

  it("requires a positive quantity on cart lines", () => {
    expect(() => CartLineSchema.parse({
      id: "l1", productId: "aro", name: "Aro", variant: "Graphite", qty: 0,
      unitPriceCents: 24800, lineTotalCents: 0, image: "chair",
    })).toThrow();
  });
});
