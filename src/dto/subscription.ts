import { z } from "zod";
import type { QuantityLimit } from "../plans.js";
import { CentsSchema, IdSchema, IsoDateSchema } from "./common.js";

export const BillingCycleSchema = z.enum(["monthly", "annual"]);
export type BillingCycle = z.infer<typeof BillingCycleSchema>;

export const UsageSchema = z.object({
  bookingsThisPeriod: z.number().int().nonnegative(),
  services: z.number().int().nonnegative(),
  team: z.number().int().nonnegative(),
});
export type UsageDto = z.infer<typeof UsageSchema>;

export const InvoiceSchema = z.object({
  id: IdSchema,
  number: z.string(),
  amountCents: CentsSchema,
  issuedAt: IsoDateSchema,
  status: z.enum(["paid", "due"]),
});
export type InvoiceDto = z.infer<typeof InvoiceSchema>;

export const SubscriptionSchema = z.object({
  plan: z.enum(["counter", "aisle", "frontage"]),
  cycle: BillingCycleSchema,
  periodStart: IsoDateSchema,
  periodEnd: IsoDateSchema,
  usage: UsageSchema,
  pendingPlan: z.enum(["counter", "aisle", "frontage"]).nullable(),
  cardBrand: z.string(),
  cardLast4: z.string(),
  invoices: z.array(InvoiceSchema),
});
export type SubscriptionDto = z.infer<typeof SubscriptionSchema>;

/** The wire form of `QuantityLimit`; kept in lockstep with plans.ts below. */
export const QuantityLimitSchema = z.enum([
  "bookingsPerMonth",
  "services",
  "team",
  "locations",
]);

/**
 * Compile-time proof that the enum above and `QuantityLimit` in plans.ts are
 * the same set. Adding a limit to one without the other stops building here
 * rather than silently shipping a schema that rejects a real payload.
 */
type _QuantityLimitsAgree =
  z.infer<typeof QuantityLimitSchema> extends QuantityLimit
    ? QuantityLimit extends z.infer<typeof QuantityLimitSchema>
      ? true
      : never
    : never;
const _quantityLimitsAgree: _QuantityLimitsAgree = true;
void _quantityLimitsAgree;

/**
 * One plan quantity limit as it goes over the wire, with the usage to render
 * against it.
 *
 * `cap` IS `number | null` AND `unlimited` IS THE THING TO BRANCH ON. The plan
 * matrix (`PLANS`) uses `Infinity` for "unlimited", and `JSON.stringify`
 * turns `Infinity` into `null` — no error, nothing logged. A client testing
 * `used >= cap` against that `null` gets `true` (`12 >= null` is `true` in
 * JavaScript), so an unlimited plan reads as exactly at its limit: the
 * opposite of the truth. So the server maps `Infinity` to
 * `{ cap: null, unlimited: true }` before serialising, and clients read
 * `unlimited` rather than inferring anything from `cap`.
 */
export const EntitlementSchema = z.object({
  limit: QuantityLimitSchema,
  used: z.number().int().nonnegative(),
  /** Finite cap, or null when the plan is unlimited for this limit. */
  cap: z.number().int().nonnegative().nullable(),
  unlimited: z.boolean(),
});
export type EntitlementDto = z.infer<typeof EntitlementSchema>;

/** What a pending downgrade will take off the shelf when it lands (SUB-03). */
export const PlanChangeEffectSchema = z.object({
  servicesSuspended: z.number().int().nonnegative(),
  productsSuspended: z.number().int().nonnegative(),
});
export type PlanChangeEffectDto = z.infer<typeof PlanChangeEffectSchema>;

/**
 * The full body of `GET /merchant/subscription`.
 *
 * A SEPARATE SCHEMA RATHER THAN FOUR MORE FIELDS ON `SubscriptionSchema`,
 * deliberately. `SubscriptionDto` is also the shape the plan- and
 * cycle-change endpoints nest under `subscription`, and those payloads carry
 * none of these four. Widening `SubscriptionSchema` would make every one of
 * those responses fail its own schema — and would force the service layer's
 * `getSubscription` (which computes none of them) to fabricate values.
 *
 * The four fields are all REQUIRED, not defaulted: the billing tab renders
 * every one of them, the server always sends them, and a `.default(...)` here
 * would be optional on input yet still required on `z.infer` — so a consumer
 * gains nothing and a truncated payload would silently parse as "no
 * entitlements, 0 bps, no placement promise". `pendingPlanEffect` is
 * `.nullable()` instead: null is the real, common answer (nothing scheduled),
 * and one thing to branch on beats a missing key.
 */
export const SubscriptionResponseSchema = SubscriptionSchema.extend({
  entitlements: z.array(EntitlementSchema),
  /** Transaction fee of the active plan in basis points: 400 = 4%. */
  feeBps: z.number().int().nonnegative(),
  /** SUB-07's sentence verbatim. Rendered as-is; never paraphrased client-side. */
  noPaidPlacement: z.string(),
  /** Null unless a downgrade is scheduled for cycle end. */
  pendingPlanEffect: PlanChangeEffectSchema.nullable(),
});
export type SubscriptionResponseDto = z.infer<typeof SubscriptionResponseSchema>;
