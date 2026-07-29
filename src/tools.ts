import { z } from "zod";
import { ProductCardSchema, ServiceCardSchema } from "./dto/catalog.js";
import { AvailabilitySlotSchema } from "./dto/availability.js";
import { BookingSchema, CreateBookingSchema } from "./dto/booking.js";
import { CartSchema } from "./dto/cart.js";
import { OrderSchema } from "./dto/order.js";
import { CentsSchema, IdSchema } from "./dto/common.js";

export const TOOL_NAMES = [
  "searchProducts", "searchServices", "getAvailability",
  "addToCart", "createOrder", "createBooking", "compareItems", "saveSearch",
] as const;
export type ToolName = (typeof TOOL_NAMES)[number];

export const RecoverySchema = z.object({
  failedConstraint: z.enum(["maxPrice", "distance", "date", "rating", "noMatch"]),
  closestPriceCents: CentsSchema.optional(),
  chips: z.array(z.string()).min(1),
}).superRefine((val, ctx) => {
  if (val.failedConstraint === "maxPrice" && val.closestPriceCents === undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "A maxPrice recovery must name the closest available price (CUS-C-08)",
      path: ["closestPriceCents"],
    });
  }
});
export type Recovery = z.infer<typeof RecoverySchema>;

/** CUS-C-08: an empty result set must carry a recovery path. */
const withRecovery = <T extends z.ZodTypeAny>(item: T) =>
  z.object({
    summary: z.string().min(1),
    items: z.array(item),
    chips: z.array(z.string()).default([]),
    recovery: RecoverySchema.optional(),
  }).superRefine((val, ctx) => {
    if (val.items.length === 0 && !val.recovery) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Empty result sets must include a recovery payload (CUS-C-08)",
        path: ["recovery"],
      });
    }
  });

export const SearchProductsInputSchema = z.object({
  query: z.string().min(1),
  maxPriceCents: CentsSchema.optional(),
  minRating: z.number().min(0).max(5).optional(),
  category: z.string().optional(),
});
export const SearchProductsResultSchema = withRecovery(ProductCardSchema);

export const SearchServicesInputSchema = z.object({
  query: z.string().min(1),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  maxDistanceMiles: z.number().positive().optional(),
  minRating: z.number().min(0).max(5).optional(),
});
export const SearchServicesResultSchema = withRecovery(ServiceCardSchema);

export const GetAvailabilityInputSchema = z.object({
  merchantId: IdSchema,
  date: z.string().datetime(),
});
export const GetAvailabilityResultSchema = z.object({
  merchantId: IdSchema,
  dayLabel: z.string(),
  slots: z.array(AvailabilitySlotSchema),
});

export const AddToCartToolInputSchema = z.object({
  productId: IdSchema,
  variant: z.string().default("Graphite"),
  qty: z.number().int().positive().default(1),
});
export const AddToCartToolResultSchema = z.object({
  cart: CartSchema,
  badgeCount: z.number().int().nonnegative(),
});

export const CreateOrderInputSchema = z.object({});
export const CreateOrderResultSchema = z.object({ order: OrderSchema });

export const CreateBookingToolInputSchema = CreateBookingSchema;
export const CreateBookingToolResultSchema = z.object({
  booking: BookingSchema,
  holdExpiresAt: z.string().datetime(),
});

export const CompareItemsInputSchema = z.object({
  itemIds: z.array(IdSchema).min(2).max(3),
});
export const CompareItemsResultSchema = z.object({
  columns: z.array(ProductCardSchema).min(2).max(3),
  attributes: z.array(z.object({ label: z.string(), values: z.array(z.string()) })),
});

export const SaveSearchInputSchema = z.object({
  query: z.string().min(1),
  maxPriceCents: CentsSchema.optional(),
});
export const SaveSearchResultSchema = z.object({
  savedSearchId: IdSchema,
  message: z.string(),
});
