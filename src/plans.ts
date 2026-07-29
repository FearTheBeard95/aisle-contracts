export type PlanId = "counter" | "aisle" | "frontage";
export type Capability = "products" | "insights" | "phrases" | "slotGrid" | "api";
export type QuantityLimit = "bookingsPerMonth" | "services" | "team" | "locations";

export type Plan = {
  id: PlanId;
  name: string;
  pitch: string;
  monthlyCents: number;
  annualCents: number;
  /** Transaction fee in basis points: 400 = 4%. */
  feeBps: number;
  limits: Record<QuantityLimit, number>;
  capabilities: Record<Capability, boolean>;
};

export const PLAN_ORDER: PlanId[] = ["counter", "aisle", "frontage"];

export const PLANS: Record<PlanId, Plan> = {
  counter: {
    id: "counter",
    name: "Counter",
    pitch: "Get listed and take your first bookings.",
    monthlyCents: 0,
    annualCents: 0,
    feeBps: 400,
    limits: { bookingsPerMonth: 20, services: 5, team: 1, locations: 1 },
    capabilities: { products: false, insights: false, phrases: false, slotGrid: false, api: false },
  },
  aisle: {
    id: "aisle",
    name: "Aisle",
    pitch: "The agent working properly on your behalf.",
    monthlyCents: 4900,
    annualCents: 49000,
    feeBps: 200,
    limits: { bookingsPerMonth: Infinity, services: Infinity, team: 6, locations: 1 },
    capabilities: { products: true, insights: true, phrases: true, slotGrid: true, api: false },
  },
  frontage: {
    id: "frontage",
    name: "Frontage",
    pitch: "Multi-site, staff calendars and API access.",
    monthlyCents: 14900,
    annualCents: 149000,
    feeBps: 150,
    limits: {
      bookingsPerMonth: Infinity, services: Infinity, team: Infinity, locations: Infinity,
    },
    capabilities: { products: true, insights: true, phrases: true, slotGrid: true, api: true },
  },
};

export function planAllows(plan: PlanId, capability: Capability): boolean {
  return PLANS[plan].capabilities[capability];
}

export function planLimit(plan: PlanId, limit: QuantityLimit): number {
  return PLANS[plan].limits[limit];
}

/** The cheapest plan that unlocks the capability. */
export function requiredPlanFor(capability: Capability): PlanId {
  const found = PLAN_ORDER.find((id) => PLANS[id].capabilities[capability]);
  if (!found) throw new Error(`No plan grants ${capability}`);
  return found;
}

export function isUpgrade(from: PlanId, to: PlanId): boolean {
  return PLAN_ORDER.indexOf(to) > PLAN_ORDER.indexOf(from);
}

/** PRD SUB-06: warn the merchant at this fraction of the booking cap. */
export const BOOKING_CAP_WARN_AT = 0.75;
/** PRD SUB-02: usage meters turn accent at this fraction of any cap. */
export const USAGE_METER_ACCENT_AT = 0.9;
