import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(80),
  lastName: z.string().trim().min(1, 'Last name is required').max(80),
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters').max(128),
  /** From a friend's referral link (?ref=CODE). */
  referralCode: z.string().trim().max(20).optional(),
});
export type RegisterFormValues = z.infer<typeof registerSchema>;
