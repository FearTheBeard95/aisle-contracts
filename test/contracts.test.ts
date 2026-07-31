import { describe, it, expect } from "vitest";
import {
  CONTRACTS_VERSION, MerchantServiceSchema, PayoutSummarySchema, SeedServiceSchema,
  OverviewTodayRowSchema,
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
    expect(CONTRACTS_VERSION).toBe("0.2.2");
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
