import { z } from "zod";
import { CentsSchema, IdSchema, ImageKeySchema } from "./common.js";

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
