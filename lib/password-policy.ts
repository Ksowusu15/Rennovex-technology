import { z } from "zod";

export const newPasswordSchema = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(128)
  .refine((value) => Buffer.byteLength(value, "utf8") <= 72, {
    message: "Use a password no longer than 72 UTF-8 bytes.",
  })
  .regex(/[a-z]/, "Include a lowercase letter.")
  .regex(/[A-Z]/, "Include an uppercase letter.")
  .regex(/[0-9]/, "Include a number.");
