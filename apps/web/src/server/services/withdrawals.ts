import { and, count, desc, eq, type SQL } from 'drizzle-orm';
import {
  createId,
  tradingAccounts,
  withdrawals,
  type Database,
  type Withdrawal,
  type WithdrawalStatus,
} from '@fpm/db';
import {
  assertStatusTransition,
  assertWithdrawalInvariants,
  sumPendingByCurrency,
  sumRecognizedByCurrency,
  type WithdrawalRecord,
} from '@fpm/financial';
import { currencyCodeSchema } from '@fpm/money';
import { AppError } from '../errors';

export type WithdrawalInput = {
  tradingAccountId: string;
  amount: string;
  currency?: string;
  status: WithdrawalStatus;
  requestedAt: Date;
  receivedAt?: Date | null;
  notes?: string | null;
};

function toRecord(row: Withdrawal): WithdrawalRecord {
  return {
    amount: row.amount,
    currency: row.currency,
    status: row.status,
    requestedAt: row.requestedAt,
    receivedAt: row.receivedAt,
  };
}

export async function listWithdrawals(
  db: Database,
  workspaceId: string,
  opts?: { tradingAccountId?: string; status?: WithdrawalStatus; page?: number; pageSize?: number },
) {
  const page = opts?.page ?? 1;
  const pageSize = opts?.pageSize ?? 50;
  const filters: SQL[] = [eq(withdrawals.workspaceId, workspaceId)];
  if (opts?.tradingAccountId) {
    filters.push(eq(withdrawals.tradingAccountId, opts.tradingAccountId));
  }
  if (opts?.status) filters.push(eq(withdrawals.status, opts.status));
  const where = and(...filters);

  const [items, totalRows] = await Promise.all([
    db
      .select()
      .from(withdrawals)
      .where(where)
      .orderBy(desc(withdrawals.requestedAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ value: count() }).from(withdrawals).where(where),
  ]);

  return { items, total: totalRows[0]?.value ?? 0, page, pageSize };
}

export async function getWithdrawalTotals(db: Database, workspaceId: string) {
  const rows = await db.select().from(withdrawals).where(eq(withdrawals.workspaceId, workspaceId));
  const records = rows.map(toRecord);
  return {
    recognizedByCurrency: sumRecognizedByCurrency(records),
    pendingByCurrency: sumPendingByCurrency(records),
  };
}

export async function createWithdrawal(
  db: Database,
  workspaceId: string,
  input: WithdrawalInput,
): Promise<Withdrawal> {
  const account = await db
    .select()
    .from(tradingAccounts)
    .where(
      and(
        eq(tradingAccounts.id, input.tradingAccountId),
        eq(tradingAccounts.workspaceId, workspaceId),
      ),
    )
    .limit(1);
  if (!account[0]) throw new AppError('VALIDATION', 'Trading account not found', 400);

  const currency = currencyCodeSchema.parse(input.currency ?? account[0].currency);
  if (currency !== account[0].currency) {
    throw new AppError(
      'VALIDATION',
      `Withdrawal currency must match account currency (${account[0].currency})`,
      400,
    );
  }

  try {
    assertWithdrawalInvariants({
      status: input.status,
      requestedAt: input.requestedAt,
      receivedAt: input.receivedAt ?? null,
      amount: input.amount,
      currency,
    });
  } catch (error) {
    throw new AppError(
      'BUSINESS_RULE',
      error instanceof Error ? error.message : 'Invalid withdrawal',
      400,
    );
  }

  const id = createId();
  await db.insert(withdrawals).values({
    id,
    workspaceId,
    tradingAccountId: input.tradingAccountId,
    amount: input.amount.trim(),
    currency,
    status: input.status,
    requestedAt: input.requestedAt,
    receivedAt: input.status === 'PAID' ? (input.receivedAt ?? null) : null,
    notes: input.notes?.trim() || null,
  });

  const created = await db.select().from(withdrawals).where(eq(withdrawals.id, id)).limit(1);
  return created[0]!;
}

export async function updateWithdrawalStatus(
  db: Database,
  workspaceId: string,
  withdrawalId: string,
  next: {
    status: WithdrawalStatus;
    receivedAt?: Date | null;
    notes?: string | null;
  },
): Promise<Withdrawal> {
  const rows = await db
    .select()
    .from(withdrawals)
    .where(and(eq(withdrawals.id, withdrawalId), eq(withdrawals.workspaceId, workspaceId)))
    .limit(1);
  const current = rows[0];
  if (!current) throw new AppError('NOT_FOUND', 'Withdrawal not found', 404);

  try {
    assertStatusTransition(current.status, next.status);
    assertWithdrawalInvariants({
      status: next.status,
      requestedAt: current.requestedAt,
      receivedAt: next.status === 'PAID' ? (next.receivedAt ?? current.receivedAt) : null,
      amount: current.amount,
      currency: current.currency,
    });
  } catch (error) {
    throw new AppError(
      'BUSINESS_RULE',
      error instanceof Error ? error.message : 'Invalid transition',
      400,
    );
  }

  // PAID history: do not hard-delete; REVERSED is the unwind path.
  await db
    .update(withdrawals)
    .set({
      status: next.status,
      receivedAt: next.status === 'PAID' ? (next.receivedAt ?? current.receivedAt) : null,
      notes: next.notes === undefined ? current.notes : next.notes?.trim() || null,
      updatedAt: new Date(),
    })
    .where(and(eq(withdrawals.id, withdrawalId), eq(withdrawals.workspaceId, workspaceId)));

  const updated = await db
    .select()
    .from(withdrawals)
    .where(eq(withdrawals.id, withdrawalId))
    .limit(1);
  return updated[0]!;
}

export async function deleteWithdrawalIfAllowed(
  db: Database,
  workspaceId: string,
  withdrawalId: string,
): Promise<void> {
  const rows = await db
    .select()
    .from(withdrawals)
    .where(and(eq(withdrawals.id, withdrawalId), eq(withdrawals.workspaceId, workspaceId)))
    .limit(1);
  const current = rows[0];
  if (!current) throw new AppError('NOT_FOUND', 'Withdrawal not found', 404);
  if (current.status === 'PAID') {
    throw new AppError(
      'BUSINESS_RULE',
      'PAID withdrawals cannot be deleted. Mark as REVERSED instead.',
      409,
    );
  }
  await db
    .delete(withdrawals)
    .where(and(eq(withdrawals.id, withdrawalId), eq(withdrawals.workspaceId, workspaceId)));
}
