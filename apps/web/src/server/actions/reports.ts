'use server';

import { z } from 'zod';
import { getDb } from '../db';
import { AppError, toPublicError } from '../errors';
import { requirePrimaryWorkspace, requireWorkspaceRole } from '../authz/workspace';
import { getReportsSnapshot } from '../services/reports';

const reportsQuerySchema = z.object({
  period: z.enum(['month', 'quarter', 'year', 'all']).optional(),
  currency: z
    .string()
    .trim()
    .length(3)
    .regex(/^[A-Za-z]{3}$/)
    .optional(),
});

export async function getReportsAction(raw: Record<string, unknown> = {}) {
  try {
    const access = await requirePrimaryWorkspace();
    await requireWorkspaceRole(access.workspace.id, 'VIEWER');
    const parsed = reportsQuerySchema.safeParse(raw);
    if (!parsed.success) {
      throw new AppError('VALIDATION', 'Invalid reports query', 400, parsed.error.flatten());
    }
    const snapshot = await getReportsSnapshot(getDb(), access.workspace.id, parsed.data);
    return { ok: true as const, workspace: access.workspace, snapshot };
  } catch (error) {
    return { ok: false as const, error: toPublicError(error) };
  }
}
