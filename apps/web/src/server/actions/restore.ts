'use server';

import { revalidatePath } from 'next/cache';
import { getDb } from '../db';
import { AppError, toPublicError } from '../errors';
import { requirePrimaryWorkspace, requireWorkspaceRole } from '../authz/workspace';
import {
  confirmAndRunRestore,
  createRestoreJobFromUpload,
  listRestoreJobs,
} from '../services/restore';

export async function listRestoreJobsAction() {
  try {
    const access = await requirePrimaryWorkspace();
    await requireWorkspaceRole(access.workspace.id, 'ADMIN');
    const items = await listRestoreJobs(getDb(), access.workspace.id);
    return { ok: true as const, items };
  } catch (error) {
    return { ok: false as const, error: toPublicError(error) };
  }
}

export async function uploadRestoreZipAction(formData: FormData) {
  try {
    const access = await requirePrimaryWorkspace();
    await requireWorkspaceRole(access.workspace.id, 'ADMIN');
    const file = formData.get('file');
    if (!(file instanceof File)) throw new AppError('VALIDATION', 'ZIP file required', 400);
    const buffer = Buffer.from(await file.arrayBuffer());
    const job = await createRestoreJobFromUpload(getDb(), {
      workspaceId: access.workspace.id,
      userId: access.user.id,
      zipBuffer: buffer,
    });
    revalidatePath('/settings/data');
    return { ok: true as const, ...job };
  } catch (error) {
    return { ok: false as const, error: toPublicError(error) };
  }
}

export async function confirmRestoreAction(formData: FormData) {
  try {
    const access = await requirePrimaryWorkspace();
    await requireWorkspaceRole(access.workspace.id, 'ADMIN');
    const result = await confirmAndRunRestore(getDb(), {
      workspaceId: access.workspace.id,
      userId: access.user.id,
      jobId: String(formData.get('jobId') || ''),
      typedConfirm: String(formData.get('typedConfirm') || ''),
      confirmationToken: String(formData.get('confirmationToken') || ''),
    });
    revalidatePath('/settings/data');
    revalidatePath('/firms');
    revalidatePath('/accounts');
    revalidatePath('/withdrawals');
    revalidatePath('/dashboard');
    return { ok: true as const, safetyBackupId: result.safetyBackupId };
  } catch (error) {
    return { ok: false as const, error: toPublicError(error) };
  }
}
