import { and, desc, eq, isNull } from 'drizzle-orm';
import {
  firms,
  scaleEvents,
  tradingAccounts,
  withdrawals,
  type AccountPhase,
  type Database,
  type WithdrawalStatus,
} from '@fpm/db';
import {
  countRecognizedPayouts,
  countWithdrawalsByStatus,
  sumPendingByCurrency,
  sumRecognizedByCurrency,
  sumRecognizedInRange,
  utcMonthBounds,
  type WithdrawalRecord,
} from '@fpm/financial';
import { accountDisplayName } from './accounts';

function toRecord(row: {
  amount: string;
  currency: string;
  status: WithdrawalStatus;
  requestedAt: Date;
  receivedAt: Date | null;
}): WithdrawalRecord {
  return {
    amount: row.amount,
    currency: row.currency,
    status: row.status,
    requestedAt: row.requestedAt,
    receivedAt: row.receivedAt,
  };
}

function formatMoneyMap(map: Record<string, string>): string {
  const entries = Object.entries(map);
  if (entries.length === 0) return '—';
  return entries.map(([currency, amount]) => `${amount} ${currency}`).join(' · ');
}

export type DashboardSnapshot = {
  metrics: {
    thisMonthRecognized: string;
    lastMonthRecognized: string;
    lifetimeRecognized: string;
    pendingAmount: string;
    recognizedPayoutCount: number;
    activeAccountCount: number;
    totalAccountCount: number;
  };
  withdrawalStatusDistribution: Record<WithdrawalStatus, number>;
  phaseDistribution: Record<AccountPhase, number>;
  recentWithdrawals: Array<{
    id: string;
    amount: string;
    currency: string;
    status: WithdrawalStatus;
    accountLabel: string;
    requestedAt: Date;
    receivedAt: Date | null;
  }>;
  recentScaleEvents: Array<{
    id: string;
    fromSize: string;
    toSize: string;
    currency: string;
    accountLabel: string;
    scaledAt: Date;
  }>;
  deferred: {
    fundedCapital: string;
    brokerMetrics: string;
    unresolvedFormulas: string;
  };
};

export async function getDashboardSnapshot(
  db: Database,
  workspaceId: string,
  now: Date = new Date(),
): Promise<DashboardSnapshot> {
  const [withdrawalRows, accountRows, recentWd, recentScale] = await Promise.all([
    db.select().from(withdrawals).where(eq(withdrawals.workspaceId, workspaceId)),
    db
      .select({
        phase: tradingAccounts.phase,
        archivedAt: tradingAccounts.archivedAt,
      })
      .from(tradingAccounts)
      .where(and(eq(tradingAccounts.workspaceId, workspaceId), isNull(tradingAccounts.archivedAt))),
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
      .where(eq(withdrawals.workspaceId, workspaceId))
      .orderBy(desc(withdrawals.requestedAt))
      .limit(8),
    db
      .select({
        scaleEvent: scaleEvents,
        firmName: firms.name,
        accountLabel: tradingAccounts.label,
        accountNumber: tradingAccounts.accountNumber,
        currency: tradingAccounts.currency,
      })
      .from(scaleEvents)
      .innerJoin(tradingAccounts, eq(scaleEvents.tradingAccountId, tradingAccounts.id))
      .innerJoin(firms, eq(tradingAccounts.firmId, firms.id))
      .where(eq(scaleEvents.workspaceId, workspaceId))
      .orderBy(desc(scaleEvents.scaledAt))
      .limit(5),
  ]);

  const records = withdrawalRows.map(toRecord);
  const bounds = utcMonthBounds(now);

  const phaseDistribution: Record<AccountPhase, number> = {
    ACTIVE: 0,
    PAUSED: 0,
    CLOSED: 0,
  };
  for (const row of accountRows) {
    phaseDistribution[row.phase] += 1;
  }

  return {
    metrics: {
      thisMonthRecognized: formatMoneyMap(
        sumRecognizedInRange(records, bounds.thisMonth.start, bounds.thisMonth.end),
      ),
      lastMonthRecognized: formatMoneyMap(
        sumRecognizedInRange(records, bounds.lastMonth.start, bounds.lastMonth.end),
      ),
      lifetimeRecognized: formatMoneyMap(sumRecognizedByCurrency(records)),
      pendingAmount: formatMoneyMap(sumPendingByCurrency(records)),
      recognizedPayoutCount: countRecognizedPayouts(records),
      activeAccountCount: phaseDistribution.ACTIVE,
      totalAccountCount: accountRows.length,
    },
    withdrawalStatusDistribution: countWithdrawalsByStatus(withdrawalRows),
    phaseDistribution,
    recentWithdrawals: recentWd.map((row) => ({
      id: row.withdrawal.id,
      amount: row.withdrawal.amount,
      currency: row.withdrawal.currency,
      status: row.withdrawal.status,
      requestedAt: row.withdrawal.requestedAt,
      receivedAt: row.withdrawal.receivedAt,
      accountLabel: accountDisplayName({
        label: row.accountLabel,
        accountNumber: row.accountNumber,
        firmName: row.firmName,
      }),
    })),
    recentScaleEvents: recentScale.map((row) => ({
      id: row.scaleEvent.id,
      fromSize: row.scaleEvent.fromSize,
      toSize: row.scaleEvent.toSize,
      currency: row.currency,
      scaledAt: row.scaleEvent.scaledAt,
      accountLabel: accountDisplayName({
        label: row.accountLabel,
        accountNumber: row.accountNumber,
        firmName: row.firmName,
      }),
    })),
    deferred: {
      fundedCapital: 'Deferred — OQ-001 (total vs current funded capital)',
      brokerMetrics: 'Deferred — FPM-014 broker domain',
      unresolvedFormulas: 'Avg/month, growth, yield gated on OQ-002 / OQ-017',
    },
  };
}
