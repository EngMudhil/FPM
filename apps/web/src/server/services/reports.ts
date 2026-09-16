import { and, eq, isNull } from 'drizzle-orm';
import {
  firms,
  tradingAccounts,
  withdrawals,
  type AccountPhase,
  type Database,
  type WithdrawalStatus,
} from '@fpm/db';
import {
  countWithdrawalsByStatus,
  sumPendingByCurrency,
  sumRecognizedByCurrency,
  sumRecognizedByKey,
  sumRecognizedInRange,
  utcPeriodBounds,
  type ReportPeriod,
  type WithdrawalRecord,
} from '@fpm/financial';
import { accountDisplayName } from './accounts';

function formatMoneyMap(map: Record<string, string>): string {
  const entries = Object.entries(map);
  if (entries.length === 0) return '—';
  return entries.map(([currency, amount]) => `${amount} ${currency}`).join(' · ');
}

export type ReportsQuery = {
  period?: ReportPeriod;
  currency?: string;
};

export type ReportsSnapshot = {
  period: ReportPeriod;
  currencyFilter: string | null;
  periodLabel: string;
  totals: {
    recognizedInPeriod: string;
    pendingAllTime: string;
    recognizedLifetime: string;
  };
  incomeByFirm: Array<{ label: string; amounts: string }>;
  incomeByAccount: Array<{ label: string; amounts: string }>;
  withdrawalStatusDistribution: Record<WithdrawalStatus, number>;
  phaseDistribution: Record<AccountPhase, number>;
  deferred: string[];
};

export async function getReportsSnapshot(
  db: Database,
  workspaceId: string,
  query: ReportsQuery = {},
  now: Date = new Date(),
): Promise<ReportsSnapshot> {
  const period: ReportPeriod = query.period ?? 'month';
  const currencyFilter = query.currency?.trim().toUpperCase() || null;
  const range = utcPeriodBounds(period, now);

  const [withdrawalRows, accountRows] = await Promise.all([
    db
      .select({
        amount: withdrawals.amount,
        currency: withdrawals.currency,
        status: withdrawals.status,
        requestedAt: withdrawals.requestedAt,
        receivedAt: withdrawals.receivedAt,
        firmName: firms.name,
        accountLabel: tradingAccounts.label,
        accountNumber: tradingAccounts.accountNumber,
      })
      .from(withdrawals)
      .innerJoin(tradingAccounts, eq(withdrawals.tradingAccountId, tradingAccounts.id))
      .innerJoin(firms, eq(tradingAccounts.firmId, firms.id))
      .where(eq(withdrawals.workspaceId, workspaceId)),
    db
      .select({ phase: tradingAccounts.phase })
      .from(tradingAccounts)
      .where(and(eq(tradingAccounts.workspaceId, workspaceId), isNull(tradingAccounts.archivedAt))),
  ]);

  const records: WithdrawalRecord[] = withdrawalRows.map((row) => ({
    amount: row.amount,
    currency: row.currency,
    status: row.status,
    requestedAt: row.requestedAt,
    receivedAt: row.receivedAt,
  }));

  const filteredForTotals = currencyFilter
    ? records.filter((row) => row.currency === currencyFilter)
    : records;

  const recognizedInPeriod = range
    ? sumRecognizedInRange(filteredForTotals, range.start, range.end)
    : sumRecognizedByCurrency(filteredForTotals);

  const byFirm = sumRecognizedByKey(
    withdrawalRows.map((row) => ({
      key: row.firmName,
      amount: row.amount,
      currency: row.currency,
      status: row.status,
      requestedAt: row.requestedAt,
      receivedAt: row.receivedAt,
    })),
    range,
    currencyFilter,
  );

  const byAccount = sumRecognizedByKey(
    withdrawalRows.map((row) => ({
      key: accountDisplayName({
        label: row.accountLabel,
        accountNumber: row.accountNumber,
        firmName: row.firmName,
      }),
      amount: row.amount,
      currency: row.currency,
      status: row.status,
      requestedAt: row.requestedAt,
      receivedAt: row.receivedAt,
    })),
    range,
    currencyFilter,
  );

  const phaseDistribution: Record<AccountPhase, number> = {
    ACTIVE: 0,
    PAUSED: 0,
    CLOSED: 0,
  };
  for (const row of accountRows) {
    phaseDistribution[row.phase] += 1;
  }

  const periodLabel =
    period === 'all'
      ? 'All time'
      : period === 'month'
        ? 'This UTC month'
        : period === 'quarter'
          ? 'This UTC quarter'
          : 'This UTC year';

  return {
    period,
    currencyFilter,
    periodLabel,
    totals: {
      recognizedInPeriod: formatMoneyMap(recognizedInPeriod),
      pendingAllTime: formatMoneyMap(sumPendingByCurrency(filteredForTotals)),
      recognizedLifetime: formatMoneyMap(sumRecognizedByCurrency(filteredForTotals)),
    },
    incomeByFirm: Object.entries(byFirm)
      .map(([label, amounts]) => ({ label, amounts: formatMoneyMap(amounts) }))
      .sort((a, b) => a.label.localeCompare(b.label)),
    incomeByAccount: Object.entries(byAccount)
      .map(([label, amounts]) => ({ label, amounts: formatMoneyMap(amounts) }))
      .sort((a, b) => a.label.localeCompare(b.label)),
    withdrawalStatusDistribution: countWithdrawalsByStatus(withdrawalRows),
    phaseDistribution,
    deferred: [
      'S3-compatible storage remains FUTURE (ADR-015)',
      'MT5 integration remains FUTURE (ADR-004)',
    ],
  };
}
