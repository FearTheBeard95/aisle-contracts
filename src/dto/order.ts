import { z } from "zod";
import { CartLineSchema } from "./cart.js";
import { CentsSchema, IdSchema, IsoDateSchema } from "./common.js";

export const OrderStageSchema = z.enum(["placed", "packed", "in_transit", "delivered"]);
export type OrderStage = z.infer<typeof OrderStageSchema>;

export const OrderStepSchema = z.object({
  stage: OrderStageSchema,
  reached: z.boolean(),
  at: IsoDateSchema.nullable(),
});
export type OrderStep = z.infer<typeof OrderStepSchema>;

export const OrderSchema = z.object({
  id: IdSchema,
  reference: z.string().regex(/^AO-\d{4,}$/),
  lines: z.array(CartLineSchema),
  subtotalCents: CentsSchema,
  shippingCents: CentsSchema,
  totalCents: CentsSchema,
  stage: OrderStageSchema,
  steps: z.array(OrderStepSchema),
  placedAt: IsoDateSchema,
  deliverToName: z.string(),
  deliverToLine: z.string(),
  deliverToCity: z.string(),
  cardBrand: z.string(),
  cardLast4: z.string(),
});
export type OrderDto = z.infer<typeof OrderSchema>;
