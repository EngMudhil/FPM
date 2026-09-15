'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getDb } from '../db';
import { AppError, toPublicError } from '../errors';
import { requirePrimaryWorkspace, requireWorkspaceRole } from '../authz/workspace';
import { listAccounts } from '../services/accounts';
import {
  createScaleEvent,
  deleteScaleEvent,
  getScaleEventById,
  listScaleEvents,
  updateScaleEvent,
} from '../services/scale-events';
import { idSchema } from '../validation';
import {
  parseDateInput,
  scaleEventCreateSchema,
  scaleEventListQuerySchema,
  scaleEventUpdateSchema,
} from '../validation/scale-events';

async function requireScaleWorkspace() {
  const access = await requirePrimaryWorkspace();
  return requireWorkspaceRole(access.workspace.id, 'MEMBER');
}

export async function listScaleEventsAction(raw: Record<string, unknown>) {
  try {
    const access = await requireScaleWorkspace();
    const parsed = scaleEventListQuerySchema.safeParse(raw);
    if (!parsed.success) {
      throw new AppError(
        'VALIDATION',
        'Invalid scale event list query',
        400,
        parsed.error.flatten(),
      );
    }
    const list = await listScaleEvents(getDb(), access.workspace.id, parsed.data);
    return { ok: true as const, ...list };
  } catch (error) {
    return { ok: false as const, error: toPublicError(error) };
  }
}

export async function getScaleEventAction(scaleEventId: string) {
  try {
    const access = await requireScaleWorkspace();
    const id = idSchema.parse(scaleEventId);
    const scaleEvent = await getScaleEventById(getDb(), access.workspace.id, id);
    return { ok: true as const, scaleEvent };
  } catch (error) {
    return { ok: false as const, error: toPublicError(error) };
  }
}

export async function listAccountOptionsForScaleAction() {
  try {
    const access = await requireScaleWorkspace();
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
        currentSize: account.currentSize,
        initialSize: account.initialSize,
      })),
    };
  } catch (error) {
    return { ok: false as const, error: toPublicError(error) };
  }
}

export async function createScaleEventAction(formData: FormData) {
  try {
    const access = await requireScaleWorkspace();
    const parsed = scaleEventCreateSchema.safeParse({
      tradingAccountId: formData.get('tradingAccountId'),
      fromSize: formData.get('fromSize'),
      toSize: formData.get('toSize'),
      scaledAt: formData.get('scaledAt'),
      notes: formData.get('notes') || undefined,
    });
    if (!parsed.success) {
      throw new AppError('VALIDATION', 'Invalid scale event input', 400, parsed.error.flatten());
    }

    let scaledAt: Date;
    try {
      scaledAt = parseDateInput(parsed.data.scaledAt);
    } catch {
      throw new AppError('VALIDATION', 'Invalid scale date', 400);
    }

    const scaleEvent = await createScaleEvent(getDb(), access.workspace.id, {
      tradingAccountId: parsed.data.tradingAccountId,
      fromSize: parsed.data.fromSize,
      toSize: parsed.data.toSize,
      scaledAt,
      notes: parsed.data.notes,
    });
    revalidatePath('/scale-events');
    revalidatePath(`/accounts/${scaleEvent.tradingAccountId}`);
    revalidatePath('/dashboard');
    redirect(`/scale-events/${scaleEvent.id}`);
  } catch (error) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
    return { ok: false as const, error: toPublicError(error) };
  }
}

export async function updateScaleEventAction(scaleEventId: string, formData: FormData) {
  try {
    const access = await requireScaleWorkspace();
    const id = idSchema.parse(scaleEventId);
    const parsed = scaleEventUpdateSchema.safeParse({
      fromSize: formData.get('fromSize'),
      toSize: formData.get('toSize'),
      scaledAt: formData.get('scaledAt'),
      notes: formData.get('notes') || undefined,
    });
    if (!parsed.success) {
      throw new AppError('VALIDATION', 'Invalid scale event input', 400, parsed.error.flatten());
    }

    let scaledAt: Date;
    try {
      scaledAt = parseDateInput(parsed.data.scaledAt);
    } catch {
      throw new AppError('VALIDATION', 'Invalid scale date', 400);
    }

    const scaleEvent = await updateScaleEvent(getDb(), access.workspace.id, id, {
      fromSize: parsed.data.fromSize,
      toSize: parsed.data.toSize,
      scaledAt,
      notes: parsed.data.notes,
    });
    revalidatePath('/scale-events');
    revalidatePath(`/scale-events/${id}`);
    revalidatePath(`/accounts/${scaleEvent.tradingAccountId}`);
    revalidatePath('/dashboard');
    redirect(`/scale-events/${id}`);
  } catch (error) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
    return { ok: false as const, error: toPublicError(error) };
  }
}

export async function deleteScaleEventAction(scaleEventId: string) {
  try {
    const access = await requireScaleWorkspace();
    const id = idSchema.parse(scaleEventId);
    const current = await getScaleEventById(getDb(), access.workspace.id, id);
    await deleteScaleEvent(getDb(), access.workspace.id, id);
    revalidatePath('/scale-events');
    revalidatePath(`/accounts/${current.tradingAccountId}`);
    revalidatePath('/dashboard');
    redirect('/scale-events');
  } catch (error) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
    return { ok: false as const, error: toPublicError(error) };
  }
}
