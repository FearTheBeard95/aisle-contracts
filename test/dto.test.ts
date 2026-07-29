import { describe, it, expect } from "vitest";
import {
  ProductCardSchema, ServiceCardSchema, OrderStageSchema, BookingStatusSchema,
  ApiErrorSchema, CartLineSchema, SignUpSchema, VerifyCodeSchema, MerchantSignUpSchema,
  ApprovalStatusSchema, SlotStateSchema, RepeatSchema, DayHoursSchema, SubscriptionSchema,
  ConversationTurnSchema, PlanLimitDetailsSchema, NotificationSchema, SavedSearchSchema,
  FavoriteSchema,
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

describe("auth dto schemas", () => {
  const validSignUp = {
    name: "Ada Lovelace", email: "ada@example.com", password: "sup3rsecret", acceptedTerms: true as const,
  };

  it("accepts a valid signup", () => {
    expect(SignUpSchema.parse(validSignUp).email).toBe("ada@example.com");
  });

  it("rejects a signup password with no digit", () => {
    expect(() => SignUpSchema.parse({ ...validSignUp, password: "nodigitshere" })).toThrow();
  });

  it("rejects a signup password under 8 characters", () => {
    expect(() => SignUpSchema.parse({ ...validSignUp, password: "a1b2c3" })).toThrow();
  });

  it("rejects a signup with acceptedTerms false", () => {
    expect(() => SignUpSchema.parse({ ...validSignUp, acceptedTerms: false })).toThrow();
  });

  it("rejects a signup with a malformed email", () => {
    expect(() => SignUpSchema.parse({ ...validSignUp, email: "not-an-email" })).toThrow();
  });

  it("accepts exactly a 6-digit verification code", () => {
    expect(VerifyCodeSchema.parse({ email: "ada@example.com", code: "123456" }).code).toBe("123456");
  });

  it("rejects a 5-digit verification code", () => {
    expect(() => VerifyCodeSchema.parse({ email: "ada@example.com", code: "12345" })).toThrow();
  });

  it("rejects a 7-digit verification code", () => {
    expect(() => VerifyCodeSchema.parse({ email: "ada@example.com", code: "1234567" })).toThrow();
  });

  const validMerchantSignUp = {
    businessName: "Fade & Co.", ownerName: "Ada Lovelace", email: "ada@example.com",
    password: "sup3rsecret", offerType: "services" as const, acceptedTerms: true as const,
  };

  it("rejects an invalid merchant signup offerType", () => {
    expect(() => MerchantSignUpSchema.parse({ ...validMerchantSignUp, offerType: "widgets" })).toThrow();
  });

  it("rejects a merchant signup with acceptedTerms false", () => {
    expect(() => MerchantSignUpSchema.parse({ ...validMerchantSignUp, acceptedTerms: false })).toThrow();
  });
});

describe("enum dto schemas", () => {
  it("rejects an unknown merchant approval status", () => {
    expect(() => ApprovalStatusSchema.parse("banned")).toThrow();
  });

  it("rejects an unknown slot state", () => {
    expect(() => SlotStateSchema.parse("free")).toThrow();
  });

  it("rejects an unknown repeat cadence", () => {
    expect(() => RepeatSchema.parse("weekly")).toThrow();
  });

  it("rejects an unknown day-hours day", () => {
    expect(() => DayHoursSchema.shape.day.parse("Funday")).toThrow();
  });

  it("rejects an unknown conversation turn type", () => {
    expect(() => ConversationTurnSchema.parse({
      id: "t1", role: "agent", type: "video", createdAt: "2026-08-01T20:30:00.000Z",
    })).toThrow();
  });
});

describe("subscription dto schema", () => {
  const validSubscription = {
    plan: "aisle" as const,
    cycle: "monthly" as const,
    periodStart: "2026-08-01T00:00:00.000Z",
    periodEnd: "2026-09-01T00:00:00.000Z",
    usage: { bookingsThisPeriod: 3, services: 2, team: 1 },
    pendingPlan: null,
    cardBrand: "Visa",
    cardLast4: "4242",
    invoices: [],
  };

  it("rejects an unknown subscription plan id", () => {
    expect(() => SubscriptionSchema.parse({ ...validSubscription, plan: "enterprise" })).toThrow();
  });

  it("accepts a null pendingPlan", () => {
    expect(SubscriptionSchema.parse(validSubscription).pendingPlan).toBeNull();
  });
});

describe("PlanLimitDetailsSchema", () => {
  it("parses a valid capability branch", () => {
    const parsed = PlanLimitDetailsSchema.parse({
      kind: "capability", capability: "insights", plan: "counter", requiredPlan: "aisle",
    });
    expect(parsed.kind).toBe("capability");
  });

  it("rejects a capability branch missing requiredPlan", () => {
    expect(() => PlanLimitDetailsSchema.parse({
      kind: "capability", capability: "insights", plan: "counter",
    })).toThrow();
  });

  it("parses a valid quantity branch", () => {
    const parsed = PlanLimitDetailsSchema.parse({
      kind: "quantity", limit: "services", cap: 5, used: 5, plan: "counter", requiredPlan: "aisle",
    });
    expect(parsed.kind).toBe("quantity");
  });

  it("rejects a quantity branch missing cap and used", () => {
    expect(() => PlanLimitDetailsSchema.parse({
      kind: "quantity", limit: "services", plan: "counter", requiredPlan: "aisle",
    })).toThrow();
  });

  it("parses a valid bookingCap branch", () => {
    const parsed = PlanLimitDetailsSchema.parse({
      kind: "bookingCap", cap: 20, used: 20, plan: "counter", requiredPlan: "aisle",
    });
    expect(parsed.kind).toBe("bookingCap");
  });

  it("rejects a bookingCap branch missing used", () => {
    expect(() => PlanLimitDetailsSchema.parse({
      kind: "bookingCap", cap: 20, plan: "counter", requiredPlan: "aisle",
    })).toThrow();
  });
});

describe("NotificationSchema", () => {
  const validNotification = {
    id: "n1", kind: "Order" as const, title: "Order placed", sub: "AO-1001",
    when: "2m ago", createdAt: "2026-08-01T20:30:00.000Z", read: false,
  };

  it("accepts a complete valid notification", () => {
    expect(NotificationSchema.parse(validNotification).read).toBe(false);
  });

  it("rejects an unknown notification kind", () => {
    expect(() => NotificationSchema.parse({ ...validNotification, kind: "Promo" })).toThrow();
  });

  it("rejects a non-ISO createdAt", () => {
    expect(() => NotificationSchema.parse({ ...validNotification, createdAt: "yesterday" })).toThrow();
  });
});

describe("SavedSearchSchema", () => {
  const validSavedSearch = {
    id: "s1", query: "task chair", maxPriceCents: 30000, active: true,
    createdAt: "2026-08-01T20:30:00.000Z",
  };

  it("accepts a null maxPriceCents (no price constraint)", () => {
    expect(SavedSearchSchema.parse({ ...validSavedSearch, maxPriceCents: null }).maxPriceCents).toBeNull();
  });

  it("rejects a float maxPriceCents", () => {
    expect(() => SavedSearchSchema.parse({ ...validSavedSearch, maxPriceCents: 300.5 })).toThrow();
  });

  // CONCERN: SavedSearchSchema.query is `z.string()` with no minimum length, so an
  // empty query currently parses successfully. This pins the schema's actual
  // behaviour as written in src/dto/activity.ts rather than the (unverified)
  // assumption that empty queries are rejected — flagged to the coordinator
  // as a possible gap rather than changed silently.
  it("currently accepts an empty query (not rejected — flagged as a possible gap)", () => {
    expect(SavedSearchSchema.parse({ ...validSavedSearch, query: "" }).query).toBe("");
  });
});

describe("FavoriteSchema", () => {
  const validFavorite = {
    id: "f1", kind: "product" as const, itemId: "aro", name: "Aro Task Chair",
    image: "chair", priceCents: 24800, rating: 4.6, meta: "Mesh back",
  };

  it("accepts a complete valid favorite", () => {
    expect(FavoriteSchema.parse(validFavorite).itemId).toBe("aro");
  });

  it("rejects an unknown favorite kind", () => {
    expect(() => FavoriteSchema.parse({ ...validFavorite, kind: "merchant" })).toThrow();
  });

  it("rejects an empty image key", () => {
    expect(() => FavoriteSchema.parse({ ...validFavorite, image: "" })).toThrow();
  });
});
