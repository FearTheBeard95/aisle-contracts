import { z } from "zod";
import { AddOnSchema } from "./catalog.js";
import { CentsSchema, IdSchema, ImageKeySchema, IsoDateSchema } from "./common.js";

export const BookingStatusSchema = z.enum([
  "pending", "confirmed", "declined", "cancelled", "expired", "done",
]);
export type BookingStatus = z.infer<typeof BookingStatusSchema>;

export const RepeatSchema = z.enum(["once", "fortnightly", "monthly"]);
export type Repeat = z.infer<typeof RepeatSchema>;

export const BookingSchema = z.object({
  id: IdSchema,
  reference: z.string().regex(/^AI-\d{4,}$/),
  merchantId: IdSchema,
  merchantName: z.string(),
  merchantImage: ImageKeySchema,
  addressLine: z.string(),
  addressCity: z.string(),
  distanceMiles: z.number().nonnegative(),
  serviceId: IdSchema,
  serviceName: z.string(),
  addOns: z.array(AddOnSchema),
  repeat: RepeatSchema,
  slotStartsAt: IsoDateSchema,
  slotLabel: z.string(),
  dayLabel: z.string(),
  status: BookingStatusSchema,
  holdExpiresAt: IsoDateSchema.nullable(),
  totalCents: CentsSchema,
});
export type BookingDto = z.infer<typeof BookingSchema>;

export const CreateBookingSchema = z.object({
  merchantId: IdSchema,
  serviceId: IdSchema,
  slotId: IdSchema,
  addOnKeys: z.array(z.string()).default([]),
  repeat: RepeatSchema.default("once"),
  /** Set when rescheduling: the booking this one replaces. */
  replacesBookingId: IdSchema.optional(),
});
export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;
