import { and, count, desc, eq, isNull } from 'drizzle-orm';
import {
  brokerAccounts,
  brokerDeposits,
  brokerWithdrawals,
  brokers,
  certificates,
  equitySnapshots,
  firms,
  tradingAccounts,
  withdrawals,
  type Database,
  type WithdrawalStatus,
} from '@fpm/db';
import { Money, formatDisplayMoney, formatDisplayPercent } from '@fpm/money';
import {
  averageMonthlyIncomeByCurrency,
  averagePayoutByCurrency,
  bestMonthByCurrency,
  brokerNetProfitLoss,
  brokerRoi,
  combineSameCurrencyMaps,
  countRecognizedPayouts,
  countWithdrawalsByStatus,
  equityDrawdownAmountExclWithdrawals,
  incomeYieldByCurrency,
  isRecognizedPayout,
  peakEquity,
  sumCurrentFundedCapitalByCurrency,
  sumPendingByCurrency,
  sumRecognizedByCurrency,
  sumRecognizedByKey,
  sumRecognizedInRange,
  sumTotalFundedCapitalByCurrency,
  utcMonthBounds,
  utcPeriodBounds,
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

function primaryCurrency(map: Record<string, string>): string | null {
  const keys = Object.keys(map);
  if (keys.length === 1) return keys[0]!;
  if (keys.includes('USD')) return 'USD';
  return keys[0] ?? null;
}

function formatMoneyMap(
  map: Record<string, string>,
  opts?: {
    signed?: boolean;
    decimals?: number;
    forceFraction?: boolean;
    compact?: boolean;
  },
): string {
  const style = opts ?? { decimals: 0, compact: true };
  const entries = Object.entries(map).filter(([, amount]) => amount !== 'N/A');
  if (entries.length === 0) {
    return Object.values(map).some((v) => v === 'N/A') ? 'N/A' : '—';
  }
  return entries
    .map(([currency, amount]) => formatDisplayMoney(amount, currency, style))
    .join(' · ');
}

function formatRealMoney(amount: string, currency: string, opts?: { signed?: boolean }): string {
  return formatDisplayMoney(amount, currency, {
    decimals: 2,
    forceFraction: true,
    signed: opts?.signed,
  });
}

function amountIn(map: Record<string, string>, currency: string | null): string {
  if (!currency) return '0';
  return map[currency] ?? '0';
}

function countRecognizedInRange(
  records: WithdrawalRecord[],
  start: Date,
  end: Date,
  currency?: string | null,
): number {
  return records.filter((row) => {
    if (!isRecognizedPayout(row) || !row.receivedAt) return false;
    if (currency && row.currency !== currency) return false;
    const t = row.receivedAt.getTime();
    return t >= start.getTime() && t < end.getTime();
  }).length;
}

function momChangePercent(thisAmt: string, lastAmt: string): string | null {
  const last = Money.fromString(lastAmt, 'USD').amount;
  const cur = Money.fromString(thisAmt, 'USD').amount;
  if (last.isZero()) return cur.isZero() ? '0%' : null;
  const pct = cur.minus(last).div(last).times(100);
  const sign = pct.greaterThanOrEqualTo(0) ? '+' : '';
  return `${sign}${pct.toFixed(0)}%`;
}

function monthKey(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(key: string): string {
  const [y, m] = key.split('-').map(Number);
  return new Date(Date.UTC(y!, m! - 1, 1)).toLocaleString('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function shortMonth(key: string): string {
  const [, m] = key.split('-').map(Number);
  return new Date(Date.UTC(2000, m! - 1, 1)).toLocaleString('en-US', {
    month: 'short',
    timeZone: 'UTC',
  });
}

export type DashboardSnapshot = {
  asOfLabel: string;
  firstName: string | null;
  metrics: {
    totalFundedCapital: string;
    currentFundedCapital: string;
    thisMonth: string;
    thisMonthHelper: string;
    thisMonthChange: string | null;
    lastMonth: string;
    lastMonthHelper: string;
    quarterToDate: string;
    quarterHelper: string;
    quarterLabel: string;
    yearToDate: string;
    yearHelper: string;
    yearLabel: string;
    lifetime: string;
    lifetimeHelper: string;
    averageMonthly: string;
    incomeYield: string;
    averagePayout: string;
    largestWithdrawal: string;
    largestWithdrawalFirm: string | null;
    largestWithdrawalDate: string | null;
    bestMonth: string;
    bestMonthHelper: string;
    businessTenure: string;
    businessTenureHelper: string;
    recognizedPayoutCount: number;
    activeAccountCount: number;
    totalAccountCount: number;
    firmCount: number;
    certificateCount: number;
    paidWithdrawalCount: number;
    pendingWithdrawalCount: number;
    pendingWithdrawalAmount: string;
    brokerCount: number;
    brokerAccountCount: number;
    currentRealEquity: string;
    brokerNetPl: string;
    brokerNetPlNegative: boolean;
    brokerRoi: string;
    brokerRoiHero: string;
    totalDeposits: string;
    totalBrokerWithdrawals: string;
    peakEquity: string;
    tradingDrawdown: string;
    combinedManagedCapital: string;
    combinedGeneratedProfit: string;
    fundedCapitalRaw: string;
    realEquityRaw: string;
    fundedPayoutsRaw: string;
    realPlRaw: string;
  };
  incomeByFirm: Array<{
    name: string;
    amount: string;
    percent: number;
  }>;
  monthlyPayouts: Array<{
    key: string;
    label: string;
    shortLabel: string;
    amount: string;
    amountRaw: number;
    count: number;
  }>;
  payoutTrend: Array<{
    key: string;
    shortLabel: string;
    amountRaw: number;
  }>;
  cumulativeIncome: Array<{
    key: string;
    label: string;
    amountRaw: number;
  }>;
  profitByBroker: Array<{ name: string; amount: string; amountRaw: number }>;
  profitByAccount: Array<{ name: string; amount: string; amountRaw: number }>;
  periodNav: {
    quarterOffset: number;
    yearOffset: number;
    minQuarterOffset: number;
    minYearOffset: number;
  };
  recentWithdrawals: Array<{
    id: string;
    amount: string;
    currency: string;
    status: WithdrawalStatus;
    firmName: string;
    accountLabel: string;
    requestedAt: Date;
    receivedAt: Date | null;
  }>;
};

export async function getDashboardSnapshot(
  db: Database,
  workspaceId: string,
  now: Date = new Date(),
  opts: { quarterOffset?: number; yearOffset?: number } = {},
): Promise<DashboardSnapshot> {
  const [
    withdrawalRows,
    accountRows,
    recentWd,
    brokerAccountRows,
    brokerRows,
    snapshotRows,
    depositRows,
    brokerWdRows,
    firmRows,
    certCountRows,
  ] = await Promise.all([
    db
      .select({
        withdrawal: withdrawals,
        firmName: firms.name,
        accountLabel: tradingAccounts.label,
        accountNumber: tradingAccounts.accountNumber,
        firmId: firms.id,
      })
      .from(withdrawals)
      .innerJoin(tradingAccounts, eq(withdrawals.tradingAccountId, tradingAccounts.id))
      .innerJoin(firms, eq(tradingAccounts.firmId, firms.id))
      .where(eq(withdrawals.workspaceId, workspaceId)),
    db
      .select({
        phase: tradingAccounts.phase,
        initialSize: tradingAccounts.initialSize,
        currentSize: tradingAccounts.currentSize,
        currency: tradingAccounts.currency,
        firmId: tradingAccounts.firmId,
        startDate: tradingAccounts.startDate,
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
      .limit(6),
    db.select().from(brokerAccounts).where(eq(brokerAccounts.workspaceId, workspaceId)),
    db.select().from(brokers).where(eq(brokers.workspaceId, workspaceId)),
    db
      .select()
      .from(equitySnapshots)
      .where(eq(equitySnapshots.workspaceId, workspaceId))
      .orderBy(desc(equitySnapshots.snapshotDate)),
    db.select().from(brokerDeposits).where(eq(brokerDeposits.workspaceId, workspaceId)),
    db.select().from(brokerWithdrawals).where(eq(brokerWithdrawals.workspaceId, workspaceId)),
    db
      .select()
      .from(firms)
      .where(and(eq(firms.workspaceId, workspaceId), isNull(firms.archivedAt))),
    db
      .select({ value: count() })
      .from(certificates)
      .where(eq(certificates.workspaceId, workspaceId)),
  ]);

  const records = withdrawalRows.map((r) => toRecord(r.withdrawal));
  const monthBounds = utcMonthBounds(now);

  let earliestReceived: Date | null = null;
  for (const r of records) {
    if (!isRecognizedPayout(r) || !r.receivedAt) continue;
    if (!earliestReceived || r.receivedAt < earliestReceived) earliestReceived = r.receivedAt;
  }
  const minQuarterOffset = earliestReceived ? -quarterIndexDiff(earliestReceived, now) : 0;
  const minYearOffset = earliestReceived
    ? earliestReceived.getUTCFullYear() - now.getUTCFullYear()
    : 0;

  const quarterOffset = clampOffset(opts.quarterOffset ?? 0, minQuarterOffset, 0);
  const yearOffset = clampOffset(opts.yearOffset ?? 0, minYearOffset, 0);
  const quarterRef = shiftByQuarters(now, quarterOffset);
  const yearRef = shiftByYears(now, yearOffset);
  const quarterBounds = utcPeriodBounds('quarter', quarterRef)!;
  const yearBounds = utcPeriodBounds('year', yearRef)!;
  const sizeRows = accountRows.map((row) => ({
    initialSize: row.initialSize,
    currentSize: row.currentSize,
    currency: row.currency,
  }));

  const lifetime = sumRecognizedByCurrency(records);
  const currency =
    primaryCurrency(lifetime) ??
    primaryCurrency(sumTotalFundedCapitalByCurrency(sizeRows)) ??
    'USD';

  const thisMap = sumRecognizedInRange(
    records,
    monthBounds.thisMonth.start,
    monthBounds.thisMonth.end,
  );
  const lastMap = sumRecognizedInRange(
    records,
    monthBounds.lastMonth.start,
    monthBounds.lastMonth.end,
  );
  const quarterMap = sumRecognizedInRange(records, quarterBounds.start, quarterBounds.end);
  const yearMap = sumRecognizedInRange(records, yearBounds.start, yearBounds.end);

  const thisRaw = amountIn(thisMap, currency);
  const lastRaw = amountIn(lastMap, currency);
  const change = momChangePercent(thisRaw, lastRaw);

  const q = Math.floor(quarterRef.getUTCMonth() / 3) + 1;
  const quarterLabel =
    quarterOffset === 0
      ? `Q${q} ${quarterRef.getUTCFullYear()} · Now`
      : `Q${q} ${quarterRef.getUTCFullYear()}`;
  const yearLabel =
    yearOffset === 0 ? `${yearRef.getUTCFullYear()} · Now` : `${yearRef.getUTCFullYear()}`;
  const quarterHelper =
    quarterOffset === 0
      ? `${countRecognizedInRange(records, quarterBounds.start, quarterBounds.end, currency)} payouts this quarter`
      : `${countRecognizedInRange(records, quarterBounds.start, quarterBounds.end, currency)} payouts`;
  const yearHelper =
    yearOffset === 0
      ? `${countRecognizedInRange(records, yearBounds.start, yearBounds.end, currency)} payouts this year`
      : `${countRecognizedInRange(records, yearBounds.start, yearBounds.end, currency)} payouts`;

  const activeAccountCount = accountRows.filter((a) => a.phase === 'ACTIVE').length;
  const statusCounts = countWithdrawalsByStatus(withdrawalRows.map((r) => r.withdrawal));

  // Largest withdrawal detail
  let largestFirm: string | null = null;
  let largestDate: string | null = null;
  let largestAmount = Money.fromString('0', currency);
  for (const row of withdrawalRows) {
    if (!isRecognizedPayout(row.withdrawal) || row.withdrawal.currency !== currency) continue;
    const money = Money.fromString(row.withdrawal.amount, row.withdrawal.currency);
    if (money.amount.greaterThan(largestAmount.amount)) {
      largestAmount = money;
      largestFirm = row.firmName;
      largestDate = row.withdrawal.receivedAt
        ? row.withdrawal.receivedAt.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            timeZone: 'UTC',
          })
        : null;
    }
  }

  const best = bestMonthByCurrency(records)[currency];
  const bestMonthDisplay = best
    ? formatDisplayMoney(best.amount, currency, { decimals: 0, compact: true })
    : '—';
  const bestMonthHelper = best
    ? new Date(`${best.month}-01T00:00:00.000Z`).toLocaleString('en-US', {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      })
    : '—';

  // Tenure from earliest account start or earliest receivedAt
  let tenureStart: Date | null = null;
  for (const a of accountRows) {
    if (!a.startDate) continue;
    const d = new Date(`${a.startDate}T00:00:00.000Z`);
    if (!Number.isNaN(d.getTime()) && (!tenureStart || d < tenureStart)) tenureStart = d;
  }
  for (const r of records) {
    if (!r.receivedAt) continue;
    if (!tenureStart || r.receivedAt < tenureStart) tenureStart = r.receivedAt;
  }
  let businessTenure = '—';
  let businessTenureHelper = '—';
  if (tenureStart) {
    const months =
      (now.getUTCFullYear() - tenureStart.getUTCFullYear()) * 12 +
      (now.getUTCMonth() - tenureStart.getUTCMonth());
    businessTenure = `${Math.max(months, 0)} mo`;
    businessTenureHelper = `Since ${tenureStart.toLocaleString('en-US', {
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    })}`;
  }

  // Monthly series (last 12 months)
  const monthlyBuckets: Record<string, { amount: Money; count: number }> = {};
  for (let i = 11; i >= 0; i -= 1) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    monthlyBuckets[monthKey(d)] = {
      amount: Money.fromString('0', currency),
      count: 0,
    };
  }
  for (const row of records) {
    if (!isRecognizedPayout(row) || !row.receivedAt || row.currency !== currency) continue;
    const key = monthKey(row.receivedAt);
    const bucket = monthlyBuckets[key];
    if (!bucket) continue;
    bucket.amount = bucket.amount.add(Money.fromString(row.amount, row.currency));
    bucket.count += 1;
  }
  const monthlyPayoutsChrono = Object.entries(monthlyBuckets).map(([key, bucket]) => ({
    key,
    label: monthLabel(key),
    shortLabel: shortMonth(key),
    amount: formatDisplayMoney(bucket.amount.toString(), currency, { decimals: 0, compact: true }),
    amountRaw: Number(bucket.amount.toString()),
    count: bucket.count,
  }));

  let running = Money.fromString('0', currency);
  const cumulativeIncome = monthlyPayoutsChrono.map((m) => {
    running = running.add(Money.fromString(String(m.amountRaw), currency));
    return { key: m.key, label: m.shortLabel, amountRaw: Number(running.toString()) };
  });

  // Income by firm
  const byFirm = sumRecognizedByKey(
    withdrawalRows.map((r) => ({
      ...toRecord(r.withdrawal),
      key: r.firmName,
    })),
  );
  const lifetimeAmt = Money.fromString(amountIn(lifetime, currency), currency);
  const incomeByFirm = Object.entries(byFirm)
    .map(([name, amounts]) => {
      const raw = amounts[currency] ?? '0';
      const money = Money.fromString(raw, currency);
      const percent = lifetimeAmt.amount.isZero()
        ? 0
        : Number(money.amount.div(lifetimeAmt.amount).times(100).toFixed(0));
      return {
        name,
        amount: formatDisplayMoney(raw, currency, { decimals: 0, compact: true }),
        percent,
        sort: money.amount,
      };
    })
    .sort((a, b) => (b.sort.greaterThan(a.sort) ? 1 : -1))
    .map(({ name, amount, percent }) => ({ name, amount, percent }))
    .slice(0, 5);

  // Broker metrics
  const latestByAccount = new Map<string, { equity: string; currency: string }>();
  for (const snap of snapshotRows) {
    if (!latestByAccount.has(snap.brokerAccountId)) {
      latestByAccount.set(snap.brokerAccountId, { equity: snap.equity, currency: snap.currency });
    }
  }

  let totalDeposits = Money.fromString('0', currency);
  let totalBrokerWd = Money.fromString('0', currency);
  let totalEquity = Money.fromString('0', currency);
  let totalPnl = Money.fromString('0', currency);
  const peakCandidates: Array<{
    id: string;
    equity: string;
    snapshotDate: Date;
    currency: string;
  }> = [];

  const profitByBrokerMap: Record<string, Money> = {};
  const profitByAccountList: Array<{ name: string; amount: string; amountRaw: number }> = [];

  const brokerNameById = Object.fromEntries(brokerRows.map((b) => [b.id, b.name]));

  for (const account of brokerAccountRows) {
    if (account.currency !== currency) continue;
    const latest = latestByAccount.get(account.id);
    const deposits = depositRows.filter((d) => d.brokerAccountId === account.id);
    const wds = brokerWdRows.filter((w) => w.brokerAccountId === account.id);
    for (const d of deposits) {
      if (d.currency === currency) {
        totalDeposits = totalDeposits.add(Money.fromString(d.amount, d.currency));
      }
    }
    for (const w of wds) {
      if (w.currency === currency) {
        totalBrokerWd = totalBrokerWd.add(Money.fromString(w.amount, w.currency));
      }
    }
    if (latest && latest.currency === currency) {
      totalEquity = totalEquity.add(Money.fromString(latest.equity, latest.currency));
    }
    const pnl = brokerNetProfitLoss({
      currency: account.currency,
      latestEquity: latest?.equity ?? null,
      deposits: deposits.map((d) => ({ amount: d.amount, currency: d.currency })),
      withdrawals: wds.map((w) => ({ amount: w.amount, currency: w.currency })),
    });
    if (pnl !== 'N/A') {
      const money = Money.fromString(pnl, account.currency);
      totalPnl = totalPnl.add(money);
      const bName = brokerNameById[account.brokerId] ?? 'Broker';
      profitByBrokerMap[bName] = profitByBrokerMap[bName]
        ? profitByBrokerMap[bName]!.add(money)
        : money;
      profitByAccountList.push({
        name: account.accountName,
        amount: formatRealMoney(pnl, account.currency, { signed: true }),
        amountRaw: Number(money.toString()),
      });
    }
    for (const snap of snapshotRows.filter((s) => s.brokerAccountId === account.id)) {
      peakCandidates.push({
        id: snap.id,
        equity: snap.equity,
        snapshotDate: snap.snapshotDate,
        currency: snap.currency,
      });
    }
  }

  const peak = peakEquity(peakCandidates.filter((p) => p.currency === currency));
  const latestEquityStr = totalEquity.amount.isZero() ? null : totalEquity.toString();
  const drawdownAmount = equityDrawdownAmountExclWithdrawals({
    peakEquity: peak?.equity ?? null,
    latestEquity: latestEquityStr,
    withdrawalsTotal: totalBrokerWd.toString(),
    currency,
  });

  const roi = brokerRoi({
    currency,
    latestEquity: latestEquityStr,
    deposits: depositRows
      .filter((d) => d.currency === currency)
      .map((d) => ({ amount: d.amount, currency: d.currency })),
    withdrawals: brokerWdRows
      .filter((w) => w.currency === currency)
      .map((w) => ({ amount: w.amount, currency: w.currency })),
  });

  const currentCapital = sumCurrentFundedCapitalByCurrency(sizeRows);
  const totalFunded = sumTotalFundedCapitalByCurrency(sizeRows);
  const combinedCapital = combineSameCurrencyMaps(currentCapital, {
    [currency]: totalEquity.toString(),
  });
  const combinedProfit = combineSameCurrencyMaps(lifetime, { [currency]: totalPnl.toString() });

  const yieldMap = incomeYieldByCurrency(records, sizeRows);
  const avgPayoutMap = averagePayoutByCurrency(records);
  const avgMonthlyMap = averageMonthlyIncomeByCurrency(records, now);

  const yieldRaw = yieldMap[currency];
  const incomeYieldDisplay =
    !yieldRaw || yieldRaw === 'N/A' ? '—' : formatYieldOneDecimal(yieldRaw);

  const asOfLabel = now
    .toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    })
    .toUpperCase();

  const brokerRoiPrecise = roi === 'N/A' ? 'N/A' : formatDisplayPercent(roi);
  const brokerRoiHero = roi === 'N/A' ? 'N/A' : formatPercentOneDecimal(roi);

  const pendingMap = sumPendingByCurrency(records);
  const pendingCount = statusCounts.PENDING;

  return {
    asOfLabel,
    firstName: null,
    metrics: {
      totalFundedCapital: formatMoneyMap(totalFunded),
      currentFundedCapital: formatMoneyMap(currentCapital),
      thisMonth: formatMoneyMap(thisMap),
      thisMonthHelper: change ? `${change} vs last month` : 'No prior month baseline',
      thisMonthChange: change,
      lastMonth: formatMoneyMap(lastMap),
      lastMonthHelper: `${countRecognizedInRange(records, monthBounds.lastMonth.start, monthBounds.lastMonth.end, currency)} withdrawals`,
      quarterToDate: formatMoneyMap(quarterMap),
      quarterHelper,
      quarterLabel,
      yearToDate: formatMoneyMap(yearMap),
      yearHelper,
      yearLabel,
      lifetime: formatMoneyMap(lifetime),
      lifetimeHelper: `${countRecognizedPayouts(records)} paid payouts`,
      averageMonthly: formatMoneyMap(avgMonthlyMap),
      incomeYield: incomeYieldDisplay,
      averagePayout: formatMoneyMap(avgPayoutMap),
      largestWithdrawal: largestAmount.amount.isZero()
        ? '—'
        : formatDisplayMoney(largestAmount.toString(), currency, { decimals: 0, compact: true }),
      largestWithdrawalFirm: largestFirm,
      largestWithdrawalDate: largestDate,
      bestMonth: bestMonthDisplay,
      bestMonthHelper,
      businessTenure,
      businessTenureHelper,
      recognizedPayoutCount: countRecognizedPayouts(records),
      activeAccountCount,
      totalAccountCount: accountRows.length,
      firmCount: firmRows.length,
      certificateCount: certCountRows[0]?.value ?? 0,
      paidWithdrawalCount: statusCounts.PAID,
      pendingWithdrawalCount: pendingCount,
      pendingWithdrawalAmount: formatMoneyMap(pendingMap),
      brokerCount: brokerRows.length,
      brokerAccountCount: brokerAccountRows.length,
      currentRealEquity: formatRealMoney(totalEquity.toString(), currency),
      brokerNetPl: formatRealMoney(totalPnl.toString(), currency, { signed: true }),
      brokerNetPlNegative: totalPnl.amount.isNegative(),
      brokerRoi: brokerRoiPrecise,
      brokerRoiHero,
      totalDeposits: formatRealMoney(totalDeposits.toString(), currency),
      totalBrokerWithdrawals: formatRealMoney(totalBrokerWd.toString(), currency),
      peakEquity: peak ? formatRealMoney(peak.equity, currency) : '—',
      tradingDrawdown: drawdownAmount === 'N/A' ? 'N/A' : formatRealMoney(drawdownAmount, currency),
      combinedManagedCapital: combinedCapital
        ? formatDisplayMoney(combinedCapital.amount, combinedCapital.currency, {
            decimals: 0,
            compact: true,
          })
        : '—',
      combinedGeneratedProfit: combinedProfit
        ? formatDisplayMoney(combinedProfit.amount, combinedProfit.currency, {
            decimals: 2,
            forceFraction: true,
            signed: true,
          })
        : '—',
      fundedCapitalRaw: formatMoneyMap(currentCapital),
      realEquityRaw: formatRealMoney(totalEquity.toString(), currency),
      fundedPayoutsRaw: formatMoneyMap(lifetime),
      realPlRaw: formatRealMoney(totalPnl.toString(), currency, { signed: true }),
    },
    incomeByFirm,
    monthlyPayouts: [...monthlyPayoutsChrono]
      .reverse()
      .filter((m) => m.count > 0)
      .slice(0, 6),
    payoutTrend: monthlyPayoutsChrono,
    cumulativeIncome,
    profitByBroker: Object.entries(profitByBrokerMap)
      .map(([name, money]) => ({
        name,
        amount: formatRealMoney(money.toString(), currency, { signed: true }),
        amountRaw: Number(money.toString()),
      }))
      .sort((a, b) => b.amountRaw - a.amountRaw)
      .slice(0, 5),
    profitByAccount: profitByAccountList.sort((a, b) => b.amountRaw - a.amountRaw).slice(0, 5),
    periodNav: {
      quarterOffset,
      yearOffset,
      minQuarterOffset,
      minYearOffset,
    },
    recentWithdrawals: recentWd.map((row) => ({
      id: row.withdrawal.id,
      amount: row.withdrawal.amount,
      currency: row.withdrawal.currency,
      status: row.withdrawal.status,
      firmName: row.firmName,
      requestedAt: row.withdrawal.requestedAt,
      receivedAt: row.withdrawal.receivedAt,
      accountLabel: accountDisplayName({
        label: row.accountLabel,
        accountNumber: row.accountNumber,
        firmName: row.firmName,
      }),
    })),
  };
}

