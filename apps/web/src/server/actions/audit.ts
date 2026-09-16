'use server';

import { z } from 'zod';
import { getDb } from '../db';
import { AppError, toPublicError } from '../errors';
import { requirePrimaryWorkspaceRole } from '../authz/workspace';
import { listAuditLogs } from '../services/audit';

const querySchema = z.object({
  module: z.string().trim().max(100).optional(),
  action: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().positive().optional(),
});

export async function listAuditLogsAction(raw: Record<string, unknown> = {}) {
  try {
    const access = await requirePrimaryWorkspaceRole('ADMIN');
    const parsed = querySchema.safeParse(raw);
    if (!parsed.success) {
      throw new AppError('VALIDATION', 'Invalid audit query', 400, parsed.error.flatten());
    }
    const list = await listAuditLogs(getDb(), access.workspace.id, parsed.data);
    return { ok: true as const, ...list };
  } catch (error) {
    return { ok: false as const, error: toPublicError(error) };
  }
}
