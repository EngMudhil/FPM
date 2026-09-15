'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getDb } from '../db';
import { AppError, toPublicError } from '../errors';
import { requirePrimaryWorkspace, requireWorkspaceRole } from '../authz/workspace';
import { idSchema } from '../validation';
import {
  addBrokerDeposit,
  addBrokerWithdrawalCash,
  addEquitySnapshot,
  createBroker,
  createBrokerAccount,
  deleteBrokerAccount,
  getBrokerAccountById,
  getBrokerAccountLedger,
  listBrokerAccounts,
  listBrokers,
  updateBrokerAccount,
} from '../services/brokers';

const moneySchema = z
  .string()
  .trim()
  .regex(/^\d+(\.\d+)?$/)
  .refine((v) => Number(v) >= 0, 'Must be non-negative');

const positiveMoneySchema = z
  .string()
  .trim()
  .regex(/^\d+(\.\d+)?$/)
  .refine((v) => Number(v) > 0, 'Must be positive');

async function requireBrokerWorkspace() {
  const access = await requirePrimaryWorkspace();
  return requireWorkspaceRole(access.workspace.id, 'MEMBER');
}

function parseDate(value: string): Date {
  const date = new Date(value.includes('T') ? value : `${value}T12:00:00.000Z`);
  if (Number.isNaN(date.getTime())) throw new AppError('VALIDATION', 'Invalid date', 400);
  return date;
}

export async function listBrokerAccountsAction() {
  try {
    const access = await requireBrokerWorkspace();
    const items = await listBrokerAccounts(getDb(), access.workspace.id);
    return { ok: true as const, items };
  } catch (error) {
    return { ok: false as const, error: toPublicError(error) };
  }
}

export async function listBrokersAction() {
  try {
    const access = await requireBrokerWorkspace();
    const items = await listBrokers(getDb(), access.workspace.id);
    return { ok: true as const, items };
  } catch (error) {
    return { ok: false as const, error: toPublicError(error) };
  }
}

export async function getBrokerAccountAction(accountId: string) {
  try {
    const access = await requireBrokerWorkspace();
    const id = idSchema.parse(accountId);
    const ledger = await getBrokerAccountLedger(getDb(), access.workspace.id, id);
    return { ok: true as const, ...ledger };
  } catch (error) {
    return { ok: false as const, error: toPublicError(error) };
  }
}

export async function createBrokerAction(formData: FormData) {
  try {
    const access = await requireBrokerWorkspace();
    const name = String(formData.get('name') || '').trim();
    if (!name) throw new AppError('VALIDATION', 'Broker name is required', 400);
    const broker = await createBroker(getDb(), access.workspace.id, {
      name,
      website: String(formData.get('website') || '') || null,
      notes: String(formData.get('notes') || '') || null,
    });
    revalidatePath('/broker-accounts');
    return { ok: true as const, broker };
  } catch (error) {
    return { ok: false as const, error: toPublicError(error) };
  }
}

export async function createBrokerAccountAction(formData: FormData) {
  try {
    const access = await requireBrokerWorkspace();
    const parsed = z
      .object({
        brokerId: idSchema,
        accountName: z.string().trim().min(1).max(200),
        accountNumber: z.string().trim().max(100).optional(),
        startingCapital: moneySchema,
        currency: z.string().trim().length(3),
        startDate: z.string().optional(),
        notes: z.string().trim().max(5000).optional(),
      })
      .parse({
        brokerId: formData.get('brokerId'),
        accountName: formData.get('accountName'),
        accountNumber: formData.get('accountNumber') || undefined,
        startingCapital: formData.get('startingCapital'),
        currency: formData.get('currency'),
        startDate: formData.get('startDate') || undefined,
        notes: formData.get('notes') || undefined,
      });
    const account = await createBrokerAccount(getDb(), access.workspace.id, parsed);
    revalidatePath('/broker-accounts');
    redirect(`/broker-accounts/${account.id}`);
  } catch (error) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
    return { ok: false as const, error: toPublicError(error) };
  }
}

