'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getDb } from '../db';
import { AppError, toPublicError } from '../errors';
import { requirePrimaryWorkspace, requireWorkspaceRole } from '../authz/workspace';
import {
  archiveAccount,
  createAccount,
  getAccountById,
  listAccounts,
  listFirmOptions,
  updateAccount,
} from '../services/accounts';
import {
  accountCreateSchema,
  accountListQuerySchema,
  accountUpdateSchema,
} from '../validation/accounts';
import { idSchema } from '../validation';

async function requireAccountWorkspace(minimumRole: 'MEMBER' | 'ADMIN' = 'MEMBER') {
  const access = await requirePrimaryWorkspace();
  return requireWorkspaceRole(access.workspace.id, minimumRole);
}

export async function listAccountsAction(raw: Record<string, unknown>) {
  try {
    const access = await requireAccountWorkspace();
    const parsed = accountListQuerySchema.safeParse(raw);
    if (!parsed.success) {
      throw new AppError('VALIDATION', 'Invalid account list query', 400, parsed.error.flatten());
    }
    const result = await listAccounts(getDb(), {
      workspaceId: access.workspace.id,
      ...parsed.data,
    });
    return { ok: true as const, ...result };
  } catch (error) {
    return { ok: false as const, error: toPublicError(error) };
  }
}

export async function getAccountAction(accountId: string) {
  try {
    const access = await requireAccountWorkspace();
    const id = idSchema.parse(accountId);
    const account = await getAccountById(getDb(), access.workspace.id, id);
    return { ok: true as const, account };
  } catch (error) {
    return { ok: false as const, error: toPublicError(error) };
  }
}

export async function listFirmOptionsAction() {
  try {
    const access = await requireAccountWorkspace();
    const options = await listFirmOptions(getDb(), access.workspace.id);
    return { ok: true as const, options };
  } catch (error) {
    return { ok: false as const, error: toPublicError(error) };
  }
}

export async function createAccountAction(formData: FormData) {
  try {
    const access = await requireAccountWorkspace();
    const parsed = accountCreateSchema.safeParse({
      firmId: formData.get('firmId'),
      accountNumber: formData.get('accountNumber') || undefined,
      label: formData.get('label') || undefined,
      phase: formData.get('phase') || 'ACTIVE',
      initialSize: formData.get('initialSize'),
      currentSize: formData.get('currentSize') || undefined,
      currency: formData.get('currency'),
      platform: formData.get('platform') || undefined,
      startDate: formData.get('startDate') || undefined,
      notes: formData.get('notes') || undefined,
    });
    if (!parsed.success) {
      throw new AppError('VALIDATION', 'Invalid account input', 400, parsed.error.flatten());
    }
    const account = await createAccount(getDb(), access.workspace.id, parsed.data);
    revalidatePath('/accounts');
    redirect(`/accounts/${account.id}`);
  } catch (error) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
    return { ok: false as const, error: toPublicError(error) };
  }
}

export async function updateAccountAction(accountId: string, formData: FormData) {
  try {
    const access = await requireAccountWorkspace();
    const id = idSchema.parse(accountId);
    const parsed = accountUpdateSchema.safeParse({
      firmId: formData.get('firmId'),
      accountNumber: formData.get('accountNumber') || undefined,
      label: formData.get('label') || undefined,
      phase: formData.get('phase') || 'ACTIVE',
      initialSize: formData.get('initialSize'),
      currentSize: formData.get('currentSize') || undefined,
      currency: formData.get('currency'),
      platform: formData.get('platform') || undefined,
      startDate: formData.get('startDate') || undefined,
      notes: formData.get('notes') || undefined,
    });
    if (!parsed.success) {
      throw new AppError('VALIDATION', 'Invalid account input', 400, parsed.error.flatten());
    }
    await updateAccount(getDb(), access.workspace.id, id, parsed.data);
    revalidatePath('/accounts');
    revalidatePath(`/accounts/${id}`);
    redirect(`/accounts/${id}`);
  } catch (error) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
    return { ok: false as const, error: toPublicError(error) };
  }
}

export async function archiveAccountAction(accountId: string) {
  try {
    const access = await requireAccountWorkspace();
    const id = idSchema.parse(accountId);
    await archiveAccount(getDb(), access.workspace.id, id);
    revalidatePath('/accounts');
    revalidatePath(`/accounts/${id}`);
    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, error: toPublicError(error) };
  }
}
