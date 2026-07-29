import { z } from "zod";

export const ApiErrorCodeSchema = z.enum([
  "VALIDATION",        // 400 — request body/query failed schema validation
  "UNAUTHENTICATED",   // 401 — no or invalid session
  "FORBIDDEN",         // 403 — authenticated but not permitted
  "PLAN_LIMIT",        // 403 — entitlement gate; details carries plan info
  "NOT_FOUND",         // 404
  "CONFLICT",          // 409 — e.g. slot already held, email already registered
  "RATE_LIMITED",      // 429 — code resend / sign-in throttle
  "UPSTREAM",          // 502 — model or third party failed
  "INTERNAL",          // 500
]);
export type ApiErrorCode = z.infer<typeof ApiErrorCodeSchema>;

export const ApiErrorSchema = z.object({
  error: z.object({
    code: ApiErrorCodeSchema,
    message: z.string(),
    /** When `code` is `"PLAN_LIMIT"`, this conforms to `PlanLimitDetailsSchema`. */
    details: z.unknown().optional(),
  }),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;

/** Shape of `details` when code is PLAN_LIMIT, so the console can pick its panel. */
export const PlanLimitDetailsSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("capability"),
    capability: z.string(),
    plan: z.string(),
    requiredPlan: z.string(),
  }),
  z.object({
    kind: z.literal("quantity"),
    limit: z.string(),
    cap: z.number(),
    used: z.number(),
    plan: z.string(),
    requiredPlan: z.string(),
  }),
  z.object({
    kind: z.literal("bookingCap"),
    cap: z.number(),
    used: z.number(),
    plan: z.string(),
    requiredPlan: z.string(),
  }),
]);
export type PlanLimitDetails = z.infer<typeof PlanLimitDetailsSchema>;
