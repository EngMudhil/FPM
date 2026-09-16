'use server';

import { getDb } from '../db';
import { toPublicError } from '../errors';
import { requirePrimaryWorkspace, requireWorkspaceRole } from '../authz/workspace';
import { getDashboardSnapshot } from '../services/dashboard';

export async function getDashboardAction(opts?: { quarterOffset?: number; yearOffset?: number }) {
  try {
    const access = await requirePrimaryWorkspace();
    await requireWorkspaceRole(access.workspace.id, 'VIEWER');
    const snapshot = await getDashboardSnapshot(getDb(), access.workspace.id, new Date(), opts);
    return { ok: true as const, workspace: access.workspace, snapshot };
  } catch (error) {
    return { ok: false as const, error: toPublicError(error) };
  }
}
