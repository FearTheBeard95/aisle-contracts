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

/**
 * What the merchant console's Bookings queue (MER-03) reads, and what every
 * `/merchant/bookings*` route returns.
 *
 * A SEPARATE SCHEMA RATHER THAN TWO MORE FIELDS ON `BookingSchema`,
 * deliberately — the same reasoning as `SubscriptionResponseSchema` extending
 * `SubscriptionSchema`, but here the reason is disclosure, not just shape.
 * `BookingSchema` is what `POST /bookings`, `GET /bookings` and
 * `POST /bookings/:id/cancel` hand to a *customer*. Widening it so the
 * merchant queue could name its customer would put a name on the customer
 * routes too, and the only name available there is the recipient's own — or,
 * the day a booking is ever read by anyone but its owner, somebody else's.
 * The customer-facing shape stays exactly as narrow as it is.
 *
 * `.extend()` rather than `.omit().extend()`: `MerchantBookingDto` is
 * therefore assignable to `BookingDto`, so the console's existing row
 * rendering keeps working and the three action routes (which replace a row in
 * place with their response) return something the list can hold.
 *
 * `merchantName`, `merchantImage`, `addressLine`, `addressCity` and
 * `distanceMiles` are inherited and KEPT even though they say little on a
 * merchant's own queue — they describe the merchant reading the screen, and
 * `distanceMiles` is a distance from the merchant to themselves. They are
 * retained for that assignability, not because the queue renders them; a
 * client should ignore them here.
 *
 * WHAT IS ADDED, AND ONLY THIS. Customer data flows into this shape, so each
 * field is a deliberate disclosure to a merchant:
 *
 *  - `customerName` — the queue exists so a merchant can decide whether to
 *    accept, and "accept whom?" is unanswerable without it. Derived exactly
 *    as the overview rail's `who` is (the customer's account name, falling
 *    back to `"Customer"`), so the two screens cannot disagree about what one
 *    person is called.
 *  - `customerId` — opaque; it identifies nobody on its own. It is what lets
 *    the console recognise two rows as the same person without string-matching
 *    names, and it is already the merchant's own booking row's foreign key.
 *
 * DELIBERATELY NOT ADDED: email, phone, address, or card details. None of
 * them is needed to answer "do I take this appointment", which is the only
 * question this screen asks; the merchant already reaches the customer through
 * the notification the accept sends. Nor a returning-customer count or booking
 * history — genuinely useful someday, but nothing in MER-03 renders it, and a
 * field that exists only in case it is wanted is a disclosure made for no
 * reason.
 */
export const MerchantBookingSchema = BookingSchema.extend({
  /** Opaque id of the customer who made the booking. */
  customerId: IdSchema,
  /** The customer's display name; `"Customer"` when the account has none. */
  customerName: z.string(),
});
export type MerchantBookingDto = z.infer<typeof MerchantBookingSchema>;

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
