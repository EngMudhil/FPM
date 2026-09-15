import { z } from 'zod';
import { idSchema, paginationSchema } from '../validation';

export const firmCreateSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200),
  website: z
    .string()
    .trim()
    .max(500)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  notes: z
    .string()
    .trim()
    .max(5000)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
});

export const firmUpdateSchema = firmCreateSchema;

export const firmListQuerySchema = paginationSchema.extend({
  search: z.string().trim().max(200).optional(),
  includeArchived: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .optional()
    .transform((v) => v === true || v === 'true'),
  sort: z.enum(['createdAt', 'name']).default('createdAt'),
  sortDir: z.enum(['asc', 'desc']).default('desc'),
});

export const firmIdSchema = idSchema;
