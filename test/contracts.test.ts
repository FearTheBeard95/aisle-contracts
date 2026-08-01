import { describe, it, expect } from "vitest";
import {
  CONTRACTS_VERSION, MerchantServiceSchema, PayoutSummarySchema, SeedServiceSchema,
  OverviewTodayRowSchema, MerchantSchema, EntitlementSchema, SubscriptionSchema,
  SubscriptionResponseSchema, BookingSchema, MerchantBookingSchema, type BookingDto,
} from "../src/index.js";

describe("contracts v0.2.0", () => {
  it("marks a plan-suspended service distinctly from a merchant-switched-off one", () => {
    const row = MerchantServiceSchema.parse({
      id: "svc_1", name: "Cut", description: "A classic cut", durationMinutes: 45,
      priceCents: 4500, bookable: false, planSuspended: true,
    });
    expect(row.planSuspended).toBe(true);
  });

  it("carries a payout summary with next payout, fee and a ledger", () => {
    const s = PayoutSummarySchema.parse({
      bank: "Chase ···· 8891", schedule: "weekly",
      nextPayoutCents: 128450, nextPayoutAt: "2026-07-27T00:00:00.000Z",
      feeBps: 240, feeFixedCents: 30,
      ledger: [{ id: "po_1", paidAt: "2026-07-20T00:00:00.000Z", amountCents: 98200, status: "paid" }],
    });
    expect(s.ledger[0]!.amountCents).toBe(98200);
  });

  it("describes a seed service for onboarding step 2", () => {
    expect(SeedServiceSchema.parse({
      key: "cut", name: "Cut", description: "A classic cut",
      priceCents: 4500, durationMinutes: 45,
    }).key).toBe("cut");
  });

});

describe("contracts v0.2.1", () => {
  it("represents an open slot on the Overview today rail with a null reference and amount", () => {
    const row = OverviewTodayRowSchema.parse({
      id: "row_1", startsAt: "2026-07-31T17:30:00.000Z", kind: "open_slot",
      who: "Open", what: "Bookable", status: "open", reference: null, amountCents: null,
    });
    expect(row.reference).toBeNull();
    expect(row.amountCents).toBeNull();
  });

  it("distinguishes a zero-amount row from a no-amount row", () => {
    const zero = OverviewTodayRowSchema.parse({
      id: "row_2", startsAt: "2026-07-31T18:00:00.000Z", kind: "order",
      who: "J. Alvarez", what: "Comp'd order", status: "delivered",
      reference: "ord_1", amountCents: 0,
    });
    const none = OverviewTodayRowSchema.parse({
      id: "row_3", startsAt: "2026-07-31T18:30:00.000Z", kind: "open_slot",
      who: "Open", what: "Bookable", status: "open", reference: null, amountCents: null,
    });
    expect(zero.amountCents).toBe(0);
    expect(none.amountCents).toBeNull();
    expect(zero.amountCents).not.toBeNull();
  });

  it("pins its own version", () => {
    expect(CONTRACTS_VERSION).toBe("0.2.4");
  });
});

describe("contracts v0.2.2", () => {
  /**
   * The wizard's step-2 row renders `duration · description`, so a seed with no
   * description cannot be rendered at all. The field was missing from v0.2.1.
   */
  it("requires a seed service to carry the description the step-2 row renders", () => {
    expect(SeedServiceSchema.safeParse({
      key: "cut", name: "Haircut", priceCents: 3500, durationMinutes: 30,
    }).success).toBe(false);

    const seed = SeedServiceSchema.parse({
      key: "cut", name: "Haircut", description: "Clipper or scissor cut, wash included",
      priceCents: 3500, durationMinutes: 30,
    });
    expect(seed.description).toBe("Clipper or scissor cut, wash included");
  });
});

