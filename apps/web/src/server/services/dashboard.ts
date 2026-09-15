import { and, desc, eq, isNull } from 'drizzle-orm';
import {
  brokerAccounts,
  brokerDeposits,
  brokerWithdrawals,
  equitySnapshots,
  firms,
  scaleEvents,
  tradingAccounts,
  withdrawals,
  type AccountPhase,
  type Database,
  type WithdrawalStatus,
} from '@fpm/db';
import { Money, formatDisplayMoney, formatDisplayPercent } from '@fpm/money';
import {
  averageMonthlyIncomeByCurrency,
  averagePayoutByCurrency,
  bestMonthByCurrency,
  brokerNetProfitLoss,
  combineSameCurrencyMaps,
  countRecognizedPayouts,
  countWithdrawalsByStatus,
  incomeYieldByCurrency,
  largestRecognizedByCurrency,
  portfolioGrowthByCurrency,
  sumCurrentFundedCapitalByCurrency,
  sumPendingByCurrency,
  sumRecognizedByCurrency,
  sumRecognizedInRange,
  sumTotalFundedCapitalByCurrency,
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
  const entries = Object.entries(map).filter(([, amount]) => amount !== 'N/A');
  if (entries.length === 0) {
    const na = Object.values(map).some((v) => v === 'N/A');
    return na ? 'N/A' : '—';
  }
  return entries.map(([currency, amount]) => formatDisplayMoney(amount, currency)).join(' · ');
}

function formatPercentMap(map: Record<string, string>): string {
  const entries = Object.entries(map);
  if (entries.length === 0) return '—';
  return entries
    .map(([currency, value]) =>
      value === 'N/A' ? `N/A (${currency})` : `${formatDisplayPercent(value)} (${currency})`,
    )
    .join(' · ');
}

