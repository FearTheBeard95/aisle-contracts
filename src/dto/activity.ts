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
  /**
   * Whether the underlying product/merchant is currently visible to
   * customers. A favorite can point at an item whose merchant was later
   * suspended, or a product that was delisted — the API keeps the favorite
   * row (so it doesn't silently vanish from the list) but must not surface
   * the hidden item's live details, replacing them with a neutral
   * placeholder instead. `available` is how the client tells that
   * placeholder apart from a genuinely cheap, unrated item, instead of
   * string-matching the placeholder text (which breaks under localisation
   * or a reword). Defaults to `true` so existing callers/fixtures that don't
   * set it explicitly still validate.
   */
  available: z.boolean().default(true),
});
export type FavoriteDto = z.infer<typeof FavoriteSchema>;
