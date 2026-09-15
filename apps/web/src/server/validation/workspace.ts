import { z } from 'zod';
import { currencyCodeSchema, emailSchema, idSchema, passwordSchema } from '../validation';

export const workspaceRoleSchema = z.enum(['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']);

export const workspaceUpdateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  timezone: z.string().trim().min(1).max(100),
  defaultCurrency: currencyCodeSchema,
});

export const memberInviteSchema = z.object({
  email: emailSchema,
  name: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  password: passwordSchema,
  role: workspaceRoleSchema.default('MEMBER'),
});

export const memberRoleUpdateSchema = z.object({
  membershipId: idSchema,
  role: workspaceRoleSchema,
});

export const memberIdSchema = idSchema;

export const profileUpdateSchema = z.object({
  name: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
