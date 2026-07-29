import { z } from "zod";
import { CentsSchema, IdSchema, ImageKeySchema, IsoDateSchema, RatingSchema } from "./common.js";

export const SlotSchema = z.object({
  id: IdSchema,
  startsAt: IsoDateSchema,
  /** Display label exactly as the prototypes render it, e.g. "1:30". */
  label: z.string(),
});
export type SlotDto = z.infer<typeof SlotSchema>;

export const ProductCardSchema = z.object({
  id: IdSchema,
  merchantId: IdSchema,
  name: z.string(),
  kicker: z.string().optional(),
  priceCents: CentsSchema,
  rating: RatingSchema,
  meta: z.string().optional(),
  image: ImageKeySchema,
  category: z.string().optional(),
  material: z.string().optional(),
  reviewCount: z.number().int().nonnegative().default(0),
});
export type ProductCard = z.infer<typeof ProductCardSchema>;

export const ProductDetailSchema = ProductCardSchema.extend({
  description: z.string(),
  variants: z.array(z.string()),
  freeReturns: z.boolean().default(true),
  stock: z.number().int().nonnegative(),
});
export type ProductDetail = z.infer<typeof ProductDetailSchema>;

export const ServiceCardSchema = z.object({
  id: IdSchema,
  merchantId: IdSchema,
  name: z.string(),
  rating: RatingSchema,
  reviewCount: z.number().int().nonnegative(),
  distanceMiles: z.number().nonnegative(),
  fromPriceCents: CentsSchema,
  image: z.string(),
  slots: z.array(SlotSchema),
});
export type ServiceCard = z.infer<typeof ServiceCardSchema>;

export const ServiceOptionSchema = z.object({
  id: IdSchema,
  name: z.string(),
  description: z.string(),
  durationMinutes: z.number().int().positive(),
  priceCents: CentsSchema,
});
export type ServiceOption = z.infer<typeof ServiceOptionSchema>;

export const AddOnSchema = z.object({
  key: z.string(),
  name: z.string(),
  priceCents: CentsSchema,
});
export type AddOn = z.infer<typeof AddOnSchema>;

export const ProviderDetailSchema = ServiceCardSchema.extend({
  description: z.string(),
  services: z.array(ServiceOptionSchema),
  addOns: z.array(AddOnSchema),
});
export type ProviderDetail = z.infer<typeof ProviderDetailSchema>;

export const ReviewSchema = z.object({
  id: IdSchema,
  author: z.string(),
  stars: z.number().int().min(1).max(5),
  when: z.string(),
  body: z.string(),
});
export type ReviewDto = z.infer<typeof ReviewSchema>;
