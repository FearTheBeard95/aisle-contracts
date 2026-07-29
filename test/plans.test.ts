import { describe, it, expect } from "vitest";
import {
  PLANS, PLAN_ORDER, planAllows, planLimit, requiredPlanFor, isUpgrade,
} from "../src/plans.js";

describe("plan matrix", () => {
  it("prices the three plans per PRD §6a", () => {
    expect(PLANS.counter.monthlyCents).toBe(0);
    expect(PLANS.counter.annualCents).toBe(0);
    expect(PLANS.aisle.monthlyCents).toBe(4900);
    expect(PLANS.aisle.annualCents).toBe(49000);
    expect(PLANS.frontage.monthlyCents).toBe(14900);
    expect(PLANS.frontage.annualCents).toBe(149000);
  });

  it("sets transaction fees in basis points", () => {
    expect(PLANS.counter.feeBps).toBe(400);
    expect(PLANS.aisle.feeBps).toBe(200);
    expect(PLANS.frontage.feeBps).toBe(150);
  });

  it("caps quantities per plan", () => {
    expect(planLimit("counter", "bookingsPerMonth")).toBe(20);
    expect(planLimit("counter", "services")).toBe(5);
    expect(planLimit("counter", "team")).toBe(1);
    expect(planLimit("aisle", "bookingsPerMonth")).toBe(Infinity);
    expect(planLimit("aisle", "team")).toBe(6);
    expect(planLimit("frontage", "team")).toBe(Infinity);
    expect(planLimit("counter", "locations")).toBe(1);
    expect(planLimit("frontage", "locations")).toBe(Infinity);
  });

  it("gates capabilities per plan", () => {
    expect(planAllows("counter", "products")).toBe(false);
    expect(planAllows("counter", "insights")).toBe(false);
    expect(planAllows("counter", "phrases")).toBe(false);
    expect(planAllows("counter", "slotGrid")).toBe(false);
    expect(planAllows("aisle", "products")).toBe(true);
    expect(planAllows("aisle", "slotGrid")).toBe(true);
    expect(planAllows("aisle", "api")).toBe(false);
    expect(planAllows("frontage", "api")).toBe(true);
  });

  it("names the cheapest plan that unlocks a capability", () => {
    expect(requiredPlanFor("products")).toBe("aisle");
    expect(requiredPlanFor("insights")).toBe("aisle");
    expect(requiredPlanFor("api")).toBe("frontage");
  });

  it("orders plans and detects upgrades", () => {
    expect(PLAN_ORDER).toEqual(["counter", "aisle", "frontage"]);
    expect(isUpgrade("counter", "aisle")).toBe(true);
    expect(isUpgrade("frontage", "aisle")).toBe(false);
    expect(isUpgrade("aisle", "aisle")).toBe(false);
  });
});
