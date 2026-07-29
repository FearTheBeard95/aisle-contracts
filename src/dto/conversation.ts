import { z } from "zod";
import { IdSchema, IsoDateSchema } from "./common.js";

/** A rendered turn. `payload` holds the tool result the client re-renders. */
export const ConversationTurnSchema = z.object({
  id: IdSchema,
  role: z.enum(["user", "agent"]),
  type: z.enum(["text", "products", "services", "chips"]),
  text: z.string().optional(),
  payload: z.unknown().optional(),
  createdAt: IsoDateSchema,
});
export type ConversationTurn = z.infer<typeof ConversationTurnSchema>;

export const ConversationSchema = z.object({
  id: IdSchema,
  title: z.string(),
  askCount: z.number().int().nonnegative(),
  updatedAt: IsoDateSchema,
  turns: z.array(ConversationTurnSchema),
});
export type ConversationDto = z.infer<typeof ConversationSchema>;
