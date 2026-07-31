import { z } from "zod";
import { CentsSchema, IdSchema, ImageKeySchema, IsoDateSchema } from "./common.js";

export const ApprovalStatusSchema = z.enum(["pending", "approved", "suspended"]);
export type ApprovalStatus = z.infer<typeof ApprovalStatusSchema>;

export const MerchantSchema = z.object({
  id: IdSchema,
  name: z.string(),
  legal: z.string(),
  category: z.string(),
  phone: z.string(),
  email: z.string(),
  addrLine: z.string(),
  addrCity: z.string(),
  description: z.string(),
  matchPhrases: z.array(z.string()),
  storefrontLive: z.boolean(),
  approvalStatus: ApprovalStatusSchema,
  offerType: z.enum(["services", "products", "both"]).default("services"),
});
export type MerchantDto = z.infer<typeof MerchantSchema>;

export const StaffSchema = z.object({
  id: IdSchema,
  name: z.string(),
  role: z.string(),
  station: z.string(),
  bookable: z.boolean(),
});
export type StaffDto = z.infer<typeof StaffSchema>;

export const MerchantServiceSchema = z.object({
  id: IdSchema,
  name: z.string(),
  description: z.string(),
  durationMinutes: z.number().int().positive(),
  priceCents: CentsSchema,
  bookable: z.boolean(),
  /** True when a plan downgrade switched this off — different copy, different remedy. */
  planSuspended: z.boolean().default(false),
});
export type MerchantServiceDto = z.infer<typeof MerchantServiceSchema>;

export const MerchantProductSchema = z.object({
  id: IdSchema,
  name: z.string(),
  sku: z.string(),
  priceCents: CentsSchema,
  stock: z.number().int().nonnegative(),
  listed: z.boolean(),
  image: ImageKeySchema,
  /** True when a plan downgrade switched this off — different copy, different remedy. */
  planSuspended: z.boolean().default(false),
});
export type MerchantProductDto = z.infer<typeof MerchantProductSchema>;

export const DemandRowSchema = z.object({
  id: IdSchema,
  query: z.string(),
  askCount: z.number().int().nonnegative(),
  matched: z.boolean(),
  reason: z.string().optional(),
  remedy: z.enum(["add_service", "add_phrase", "open_hours"]).optional(),
});
export type DemandRowDto = z.infer<typeof DemandRowSchema>;

export const PayoutLedgerEntrySchema = z.object({
  id: IdSchema,
  paidAt: IsoDateSchema,
  amountCents: CentsSchema,
  status: z.enum(["paid", "in_transit"]),
});
export type PayoutLedgerEntryDto = z.infer<typeof PayoutLedgerEntrySchema>;

export const PayoutSummarySchema = z.object({
  bank: z.string(),
  schedule: z.enum(["daily", "weekly", "monthly"]),
  nextPayoutCents: CentsSchema,
  nextPayoutAt: IsoDateSchema.nullable(),
  feeBps: z.number().int().nonnegative(),
  feeFixedCents: CentsSchema,
  ledger: z.array(PayoutLedgerEntrySchema),
});
export type PayoutSummaryDto = z.infer<typeof PayoutSummarySchema>;

/** A row of the Overview "today" rail. */
export const OverviewTodayRowSchema = z.object({
  id: IdSchema,
  time: IsoDateSchema,
  reference: z.string(),
  who: z.string(),
  what: z.string(),
  status: z.string(),
  amountCents: CentsSchema,
});
export type OverviewTodayRowDto = z.infer<typeof OverviewTodayRowSchema>;

/** Comparison against the same weekday last week; null when there is no baseline. */
export const StatDeltaSchema = z.object({
  pct: z.number().nullable(),
  label: z.string(),
});
export type StatDeltaDto = z.infer<typeof StatDeltaSchema>;

/** A category's suggested service, offered at onboarding step 2. */
export const SeedServiceSchema = z.object({
  key: z.string().min(1),
  name: z.string(),
  priceCents: CentsSchema,
  durationMinutes: z.number().int().positive(),
});
export type SeedServiceDto = z.infer<typeof SeedServiceSchema>;
