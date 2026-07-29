import { z } from "zod";
import { CentsSchema, IdSchema, ImageKeySchema, IsoDateSchema } from "./common.js";

export const NotificationSchema = z.object({
  id: IdSchema,
  kind: z.enum(["Order", "Booking", "Alert"]),
  title: z.string(),
  sub: z.string(),
  when: z.string(),
  createdAt: IsoDateSchema,
  read: z.boolean(),
});
export type NotificationDto = z.infer<typeof NotificationSchema>;

export const SavedSearchSchema = z.object({
  id: IdSchema,
  query: z.string().min(1),
  maxPriceCents: CentsSchema.nullable(),
  active: z.boolean(),
  createdAt: IsoDateSchema,
});
export type SavedSearchDto = z.infer<typeof SavedSearchSchema>;

export const FavoriteSchema = z.object({
  id: IdSchema,
  kind: z.enum(["product", "service"]),
  itemId: IdSchema,
  name: z.string(),
  image: ImageKeySchema,
  priceCents: CentsSchema,
  rating: z.number(),
  meta: z.string(),
});
export type FavoriteDto = z.infer<typeof FavoriteSchema>;
