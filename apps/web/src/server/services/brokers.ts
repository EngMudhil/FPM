import { and, asc, desc, eq } from 'drizzle-orm';
import {
  brokerAccounts,
  brokerDeposits,
  brokers,
  brokerWithdrawals,
  createId,
  equitySnapshots,
  type Broker,
  type BrokerAccount,
  type Database,
} from '@fpm/db';
import { currencyCodeSchema, Money } from '@fpm/money';
import { netDeposited } from '@fpm/financial';
import { AppError } from '../errors';

export type BrokerInput = { name: string; website?: string | null; notes?: string | null };
export type BrokerAccountInput = {
  brokerId: string;
  accountName: string;
  accountNumber?: string | null;
  startingCapital: string;
  currency: string;
  startDate?: string | null;
  notes?: string | null;
};

function emptyToNull(value?: string | null) {
  if (!value) return null;
  const t = value.trim();
  return t.length === 0 ? null : t;
}

export async function listBrokers(db: Database, workspaceId: string) {
  return db
    .select()
    .from(brokers)
    .where(eq(brokers.workspaceId, workspaceId))
    .orderBy(asc(brokers.name));
}

export async function createBroker(
  db: Database,
  workspaceId: string,
  input: BrokerInput,
): Promise<Broker> {
  const id = createId();
  try {
    await db.insert(brokers).values({
      id,
      workspaceId,
      name: input.name.trim(),
      website: emptyToNull(input.website),
      notes: emptyToNull(input.notes),
    });
  } catch {
    throw new AppError('CONFLICT', 'Broker name must be unique in workspace', 409);
  }
  const rows = await db
    .select()
    .from(brokers)
    .where(and(eq(brokers.id, id), eq(brokers.workspaceId, workspaceId)))
    .limit(1);
  return rows[0]!;
}

export async function listBrokerAccounts(db: Database, workspaceId: string) {
  const rows = await db
    .select({ account: brokerAccounts, brokerName: brokers.name })
    .from(brokerAccounts)
    .innerJoin(brokers, eq(brokerAccounts.brokerId, brokers.id))
    .where(eq(brokerAccounts.workspaceId, workspaceId))
    .orderBy(asc(brokers.name), asc(brokerAccounts.accountName));
  return rows.map((row) => ({ ...row.account, brokerName: row.brokerName }));
}

export async function getBrokerAccountById(db: Database, workspaceId: string, id: string) {
  const rows = await db
    .select({ account: brokerAccounts, brokerName: brokers.name })
    .from(brokerAccounts)
    .innerJoin(brokers, eq(brokerAccounts.brokerId, brokers.id))
    .where(and(eq(brokerAccounts.id, id), eq(brokerAccounts.workspaceId, workspaceId)))
    .limit(1);
  if (!rows[0]) throw new AppError('NOT_FOUND', 'Broker account not found', 404);
  return { ...rows[0].account, brokerName: rows[0].brokerName };
}

export async function createBrokerAccount(
  db: Database,
  workspaceId: string,
  input: BrokerAccountInput,
): Promise<BrokerAccount> {
  const broker = await db
    .select()
    .from(brokers)
    .where(and(eq(brokers.id, input.brokerId), eq(brokers.workspaceId, workspaceId)))
    .limit(1);
  if (!broker[0]) throw new AppError('VALIDATION', 'Broker not found', 400);
  const currency = currencyCodeSchema.parse(input.currency);
  Money.fromString(input.startingCapital, currency);
  const id = createId();
  await db.insert(brokerAccounts).values({
    id,
    workspaceId,
    brokerId: input.brokerId,
    accountName: input.accountName.trim(),
    accountNumber: emptyToNull(input.accountNumber),
    startingCapital: input.startingCapital.trim(),
    currency,
    startDate: emptyToNull(input.startDate),
    notes: emptyToNull(input.notes),
  });
  return getBrokerAccountById(db, workspaceId, id);
}

export async function updateBrokerAccount(
  db: Database,
  workspaceId: string,
  id: string,
  input: Omit<BrokerAccountInput, 'brokerId'> & { brokerId?: string },
) {
  const current = await getBrokerAccountById(db, workspaceId, id);
  const brokerId = input.brokerId ?? current.brokerId;
  const currency = currencyCodeSchema.parse(input.currency);
  Money.fromString(input.startingCapital, currency);
  await db
    .update(brokerAccounts)
    .set({
      brokerId,
      accountName: input.accountName.trim(),
      accountNumber: emptyToNull(input.accountNumber),
      startingCapital: input.startingCapital.trim(),
      currency,
      startDate: emptyToNull(input.startDate),
      notes: emptyToNull(input.notes),
      updatedAt: new Date(),
    })
    .where(and(eq(brokerAccounts.id, id), eq(brokerAccounts.workspaceId, workspaceId)));
  return getBrokerAccountById(db, workspaceId, id);
}

