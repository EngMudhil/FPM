import { and, count, desc, eq, type SQL } from 'drizzle-orm';
import {
  createId,
  firms,
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
import { accountDisplayName } from './accounts';

export type WithdrawalInput = {
  tradingAccountId: string;
  amount: string;
  currency?: string;
  status: WithdrawalStatus;
  requestedAt: Date;
  receivedAt?: Date | null;
  notes?: string | null;
};

export type WithdrawalWithAccount = Withdrawal & {
  accountLabel: string;
  firmName: string;
  accountNumber: string | null;
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

function mapJoined(row: {
  withdrawal: Withdrawal;
  firmName: string;
  accountLabel: string | null;
  accountNumber: string | null;
}): WithdrawalWithAccount {
  return {
    ...row.withdrawal,
    firmName: row.firmName,
    accountNumber: row.accountNumber,
    accountLabel: accountDisplayName({
      label: row.accountLabel,
      accountNumber: row.accountNumber,
      firmName: row.firmName,
    }),
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

  const [rows, totalRows] = await Promise.all([
    db
      .select({
        withdrawal: withdrawals,
        firmName: firms.name,
        accountLabel: tradingAccounts.label,
        accountNumber: tradingAccounts.accountNumber,
      })
      .from(withdrawals)
      .innerJoin(tradingAccounts, eq(withdrawals.tradingAccountId, tradingAccounts.id))
      .innerJoin(firms, eq(tradingAccounts.firmId, firms.id))
      .where(where)
      .orderBy(desc(withdrawals.requestedAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ value: count() }).from(withdrawals).where(where),
  ]);

  return {
    items: rows.map(mapJoined),
    total: totalRows[0]?.value ?? 0,
    page,
    pageSize,
  };
}

export async function getWithdrawalById(
  db: Database,
  workspaceId: string,
  withdrawalId: string,
): Promise<WithdrawalWithAccount> {
  const rows = await db
    .select({
      withdrawal: withdrawals,
      firmName: firms.name,
      accountLabel: tradingAccounts.label,
      accountNumber: tradingAccounts.accountNumber,
    })
    .from(withdrawals)
    .innerJoin(tradingAccounts, eq(withdrawals.tradingAccountId, tradingAccounts.id))
    .innerJoin(firms, eq(tradingAccounts.firmId, firms.id))
    .where(and(eq(withdrawals.id, withdrawalId), eq(withdrawals.workspaceId, workspaceId)))
    .limit(1);
  const row = rows[0];
  if (!row) throw new AppError('NOT_FOUND', 'Withdrawal not found', 404);
  return mapJoined(row);
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
): Promise<WithdrawalWithAccount> {
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

  return getWithdrawalById(db, workspaceId, id);
}

export async function updateWithdrawal(
  db: Database,
  workspaceId: string,
  withdrawalId: string,
  input: {
    amount?: string;
    status: WithdrawalStatus;
    requestedAt?: Date;
    receivedAt?: Date | null;
    notes?: string | null;
  },
): Promise<WithdrawalWithAccount> {
  const current = await getWithdrawalById(db, workspaceId, withdrawalId);

  if (current.status === 'PAID' && input.status === 'PAID') {
    // PAID records: only notes may change; use status transition for reverse
    await db
      .update(withdrawals)
      .set({
        notes: input.notes === undefined ? current.notes : input.notes?.trim() || null,
        updatedAt: new Date(),
      })
      .where(and(eq(withdrawals.id, withdrawalId), eq(withdrawals.workspaceId, workspaceId)));
    return getWithdrawalById(db, workspaceId, withdrawalId);
  }

  try {
    assertStatusTransition(current.status, input.status);
  } catch (error) {
    throw new AppError(
      'BUSINESS_RULE',
      error instanceof Error ? error.message : 'Invalid transition',
      400,
    );
  }

  const requestedAt = input.requestedAt ?? current.requestedAt;
  const amount = input.amount?.trim() ?? current.amount;
  const receivedAt = input.status === 'PAID' ? (input.receivedAt ?? current.receivedAt) : null;

  try {
    assertWithdrawalInvariants({
      status: input.status,
      requestedAt,
      receivedAt,
      amount,
      currency: current.currency,
    });
  } catch (error) {
    throw new AppError(
      'BUSINESS_RULE',
      error instanceof Error ? error.message : 'Invalid withdrawal',
      400,
    );
  }

  if (current.status !== 'PENDING' && input.amount && input.amount.trim() !== current.amount) {
    throw new AppError('BUSINESS_RULE', 'Only PENDING withdrawals can change amount', 400);
  }

  await db
    .update(withdrawals)
    .set({
      amount,
      status: input.status,
      requestedAt,
      receivedAt,
      notes: input.notes === undefined ? current.notes : input.notes?.trim() || null,
      updatedAt: new Date(),
    })
    .where(and(eq(withdrawals.id, withdrawalId), eq(withdrawals.workspaceId, workspaceId)));

  return getWithdrawalById(db, workspaceId, withdrawalId);
}

export async function deleteWithdrawalIfAllowed(
  db: Database,
  workspaceId: string,
  withdrawalId: string,
): Promise<void> {
  const current = await getWithdrawalById(db, workspaceId, withdrawalId);
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
