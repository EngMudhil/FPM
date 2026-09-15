import { z } from 'zod';
import { currencyCodeSchema } from '@fpm/money';
import { dateOnlySchema, idSchema, paginationSchema } from '../validation';

const moneyStringSchema = z
  .string()
  .trim()
  .regex(/^\d+(\.\d+)?$/, 'Size must be a non-negative decimal string');

export const accountPhaseSchema = z.enum(['ACTIVE', 'PAUSED', 'CLOSED']);

export const accountCreateSchema = z.object({
  firmId: idSchema,
  accountNumber: z.string().trim().max(100).optional(),
  label: z.string().trim().max(200).optional(),
  phase: accountPhaseSchema.default('ACTIVE'),
  initialSize: moneyStringSchema,
  currentSize: moneyStringSchema.optional(),
  currency: currencyCodeSchema,
  platform: z.string().trim().max(100).optional(),
  startDate: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined))
    .pipe(z.union([dateOnlySchema, z.undefined()])),
  notes: z.string().trim().max(5000).optional(),
});

export const accountUpdateSchema = accountCreateSchema;

export const accountListQuerySchema = paginationSchema.extend({
  search: z.string().trim().max(200).optional(),
  firmId: idSchema.optional(),
  phase: accountPhaseSchema.optional(),
  includeArchived: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .optional()
    .transform((v) => v === true || v === 'true'),
});
