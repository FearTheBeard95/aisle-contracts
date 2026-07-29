import { z } from "zod";
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
