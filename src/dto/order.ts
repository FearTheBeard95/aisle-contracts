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

/**
 * What the merchant console's Orders screen reads, and what `GET
 * /merchant/orders` and `POST /merchant/orders/:id/advance` return.
 *
 * THE INVERSE OF `MerchantBookingSchema`, and for the same reason read the
 * other way round. There, the merchant needed something the customer shape
 * withheld, so the merchant shape `.extend()`s it. Here the merchant shape was
 * being handed something it never needed: `listMerchantOrders` returned
 * `OrderSchema` unchanged, so every merchant order response carried the
 * customer's `cardBrand` and `cardLast4`. Nothing in the console renders them,
 * and no merchant question about an order — pack it, ship it, mark it
 * delivered — is answerable only by knowing what card paid for it.
 *
 * That the values are fake today (payments are mocked) is not a defence. The
 * shape is the contract the mobile client and any real payment integration
 * will inherit, and the day a real PSP fills these columns in, every merchant
 * console session would start receiving card metadata about customers because
 * a schema written while the data was fake never said not to.
 *
 * `.omit()` RATHER THAN A SEPARATE OBJECT LITERAL. Both card fields aside, a
 * merchant order and a customer order are the same order — the reference, the
 * lines, the totals, the stage and its steps, the delivery address the
 * merchant is shipping to. Restating those fifteen fields would mean two
 * shapes free to drift, and the next field added to an order would land on one
 * of them. `.omit()` makes the merchant shape derived by construction: it
 * inherits every future field automatically, and the card fields are excluded
 * in one place that names them.
 *
 * ASSIGNABILITY RUNS THE OPPOSITE WAY FROM BOOKINGS, deliberately.
 * `MerchantBookingDto` is assignable to `BookingDto` (extend adds fields);
 * `OrderDto` is assignable to `MerchantOrderDto` (omit removes them). The
 * console's requirement is unaffected either way: it holds a
 * `MerchantOrderDto[]` and replaces a row in place with the response of
 * `POST /merchant/orders/:id/advance`, which returns `MerchantOrderDto` too.
 * What matters is that the list route and the action route agree, not that
 * either is assignable to the customer's shape — and a merchant row that WAS
 * assignable to `OrderDto` would be one that still carried the card fields,
 * which is the thing being removed.
 *
 * `OrderSchema` IS UNTOUCHED. The customer is entitled to see which of their
 * own cards paid; `GET /orders`, `GET /orders/:id` and `POST /orders` still
 * return it.
 */
export const MerchantOrderSchema = OrderSchema.omit({
  cardBrand: true,
  cardLast4: true,
});
export type MerchantOrderDto = z.infer<typeof MerchantOrderSchema>;