export type DashboardSnapshot = {
  metrics: {
    thisMonthRecognized: string;
    lastMonthRecognized: string;
    lifetimeRecognized: string;
    pendingAmount: string;
    totalFundedCapital: string;
    currentFundedCapital: string;
    portfolioGrowth: string;
    averagePayout: string;
    averageMonthly: string;
    incomeYield: string;
    largestWithdrawal: string;
    bestMonth: string;
    recognizedPayoutCount: number;
    activeAccountCount: number;
    totalAccountCount: number;
    firmCount: number;
    paidWithdrawalCount: number;
    combinedManagedCapital: string;
    combinedGeneratedProfit: string;
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
};

export async function getDashboardSnapshot(
  db: Database,
  workspaceId: string,
  now: Date = new Date(),
): Promise<DashboardSnapshot> {
  const [
    withdrawalRows,
    accountRows,
    recentWd,
    recentScale,
    brokerAccountRows,
    snapshotRows,
    depositRows,
    brokerWdRows,
  ] = await Promise.all([
    db.select().from(withdrawals).where(eq(withdrawals.workspaceId, workspaceId)),
    db
      .select({
        phase: tradingAccounts.phase,
        initialSize: tradingAccounts.initialSize,
        currentSize: tradingAccounts.currentSize,
        currency: tradingAccounts.currency,
        firmId: tradingAccounts.firmId,
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
    db.select().from(brokerAccounts).where(eq(brokerAccounts.workspaceId, workspaceId)),
    db
      .select()
      .from(equitySnapshots)
      .where(eq(equitySnapshots.workspaceId, workspaceId))
      .orderBy(desc(equitySnapshots.snapshotDate)),
    db.select().from(brokerDeposits).where(eq(brokerDeposits.workspaceId, workspaceId)),
    db.select().from(brokerWithdrawals).where(eq(brokerWithdrawals.workspaceId, workspaceId)),
  ]);

  const records = withdrawalRows.map(toRecord);
  const bounds = utcMonthBounds(now);
  const sizeRows = accountRows.map((row) => ({
    initialSize: row.initialSize,
    currentSize: row.currentSize,
    currency: row.currency,
  }));

  const phaseDistribution: Record<AccountPhase, number> = {
    ACTIVE: 0,
    PAUSED: 0,
    CLOSED: 0,
  };
  for (const row of accountRows) {
    phaseDistribution[row.phase] += 1;
  }

  const currentCapital = sumCurrentFundedCapitalByCurrency(sizeRows);
  const lifetime = sumRecognizedByCurrency(records);

  const latestByAccount = new Map<string, { equity: string; currency: string }>();
  for (const snap of snapshotRows) {
    if (!latestByAccount.has(snap.brokerAccountId)) {
      latestByAccount.set(snap.brokerAccountId, { equity: snap.equity, currency: snap.currency });
    }
  }

  const brokerEquityTotals: Record<string, Money> = {};
  const brokerPnlTotals: Record<string, Money> = {};
  for (const account of brokerAccountRows) {
    const latest = latestByAccount.get(account.id);
    if (latest) {
      const equity = Money.fromString(latest.equity, latest.currency);
      brokerEquityTotals[equity.currency] = brokerEquityTotals[equity.currency]
        ? brokerEquityTotals[equity.currency]!.add(equity)
        : equity;
    }
    const pnl = brokerNetProfitLoss({
      currency: account.currency,
      latestEquity: latest?.equity ?? null,
      deposits: depositRows
        .filter((d) => d.brokerAccountId === account.id)
        .map((d) => ({ amount: d.amount, currency: d.currency })),
      withdrawals: brokerWdRows
        .filter((w) => w.brokerAccountId === account.id)
        .map((w) => ({ amount: w.amount, currency: w.currency })),
    });
    if (pnl !== 'N/A') {
      const money = Money.fromString(pnl, account.currency);
      brokerPnlTotals[money.currency] = brokerPnlTotals[money.currency]
        ? brokerPnlTotals[money.currency]!.add(money)
        : money;
    }
  }

  const brokerEquityMap = Object.fromEntries(
    Object.entries(brokerEquityTotals).map(([c, m]) => [c, m.toString()]),
  );
  const brokerPnlMap = Object.fromEntries(
    Object.entries(brokerPnlTotals).map(([c, m]) => [c, m.toString()]),
  );

  const combinedCapital = combineSameCurrencyMaps(currentCapital, brokerEquityMap);
  const combinedProfit = combineSameCurrencyMaps(lifetime, brokerPnlMap);

  const best = bestMonthByCurrency(records);
  const bestMonthLabel =
    Object.entries(best)
      .map(([c, v]) => `${v.month}: ${formatDisplayMoney(v.amount, c)}`)
      .join(' · ') || '—';

  return {
    metrics: {
      thisMonthRecognized: formatMoneyMap(
        sumRecognizedInRange(records, bounds.thisMonth.start, bounds.thisMonth.end),
      ),
      lastMonthRecognized: formatMoneyMap(
        sumRecognizedInRange(records, bounds.lastMonth.start, bounds.lastMonth.end),
      ),
      lifetimeRecognized: formatMoneyMap(lifetime),
      pendingAmount: formatMoneyMap(sumPendingByCurrency(records)),
      totalFundedCapital: formatMoneyMap(sumTotalFundedCapitalByCurrency(sizeRows)),
      currentFundedCapital: formatMoneyMap(currentCapital),
      portfolioGrowth: formatPercentMap(portfolioGrowthByCurrency(sizeRows)),
      averagePayout: formatMoneyMap(averagePayoutByCurrency(records)),
      averageMonthly: formatMoneyMap(averageMonthlyIncomeByCurrency(records, now)),
      incomeYield: formatPercentMap(incomeYieldByCurrency(records, sizeRows)),
      largestWithdrawal: formatMoneyMap(largestRecognizedByCurrency(records)),
      bestMonth: bestMonthLabel,
      recognizedPayoutCount: countRecognizedPayouts(records),
      activeAccountCount: phaseDistribution.ACTIVE,
      totalAccountCount: accountRows.length,
      firmCount: new Set(accountRows.map((a) => a.firmId)).size,
      paidWithdrawalCount: countWithdrawalsByStatus(withdrawalRows).PAID,
      combinedManagedCapital: combinedCapital
        ? formatDisplayMoney(combinedCapital.amount, combinedCapital.currency)
        : '—',
      combinedGeneratedProfit: combinedProfit
        ? formatDisplayMoney(combinedProfit.amount, combinedProfit.currency)
        : '—',
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
  };
}
