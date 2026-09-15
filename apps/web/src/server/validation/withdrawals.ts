import { z } from 'zod';
import { idSchema, paginationSchema } from '../validation';

const moneyStringSchema = z
  .string()
  .trim()
  .regex(/^\d+(\.\d+)?$/, 'Amount must be a positive decimal string')
  .refine((v) => Number(v) > 0, 'Amount must be greater than zero');

export const withdrawalStatusSchema = z.enum(['PENDING', 'PAID', 'FAILED', 'REVERSED']);

export const withdrawalCreateSchema = z.object({
  tradingAccountId: idSchema,
  amount: moneyStringSchema,
  status: withdrawalStatusSchema.default('PENDING'),
  requestedAt: z.string().datetime({ offset: true }).or(z.string().min(1)),
  receivedAt: z.string().datetime({ offset: true }).or(z.string().min(1)).optional(),
  notes: z.string().trim().max(5000).optional(),
});

export const withdrawalUpdateSchema = z.object({
  amount: moneyStringSchema.optional(),
  status: withdrawalStatusSchema,
  requestedAt: z.string().datetime({ offset: true }).or(z.string().min(1)).optional(),
  receivedAt: z.string().datetime({ offset: true }).or(z.string().min(1)).optional(),
  notes: z.string().trim().max(5000).optional(),
});

export const withdrawalListQuerySchema = paginationSchema.extend({
  status: withdrawalStatusSchema.optional(),
  tradingAccountId: idSchema.optional(),
});

export function parseDateInput(value: string): Date {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid date');
  }
  return date;
}