/** Reference UI shows income yield to one decimal (e.g. 9.2%). */
function formatYieldOneDecimal(value: string): string {
  const cleaned = value.replace(/%/g, '').trim();
  const n = Number(cleaned);
  if (!Number.isFinite(n)) return value;
  return `${n.toFixed(1)}%`;
}

/** Hero ROI rounds to one decimal (e.g. +8.1%). */
function formatPercentOneDecimal(value: string): string {
  const cleaned = value.replace(/%/g, '').trim();
  const n = Number(cleaned);
  if (!Number.isFinite(n)) return value;
  const sign = n > 0 ? '+' : n < 0 ? '−' : '';
  return `${sign}${Math.abs(n).toFixed(1)}%`;
}

function clampOffset(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return max;
  return Math.min(max, Math.max(min, Math.trunc(value)));
}

/** UTC quarter index from an arbitrary epoch (year*4 + q). */
function utcQuarterIndex(d: Date): number {
  return d.getUTCFullYear() * 4 + Math.floor(d.getUTCMonth() / 3);
}

function quarterIndexDiff(earlier: Date, later: Date): number {
  return utcQuarterIndex(later) - utcQuarterIndex(earlier);
}

function shiftByQuarters(now: Date, offset: number): Date {
  const y = now.getUTCFullYear();
  const qStart = Math.floor(now.getUTCMonth() / 3) * 3;
  return new Date(Date.UTC(y, qStart + offset * 3, 15, 12, 0, 0, 0));
}

function shiftByYears(now: Date, offset: number): Date {
  return new Date(Date.UTC(now.getUTCFullYear() + offset, 6, 1, 12, 0, 0, 0));
}
