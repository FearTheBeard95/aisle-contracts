import { z } from "zod";
import { CentsSchema, IdSchema, ImageKeySchema } from "./common.js";

export const CartLineSchema = z.object({
  id: IdSchema,
  productId: IdSchema,
  name: z.string(),
  variant: z.string(),
  qty: z.number().int().positive(),
  unitPriceCents: CentsSchema,
  lineTotalCents: CentsSchema,
  image: ImageKeySchema,
});
export type CartLine = z.infer<typeof CartLineSchema>;

export const CartSchema = z.object({
  lines: z.array(CartLineSchema),
  subtotalCents: CentsSchema,
  shippingCents: CentsSchema,
  totalCents: CentsSchema,
});
export type CartDto = z.infer<typeof CartSchema>;

export const AddToCartSchema = z.object({
  productId: IdSchema,
  variant: z.string().default("Graphite"),
  qty: z.number().int().positive().default(1),
});
export type AddToCartInput = z.infer<typeof AddToCartSchema>;
