import { z } from "zod";

/** Money is always integer cents. */
export const CentsSchema = z.number().int().nonnegative();
export const IdSchema = z.string().min(1);
export const IsoDateSchema = z.string().datetime();
export const RatingSchema = z.number().min(0).max(5);

/** Image placeholder key until real photography exists (e.g. "chair", "shop"). */
export const ImageKeySchema = z.string().min(1);

export const listOf = <T extends z.ZodTypeAny>(item: T) => z.object({ items: z.array(item) });