describe("contracts v0.2.3", () => {
  const merchant = {
    id: "m_1", name: "Bloom", legal: "Bloom LLC", category: "Salon",
    phone: "+15550100", email: "hi@bloom.test",
    addrLine: "1 Main St", addrCity: "Austin",
    description: "A salon", matchPhrases: ["haircut"],
    storefrontLive: false, approvalStatus: "approved" as const,
    offerType: "services" as const, onboardingComplete: false,
  };

  const subscription = {
    plan: "aisle" as const, cycle: "monthly" as const,
    periodStart: "2026-08-01T00:00:00.000Z", periodEnd: "2026-09-01T00:00:00.000Z",
    usage: { bookingsThisPeriod: 3, services: 2, team: 1 },
    pendingPlan: null, cardBrand: "Visa", cardLast4: "4242", invoices: [],
  };

  /**
   * The console has to route a merchant who never finished the wizard back
   * into it. Without this field the only readings available were "storefront
   * is not live" (also true of a finished merchant who paused) and "there are
   * no services" (also true of a products-only merchant).
   */
  it("tells a client whether onboarding is finished", () => {
    expect(MerchantSchema.parse(merchant).onboardingComplete).toBe(false);
    expect(MerchantSchema.parse({ ...merchant, onboardingComplete: true }).onboardingComplete)
      .toBe(true);
  });

  it("requires onboardingComplete rather than defaulting it to false", () => {
    const { onboardingComplete: _omitted, ...withoutIt } = merchant;
    expect(MerchantSchema.safeParse(withoutIt).success).toBe(false);
  });

  it("represents an unlimited entitlement as a null cap plus unlimited: true", () => {
    const unlimited = EntitlementSchema.parse({
      limit: "services", used: 12, cap: null, unlimited: true,
    });
    expect(unlimited.cap).toBeNull();
    expect(unlimited.unlimited).toBe(true);

    const capped = EntitlementSchema.parse({
      limit: "team", used: 1, cap: 6, unlimited: false,
    });
    expect(capped.cap).toBe(6);
    expect(capped.unlimited).toBe(false);
  });

  it("rejects an entitlement for a limit the plan matrix does not have", () => {
    expect(EntitlementSchema.safeParse({
      limit: "storefronts", used: 0, cap: 1, unlimited: false,
    }).success).toBe(false);
  });

  it("parses the full GET /merchant/subscription body, entitlements and all", () => {
    const body = SubscriptionResponseSchema.parse({
      ...subscription,
      entitlements: [
        { limit: "bookingsPerMonth", used: 3, cap: null, unlimited: true },
        { limit: "services", used: 2, cap: null, unlimited: true },
        { limit: "team", used: 1, cap: 6, unlimited: false },
        { limit: "locations", used: 1, cap: 1, unlimited: false },
      ],
      feeBps: 200,
      noPaidPlacement: "Placement is never for sale — …",
      pendingPlanEffect: null,
    });
    expect(body.feeBps).toBe(200);
    expect(body.entitlements[0]!.unlimited).toBe(true);
    expect(body.pendingPlanEffect).toBeNull();
    // The nested subscription half is unchanged, so the plan-change endpoints
    // that carry a bare SubscriptionDto still validate against it.
    expect(SubscriptionSchema.parse(subscription).plan).toBe("aisle");
  });

  it("carries what a pending downgrade will suspend", () => {
    const body = SubscriptionResponseSchema.parse({
      ...subscription,
      pendingPlan: "counter",
      entitlements: [],
      feeBps: 200,
      noPaidPlacement: "…",
      pendingPlanEffect: { servicesSuspended: 3, productsSuspended: 7 },
    });
    expect(body.pendingPlanEffect).toEqual({ servicesSuspended: 3, productsSuspended: 7 });
  });

  /** Older consumers parse the narrower schema; extra keys are stripped, not fatal. */
  it("stays parseable by the unextended SubscriptionSchema", () => {
    const parsed = SubscriptionSchema.parse({
      ...subscription, entitlements: [], feeBps: 200,
      noPaidPlacement: "…", pendingPlanEffect: null,
    });
    expect(parsed.plan).toBe("aisle");
  });
});

describe("MerchantBookingSchema (v0.2.4)", () => {
  const booking = {
    id: "bk_1", reference: "AI-4820",
    merchantId: "mer_1", merchantName: "Fade Room", merchantImage: "shop",
    addressLine: "12 Bold St", addressCity: "Liverpool", distanceMiles: 0,
    serviceId: "svc_1", serviceName: "Cut + Beard",
    addOns: [], repeat: "once" as const,
    slotStartsAt: "2026-08-01T13:30:00.000Z", slotLabel: "1:30",
    dayLabel: "Sat, Aug 1", status: "pending" as const,
    holdExpiresAt: null, totalCents: 5000,
  };

  it("names the customer on the merchant's queue", () => {
    const row = MerchantBookingSchema.parse({
      ...booking, customerId: "cus_1", customerName: "Ada Okafor",
    });
    expect(row.customerName).toBe("Ada Okafor");
    expect(row.customerId).toBe("cus_1");
  });

  it("requires the customer fields — a bare BookingDto is not a merchant row", () => {
    expect(MerchantBookingSchema.safeParse(booking).success).toBe(false);
  });

  /**
   * The whole point of the split: the customer-facing schema did not learn
   * about customers. Parsing a merchant row through it strips them.
   */
  it("leaves BookingSchema with no customer identity on it", () => {
    expect(Object.keys(BookingSchema.shape)).not.toContain("customerName");
    expect(Object.keys(BookingSchema.shape)).not.toContain("customerId");
    const stripped = BookingSchema.parse({
      ...booking, customerId: "cus_1", customerName: "Ada Okafor",
    }) as Record<string, unknown>;
    expect(stripped.customerName).toBeUndefined();
    expect(stripped.customerId).toBeUndefined();
  });

  it("stays assignable to BookingDto, so a row replaced in place still validates", () => {
    const row = MerchantBookingSchema.parse({
      ...booking, status: "confirmed", customerId: "cus_1", customerName: "Ada Okafor",
    });
    const asBooking: BookingDto = row;
    expect(BookingSchema.safeParse(asBooking).success).toBe(true);
  });
});
