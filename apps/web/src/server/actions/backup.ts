'use server';

import { revalidatePath } from 'next/cache';
import { getDb } from '../db';
import { toPublicError } from '../errors';
import { requirePrimaryWorkspaceRole } from '../authz/workspace';
import { createWorkspaceBackup, listBackupRecords } from '../services/backup';

export async function listBackupsAction() {
  try {
    const access = await requirePrimaryWorkspaceRole('ADMIN');
    const items = await listBackupRecords(getDb(), access.workspace.id);
    return { ok: true as const, items };
  } catch (error) {
    return { ok: false as const, error: toPublicError(error) };
  }
}

export async function createBackupAction() {
  try {
    const access = await requirePrimaryWorkspaceRole('ADMIN');
    const result = await createWorkspaceBackup(getDb(), {
      workspaceId: access.workspace.id,
      userId: access.user.id,
    });
    revalidatePath('/settings/data');
    return { ok: true as const, ...result };
  } catch (error) {
    return { ok: false as const, error: toPublicError(error) };
  }
}