export async function deleteBrokerAccount(db: Database, workspaceId: string, id: string) {
  await getBrokerAccountById(db, workspaceId, id);
  await db
    .delete(brokerAccounts)
    .where(and(eq(brokerAccounts.id, id), eq(brokerAccounts.workspaceId, workspaceId)));
}

export async function getBrokerAccountLedger(db: Database, workspaceId: string, accountId: string) {
  const account = await getBrokerAccountById(db, workspaceId, accountId);
  const [deposits, withdrawals, snapshots] = await Promise.all([
    db
      .select()
      .from(brokerDeposits)
      .where(
        and(
          eq(brokerDeposits.brokerAccountId, accountId),
          eq(brokerDeposits.workspaceId, workspaceId),
        ),
      )
      .orderBy(desc(brokerDeposits.depositDate)),
    db
      .select()
      .from(brokerWithdrawals)
      .where(
        and(
          eq(brokerWithdrawals.brokerAccountId, accountId),
          eq(brokerWithdrawals.workspaceId, workspaceId),
        ),
      )
      .orderBy(desc(brokerWithdrawals.withdrawalDate)),
    db
      .select()
      .from(equitySnapshots)
      .where(
        and(
          eq(equitySnapshots.brokerAccountId, accountId),
          eq(equitySnapshots.workspaceId, workspaceId),
        ),
      )
      .orderBy(desc(equitySnapshots.snapshotDate)),
  ]);

  const net = netDeposited({
    currency: account.currency,
    deposits: deposits.map((d) => ({ amount: d.amount, currency: d.currency })),
    withdrawals: withdrawals.map((w) => ({ amount: w.amount, currency: w.currency })),
  });
  const latestEquity = snapshots[0]?.equity ?? null;

  return {
    account,
    deposits,
    withdrawals,
    snapshots,
    metrics: {
      netDeposited: `${net} ${account.currency}`,
      latestEquity: latestEquity ? `${latestEquity} ${account.currency}` : '—',
      profitLoss: 'Deferred (OQ-003)',
      roi: 'Deferred (OQ-003); zero deposits → N/A when shipped',
    },
  };
}

export async function addBrokerDeposit(
  db: Database,
  workspaceId: string,
  input: {
    brokerAccountId: string;
    amount: string;
    depositDate: Date;
    notes?: string | null;
  },
) {
  const account = await getBrokerAccountById(db, workspaceId, input.brokerAccountId);
  const money = Money.fromString(input.amount, account.currency);
  if (!money.isPositive()) throw new AppError('VALIDATION', 'Deposit must be positive', 400);
  const id = createId();
  await db.insert(brokerDeposits).values({
    id,
    workspaceId,
    brokerAccountId: account.id,
    depositDate: input.depositDate,
    amount: input.amount.trim(),
    currency: account.currency,
    notes: emptyToNull(input.notes),
  });
  return id;
}

export async function addBrokerWithdrawalCash(
  db: Database,
  workspaceId: string,
  input: {
    brokerAccountId: string;
    amount: string;
    withdrawalDate: Date;
    notes?: string | null;
  },
) {
  const account = await getBrokerAccountById(db, workspaceId, input.brokerAccountId);
  const money = Money.fromString(input.amount, account.currency);
  if (!money.isPositive()) throw new AppError('VALIDATION', 'Withdrawal must be positive', 400);
  const id = createId();
  await db.insert(brokerWithdrawals).values({
    id,
    workspaceId,
    brokerAccountId: account.id,
    withdrawalDate: input.withdrawalDate,
    amount: input.amount.trim(),
    currency: account.currency,
    notes: emptyToNull(input.notes),
  });
  return id;
}

export async function addEquitySnapshot(
  db: Database,
  workspaceId: string,
  input: {
    brokerAccountId: string;
    equity: string;
    snapshotDate: Date;
    notes?: string | null;
  },
) {
  const account = await getBrokerAccountById(db, workspaceId, input.brokerAccountId);
  Money.fromString(input.equity, account.currency);
  const id = createId();
  try {
    await db.insert(equitySnapshots).values({
      id,
      workspaceId,
      brokerAccountId: account.id,
      snapshotDate: input.snapshotDate,
      equity: input.equity.trim(),
      currency: account.currency,
      notes: emptyToNull(input.notes),
    });
  } catch {
    throw new AppError(
      'CONFLICT',
      'An equity snapshot already exists for this account and date (ADR-012)',
      409,
    );
  }
  return id;
}
