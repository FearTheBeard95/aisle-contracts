import { z } from "zod";
import { IdSchema, IsoDateSchema } from "./common.js";

export const SlotStateSchema = z.enum(["open", "closed", "booked", "held"]);
export type SlotState = z.infer<typeof SlotStateSchema>;

export const AvailabilitySlotSchema = z.object({
  id: IdSchema,
  startsAt: IsoDateSchema,
  label: z.string(),
  state: SlotStateSchema,
});
export type AvailabilitySlot = z.infer<typeof AvailabilitySlotSchema>;

export const DayHoursSchema = z.object({
  day: z.enum(["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]),
  open: z.boolean(),
  /** Display range exactly as prototyped, e.g. "10:00 – 20:00" or "Closed". */
  range: z.string(),
  capacity: z.string(),
});
export type DayHoursDto = z.infer<typeof DayHoursSchema>;