export async function updateBrokerAccountAction(accountId: string, formData: FormData) {
  try {
    const access = await requireBrokerWorkspace();
    const id = idSchema.parse(accountId);
    const parsed = z
      .object({
        brokerId: idSchema,
        accountName: z.string().trim().min(1).max(200),
        accountNumber: z.string().trim().max(100).optional(),
        startingCapital: moneySchema,
        currency: z.string().trim().length(3),
        startDate: z.string().optional(),
        notes: z.string().trim().max(5000).optional(),
      })
      .parse({
        brokerId: formData.get('brokerId'),
        accountName: formData.get('accountName'),
        accountNumber: formData.get('accountNumber') || undefined,
        startingCapital: formData.get('startingCapital'),
        currency: formData.get('currency'),
        startDate: formData.get('startDate') || undefined,
        notes: formData.get('notes') || undefined,
      });
    await updateBrokerAccount(getDb(), access.workspace.id, id, parsed);
    revalidatePath('/broker-accounts');
    revalidatePath(`/broker-accounts/${id}`);
    redirect(`/broker-accounts/${id}`);
  } catch (error) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
    return { ok: false as const, error: toPublicError(error) };
  }
}

export async function deleteBrokerAccountAction(accountId: string) {
  try {
    const access = await requireBrokerWorkspace();
    const id = idSchema.parse(accountId);
    await deleteBrokerAccount(getDb(), access.workspace.id, id);
    revalidatePath('/broker-accounts');
    redirect('/broker-accounts');
  } catch (error) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
    return { ok: false as const, error: toPublicError(error) };
  }
}

export async function addBrokerDepositAction(accountId: string, formData: FormData) {
  try {
    const access = await requireBrokerWorkspace();
    const id = idSchema.parse(accountId);
    await addBrokerDeposit(getDb(), access.workspace.id, {
      brokerAccountId: id,
      amount: positiveMoneySchema.parse(formData.get('amount')),
      depositDate: parseDate(String(formData.get('date') || '')),
      notes: String(formData.get('notes') || '') || null,
    });
    revalidatePath(`/broker-accounts/${id}`);
    redirect(`/broker-accounts/${id}`);
  } catch (error) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
    return { ok: false as const, error: toPublicError(error) };
  }
}

export async function addBrokerCashWithdrawalAction(accountId: string, formData: FormData) {
  try {
    const access = await requireBrokerWorkspace();
    const id = idSchema.parse(accountId);
    await addBrokerWithdrawalCash(getDb(), access.workspace.id, {
      brokerAccountId: id,
      amount: positiveMoneySchema.parse(formData.get('amount')),
      withdrawalDate: parseDate(String(formData.get('date') || '')),
      notes: String(formData.get('notes') || '') || null,
    });
    revalidatePath(`/broker-accounts/${id}`);
    redirect(`/broker-accounts/${id}`);
  } catch (error) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
    return { ok: false as const, error: toPublicError(error) };
  }
}

export async function addEquitySnapshotAction(accountId: string, formData: FormData) {
  try {
    const access = await requireBrokerWorkspace();
    const id = idSchema.parse(accountId);
    await addEquitySnapshot(getDb(), access.workspace.id, {
      brokerAccountId: id,
      equity: moneySchema.parse(formData.get('equity')),
      snapshotDate: parseDate(String(formData.get('date') || '')),
      notes: String(formData.get('notes') || '') || null,
    });
    revalidatePath(`/broker-accounts/${id}`);
    redirect(`/broker-accounts/${id}`);
  } catch (error) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
    return { ok: false as const, error: toPublicError(error) };
  }
}

export async function getBrokerAccountMetaAction(accountId: string) {
  try {
    const access = await requireBrokerWorkspace();
    const id = idSchema.parse(accountId);
    const account = await getBrokerAccountById(getDb(), access.workspace.id, id);
    return { ok: true as const, account };
  } catch (error) {
    return { ok: false as const, error: toPublicError(error) };
  }
}
