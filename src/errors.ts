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
    details: z.unknown().optional(),
  }),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;

/** Shape of `details` when code is PLAN_LIMIT, so the console can pick its panel. */
export const PlanLimitDetailsSchema = z.object({
  kind: z.enum(["capability", "quantity", "bookingCap"]),
  capability: z.string().optional(),
  limit: z.string().optional(),
  cap: z.number().optional(),
  used: z.number().optional(),
  plan: z.string(),
  requiredPlan: z.string().optional(),
});
export type PlanLimitDetails = z.infer<typeof PlanLimitDetailsSchema>;
