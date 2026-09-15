'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getDb } from '../db';
import { AppError, toPublicError } from '../errors';
import { requirePrimaryWorkspace, requireWorkspaceRole } from '../authz/workspace';
import { listAccounts } from '../services/accounts';
import {
  createWithdrawal,
  deleteWithdrawalIfAllowed,
  getWithdrawalById,
  getWithdrawalTotals,
  listWithdrawals,
  updateWithdrawal,
} from '../services/withdrawals';
import { writeAuditLog } from '../services/audit';
import { idSchema } from '../validation';
import {
  parseDateInput,
  withdrawalCreateSchema,
  withdrawalListQuerySchema,
  withdrawalUpdateSchema,
} from '../validation/withdrawals';

async function requireWithdrawalWorkspace() {
  const access = await requirePrimaryWorkspace();
  return requireWorkspaceRole(access.workspace.id, 'MEMBER');
}

export async function listWithdrawalsAction(raw: Record<string, unknown>) {
  try {
    const access = await requireWithdrawalWorkspace();
    const parsed = withdrawalListQuerySchema.safeParse(raw);
    if (!parsed.success) {
      throw new AppError(
        'VALIDATION',
        'Invalid withdrawal list query',
        400,
        parsed.error.flatten(),
      );
    }
    const [list, totals] = await Promise.all([
      listWithdrawals(getDb(), access.workspace.id, parsed.data),
      getWithdrawalTotals(getDb(), access.workspace.id),
    ]);
    return { ok: true as const, ...list, totals };
  } catch (error) {
    return { ok: false as const, error: toPublicError(error) };
  }
}

export async function getWithdrawalAction(withdrawalId: string) {
  try {
    const access = await requireWithdrawalWorkspace();
    const id = idSchema.parse(withdrawalId);
    const withdrawal = await getWithdrawalById(getDb(), access.workspace.id, id);
    return { ok: true as const, withdrawal };
  } catch (error) {
    return { ok: false as const, error: toPublicError(error) };
  }
}

export async function listAccountOptionsForWithdrawalAction() {
  try {
    const access = await requireWithdrawalWorkspace();
    const result = await listAccounts(getDb(), {
      workspaceId: access.workspace.id,
      pageSize: 200,
    });
    return {
      ok: true as const,
      options: result.items.map((account) => ({
        id: account.id,
        label: `${account.firmName}${account.accountNumber ? ` · #${account.accountNumber}` : ''}${account.label ? ` (${account.label})` : ''} · ${account.currency}`,
        currency: account.currency,
      })),
    };
  } catch (error) {
    return { ok: false as const, error: toPublicError(error) };
  }
}

export async function createWithdrawalAction(formData: FormData) {
  try {
    const access = await requireWithdrawalWorkspace();
    const parsed = withdrawalCreateSchema.safeParse({
      tradingAccountId: formData.get('tradingAccountId'),
      amount: formData.get('amount'),
      status: formData.get('status') || 'PENDING',
      requestedAt: formData.get('requestedAt'),
      receivedAt: formData.get('receivedAt') || undefined,
      notes: formData.get('notes') || undefined,
    });
    if (!parsed.success) {
      throw new AppError('VALIDATION', 'Invalid withdrawal input', 400, parsed.error.flatten());
    }

    let requestedAt: Date;
    let receivedAt: Date | null = null;
    try {
      requestedAt = parseDateInput(parsed.data.requestedAt);
      if (parsed.data.receivedAt) receivedAt = parseDateInput(parsed.data.receivedAt);
    } catch {
      throw new AppError('VALIDATION', 'Invalid date value', 400);
    }

    const withdrawal = await createWithdrawal(getDb(), access.workspace.id, {
      tradingAccountId: parsed.data.tradingAccountId,
      amount: parsed.data.amount,
      status: parsed.data.status,
      requestedAt,
      receivedAt,
      notes: parsed.data.notes,
    });
    await writeAuditLog(getDb(), {
      workspaceId: access.workspace.id,
      actorUserId: access.user.id,
      action: 'CREATE',
      module: 'withdrawals',
      recordType: 'Withdrawal',
      recordId: withdrawal.id,
      newValue: { amount: withdrawal.amount, status: withdrawal.status },
    });
    revalidatePath('/withdrawals');
    revalidatePath('/dashboard');
    redirect(`/withdrawals/${withdrawal.id}`);
  } catch (error) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
    return { ok: false as const, error: toPublicError(error) };
  }
}

export async function updateWithdrawalAction(withdrawalId: string, formData: FormData) {
  try {
    const access = await requireWithdrawalWorkspace();
    const id = idSchema.parse(withdrawalId);
    const parsed = withdrawalUpdateSchema.safeParse({
      amount: formData.get('amount') || undefined,
      status: formData.get('status'),
      requestedAt: formData.get('requestedAt') || undefined,
      receivedAt: formData.get('receivedAt') || undefined,
      notes: formData.get('notes') || undefined,
    });
    if (!parsed.success) {
      throw new AppError('VALIDATION', 'Invalid withdrawal input', 400, parsed.error.flatten());
    }

    let requestedAt: Date | undefined;
    let receivedAt: Date | null | undefined;
    try {
      if (parsed.data.requestedAt) requestedAt = parseDateInput(parsed.data.requestedAt);
      if (parsed.data.receivedAt) receivedAt = parseDateInput(parsed.data.receivedAt);
      if (parsed.data.status !== 'PAID') receivedAt = null;
    } catch {
      throw new AppError('VALIDATION', 'Invalid date value', 400);
    }

    await updateWithdrawal(getDb(), access.workspace.id, id, {
      amount: parsed.data.amount,
      status: parsed.data.status,
      requestedAt,
      receivedAt,
      notes: parsed.data.notes,
    });
    revalidatePath('/withdrawals');
    revalidatePath(`/withdrawals/${id}`);
    revalidatePath('/dashboard');
    redirect(`/withdrawals/${id}`);
  } catch (error) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
    return { ok: false as const, error: toPublicError(error) };
  }
}

export async function deleteWithdrawalAction(withdrawalId: string) {
  try {
    const access = await requireWithdrawalWorkspace();
    const id = idSchema.parse(withdrawalId);
    await deleteWithdrawalIfAllowed(getDb(), access.workspace.id, id);
    revalidatePath('/withdrawals');
    redirect('/withdrawals');
  } catch (error) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
    return { ok: false as const, error: toPublicError(error) };
  }
}
