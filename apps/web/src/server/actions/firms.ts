'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getDb } from '../db';
import { AppError, toPublicError } from '../errors';
import { requirePrimaryWorkspace, requireWorkspaceRole } from '../authz/workspace';
import {
  archiveFirm,
  createFirm,
  deleteFirm,
  getFirmById,
  listFirms,
  updateFirm,
} from '../services/firms';
import {
  firmCreateSchema,
  firmIdSchema,
  firmListQuerySchema,
  firmUpdateSchema,
} from '../validation/firms';

async function requireFirmWorkspace(minimumRole: 'MEMBER' | 'ADMIN' = 'MEMBER') {
  const access = await requirePrimaryWorkspace();
  return requireWorkspaceRole(access.workspace.id, minimumRole);
}

export async function listFirmsAction(raw: Record<string, unknown>) {
  try {
    const access = await requireFirmWorkspace();
    const parsed = firmListQuerySchema.safeParse(raw);
    if (!parsed.success) {
      throw new AppError('VALIDATION', 'Invalid firm list query', 400, parsed.error.flatten());
    }
    const result = await listFirms(getDb(), {
      workspaceId: access.workspace.id,
      ...parsed.data,
    });
    return { ok: true as const, ...result };
  } catch (error) {
    return { ok: false as const, error: toPublicError(error) };
  }
}

export async function getFirmAction(firmId: string) {
  try {
    const access = await requireFirmWorkspace();
    const id = firmIdSchema.parse(firmId);
    const firm = await getFirmById(getDb(), access.workspace.id, id);
    return { ok: true as const, firm };
  } catch (error) {
    return { ok: false as const, error: toPublicError(error) };
  }
}

export async function createFirmAction(formData: FormData) {
  try {
    const access = await requireFirmWorkspace();
    const parsed = firmCreateSchema.safeParse({
      name: formData.get('name'),
      website: formData.get('website') || undefined,
      notes: formData.get('notes') || undefined,
    });
    if (!parsed.success) {
      throw new AppError('VALIDATION', 'Invalid firm input', 400, parsed.error.flatten());
    }
    const firm = await createFirm(getDb(), access.workspace.id, parsed.data);
    revalidatePath('/firms');
    redirect(`/firms/${firm.id}`);
  } catch (error) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
    return { ok: false as const, error: toPublicError(error) };
  }
}

export async function updateFirmAction(firmId: string, formData: FormData) {
  try {
    const access = await requireFirmWorkspace();
    const id = firmIdSchema.parse(firmId);
    const parsed = firmUpdateSchema.safeParse({
      name: formData.get('name'),
      website: formData.get('website') || undefined,
      notes: formData.get('notes') || undefined,
    });
    if (!parsed.success) {
      throw new AppError('VALIDATION', 'Invalid firm input', 400, parsed.error.flatten());
    }
    await updateFirm(getDb(), access.workspace.id, id, parsed.data);
    revalidatePath('/firms');
    revalidatePath(`/firms/${id}`);
    redirect(`/firms/${id}`);
  } catch (error) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
    return { ok: false as const, error: toPublicError(error) };
  }
}

export async function archiveFirmAction(firmId: string) {
  try {
    const access = await requireFirmWorkspace();
    const id = firmIdSchema.parse(firmId);
    await archiveFirm(getDb(), access.workspace.id, id);
    revalidatePath('/firms');
    revalidatePath(`/firms/${id}`);
    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, error: toPublicError(error) };
  }
}

export async function deleteFirmAction(firmId: string) {
  try {
    const access = await requireFirmWorkspace('ADMIN');
    const id = firmIdSchema.parse(firmId);
    await deleteFirm(getDb(), access.workspace.id, id);
    revalidatePath('/firms');
    redirect('/firms');
  } catch (error) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
    return { ok: false as const, error: toPublicError(error) };
  }
}
