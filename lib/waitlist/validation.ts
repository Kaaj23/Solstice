import { z } from "zod";

import {
  EMAIL_MAX_LENGTH,
  FRAGRANCE_PREFERENCES,
  type FragrancePreference,
} from "./constants";

/**
 * Validation shared by the browser form and the API route. The server always
 * re-validates; the client copy only exists to give faster, friendlier errors.
 */

/** Trim and lower-case. This is the form in which an address is stored and compared. */
export function normalizeEmail(raw: string): string {
  return raw.normalize("NFKC").trim().toLowerCase();
}

export const MESSAGES = {
  emailRequired: "Enter your email address.",
  emailInvalid: "Enter a valid email address, for example name@example.com.",
  emailTooLong: "That email address is too long.",
  consentRequired: "Please tick the box to agree to receive updates.",
  fragranceInvalid: "Choose one of the fragrances, or all fragrances.",
} as const;

export const signupSchema = z.object({
  email: z
    .string({
      required_error: MESSAGES.emailRequired,
      invalid_type_error: MESSAGES.emailInvalid,
    })
    .transform(normalizeEmail)
    .pipe(
      z
        .string()
        .min(1, MESSAGES.emailRequired)
        .max(EMAIL_MAX_LENGTH, MESSAGES.emailTooLong)
        .email(MESSAGES.emailInvalid)
    ),
  fragrance: z
    .enum(FRAGRANCE_PREFERENCES, {
      errorMap: () => ({ message: MESSAGES.fragranceInvalid }),
    })
    .default("all"),
  consent: z.literal(true, {
    errorMap: () => ({ message: MESSAGES.consentRequired }),
  }),
});

export type SignupInput = z.infer<typeof signupSchema>;

/** Fields the browser sends in addition to the validated sign-up data. */
export const antiAbuseSchema = z.object({
  /** Honeypot. Hidden from people; naive bots fill it in. Must stay empty. */
  hp_website_url: z.string().max(0).optional().default(""),
  /** Milliseconds between the form appearing and being submitted. */
  elapsedMs: z.number().finite().nonnegative().optional(),
});

export type FieldErrors = Partial<Record<"email" | "fragrance" | "consent", string>>;

/** Flatten a Zod error into one message per field (the first one wins). */
export function toFieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (
      (field === "email" || field === "fragrance" || field === "consent") &&
      !out[field]
    ) {
      out[field] = issue.message;
    }
  }
  return out;
}

/** Validate on the client. Returns field errors, or null when the input is fine. */
export function validateSignup(input: {
  email: string;
  fragrance: string;
  consent: boolean;
}): FieldErrors | null {
  const parsed = signupSchema.safeParse(input);
  return parsed.success ? null : toFieldErrors(parsed.error);
}

export function isFragrancePreference(value: unknown): value is FragrancePreference {
  return (
    typeof value === "string" &&
    (FRAGRANCE_PREFERENCES as readonly string[]).includes(value)
  );
}

export const tokenBodySchema = z.object({
  token: z.string().min(10).max(600),
  erase: z.boolean().optional().default(false),
});
