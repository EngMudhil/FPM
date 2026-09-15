import { z } from 'zod';
import { idSchema, paginationSchema } from '../validation';

const sizeStringSchema = z
  .string()
  .trim()
  .regex(/^\d+(\.\d+)?$/, 'Size must be a positive decimal string')
  .refine((v) => Number(v) > 0, 'Size must be greater than zero');

export const scaleEventCreateSchema = z.object({
  tradingAccountId: idSchema,
  fromSize: sizeStringSchema,
  toSize: sizeStringSchema,
  scaledAt: z.string().datetime({ offset: true }).or(z.string().min(1)),
  notes: z.string().trim().max(5000).optional(),
});

export const scaleEventUpdateSchema = z.object({
  fromSize: sizeStringSchema,
  toSize: sizeStringSchema,
  scaledAt: z.string().datetime({ offset: true }).or(z.string().min(1)),
  notes: z.string().trim().max(5000).optional(),
});

export const scaleEventListQuerySchema = paginationSchema.extend({
  tradingAccountId: idSchema.optional(),
  firmId: idSchema.optional(),
});

export function parseDateInput(value: string): Date {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid date');
  }
  return date;
}
