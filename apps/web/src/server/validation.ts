import { z } from 'zod';
import { currencyCodeSchema, moneyInputSchema } from '@fpm/money';

export const idSchema = z.string().uuid('Invalid id');
export const emailSchema = z
  .string()
  .trim()
  .email()
  .transform((v) => v.toLowerCase());
export const passwordSchema = z.string().min(8).max(128);

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const dateOnlySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD');

export const loginInputSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});

export { currencyCodeSchema, moneyInputSchema };
