import { z } from "zod";
import { IdSchema } from "./common.js";

export const SignUpSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8).regex(/\d/, "Password needs at least one number"),
  acceptedTerms: z.literal(true),
});
export const SignInSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
export const VerifyCodeSchema = z.object({ email: z.string().email(), code: z.string().length(6) });
export const ResendCodeSchema = z.object({ email: z.string().email() });
export const ForgotPasswordSchema = z.object({ email: z.string().email() });
export const ResetPasswordSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  password: z.string().min(8).regex(/\d/),
});
export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).regex(/\d/),
  confirmPassword: z.string().min(1),
});

export const ProfileSchema = z.object({
  id: IdSchema,
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  addrLine: z.string(),
  addrCity: z.string(),
  cardBrand: z.string(),
  cardLast4: z.string(),
  cardExp: z.string(),
  tier: z.string(),
});
export type ProfileDto = z.infer<typeof ProfileSchema>;

export const PrefsSchema = z.object({
  alerts: z.boolean(),
  priceDrops: z.boolean(),
  reminders: z.boolean(),
});
export type PrefsDto = z.infer<typeof PrefsSchema>;

export const MerchantSignUpSchema = z.object({
  businessName: z.string().min(1),
  ownerName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8).regex(/\d/),
  offerType: z.enum(["services", "products", "both"]),
  acceptedTerms: z.literal(true),
});
