import { Money } from '@fpm/money';
import { z } from 'zod';

export const withdrawalStatusSchema = z.enum(['PENDING', 'PAID', 'FAILED', 'REVERSED']);
export type WithdrawalStatus = z.infer<typeof withdrawalStatusSchema>;

export type WithdrawalRecord = {
  amount: string;
  currency: string;
  status: WithdrawalStatus;
  requestedAt: Date;
  receivedAt: Date | null;
};

/** Spec: recognized payout requires PAID + receivedAt. */
export function isRecognizedPayout(withdrawal: WithdrawalRecord): boolean {
  return withdrawal.status === 'PAID' && withdrawal.receivedAt !== null;
}

export function assertWithdrawalInvariants(input: {
  status: WithdrawalStatus;
  requestedAt: Date;
  receivedAt?: Date | null;
  amount: string;
  currency: string;
}): void {
  Money.fromString(input.amount, input.currency);
  if (input.status === 'PAID') {
    if (!input.receivedAt) {
      throw new Error('PAID withdrawals require receivedAt');
    }
    if (input.receivedAt.getTime() < input.requestedAt.getTime()) {
      throw new Error('receivedAt must be on or after requestedAt');
    }
  }
  if (input.status !== 'PAID' && input.receivedAt) {
    // Allow receivedAt only on PAID (clear on other statuses)
    throw new Error('receivedAt is only valid when status is PAID');
  }
}

const allowedTransitions: Record<WithdrawalStatus, WithdrawalStatus[]> = {
  PENDING: ['PAID', 'FAILED', 'REVERSED'],
  PAID: ['REVERSED'],
  FAILED: ['PENDING', 'PAID'],
  REVERSED: [],
};

export function assertStatusTransition(from: WithdrawalStatus, to: WithdrawalStatus): void {
  if (from === to) return;
  if (!allowedTransitions[from].includes(to)) {
    throw new Error(`Invalid withdrawal status transition ${from} → ${to}`);
  }
}

/** Sum recognized payouts per currency (no silent FX mix). */
export function sumRecognizedByCurrency(withdrawals: WithdrawalRecord[]): Record<string, string> {
  const totals: Record<string, Money> = {};
  for (const row of withdrawals) {
    if (!isRecognizedPayout(row)) continue;
    const money = Money.fromString(row.amount, row.currency);
    const existing = totals[money.currency];
    totals[money.currency] = existing ? existing.add(money) : money;
  }
  return Object.fromEntries(
    Object.entries(totals).map(([currency, money]) => [currency, money.toString()]),
  );
}

/** Pending amounts per currency. */
export function sumPendingByCurrency(withdrawals: WithdrawalRecord[]): Record<string, string> {
  const totals: Record<string, Money> = {};
  for (const row of withdrawals) {
    if (row.status !== 'PENDING') continue;
    const money = Money.fromString(row.amount, row.currency);
    const existing = totals[money.currency];
    totals[money.currency] = existing ? existing.add(money) : money;
  }
  return Object.fromEntries(
    Object.entries(totals).map(([currency, money]) => [currency, money.toString()]),
  );
}

/** Count of recognized payouts (PAID + receivedAt). */
export function countRecognizedPayouts(withdrawals: WithdrawalRecord[]): number {
  return withdrawals.filter(isRecognizedPayout).length;
}

/**
 * Sum recognized payouts whose receivedAt falls in [startInclusive, endExclusive).
 * Period edges are caller-supplied (workspace timezone → UTC instants).
 */
export function sumRecognizedInRange(
  withdrawals: WithdrawalRecord[],
  startInclusive: Date,
  endExclusive: Date,
): Record<string, string> {
  const startMs = startInclusive.getTime();
  const endMs = endExclusive.getTime();
  return sumRecognizedByCurrency(
    withdrawals.filter((row) => {
      if (!isRecognizedPayout(row) || !row.receivedAt) return false;
      const t = row.receivedAt.getTime();
      return t >= startMs && t < endMs;
    }),
  );
}

/** UTC calendar-month bounds [start, end) for period payout cards. */
export function utcMonthBounds(reference: Date = new Date()): {
  thisMonth: { start: Date; end: Date };
  lastMonth: { start: Date; end: Date };
} {
  const y = reference.getUTCFullYear();
  const m = reference.getUTCMonth();
  const thisStart = new Date(Date.UTC(y, m, 1, 0, 0, 0, 0));
  const thisEnd = new Date(Date.UTC(y, m + 1, 1, 0, 0, 0, 0));
  const lastStart = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0, 0));
  return {
    thisMonth: { start: thisStart, end: thisEnd },
    lastMonth: { start: lastStart, end: thisStart },
  };
}

export type ReportPeriod = 'month' | 'quarter' | 'year' | 'all';

/** Half-open UTC period bounds for reports. `all` returns null (no date filter). */
export function utcPeriodBounds(
  period: ReportPeriod,
  reference: Date = new Date(),
): { start: Date; end: Date } | null {
  if (period === 'all') return null;
  const y = reference.getUTCFullYear();
  const m = reference.getUTCMonth();
  if (period === 'month') {
    return {
      start: new Date(Date.UTC(y, m, 1, 0, 0, 0, 0)),
      end: new Date(Date.UTC(y, m + 1, 1, 0, 0, 0, 0)),
    };
  }
  if (period === 'quarter') {
    const qStart = Math.floor(m / 3) * 3;
    return {
      start: new Date(Date.UTC(y, qStart, 1, 0, 0, 0, 0)),
      end: new Date(Date.UTC(y, qStart + 3, 1, 0, 0, 0, 0)),
    };
  }
  return {
    start: new Date(Date.UTC(y, 0, 1, 0, 0, 0, 0)),
    end: new Date(Date.UTC(y + 1, 0, 1, 0, 0, 0, 0)),
  };
}

/**
 * Sum recognized payouts grouped by a caller-supplied key, still per currency
 * (never mixes FX). Optional period filter on receivedAt.
 */
export function sumRecognizedByKey(
  rows: Array<WithdrawalRecord & { key: string }>,
  range?: { start: Date; end: Date } | null,
  currencyFilter?: string | null,
): Record<string, Record<string, string>> {
  const totals: Record<string, Record<string, Money>> = {};
  const startMs = range?.start.getTime();
  const endMs = range?.end.getTime();
  const currency = currencyFilter?.trim().toUpperCase() || null;

  for (const row of rows) {
    if (!isRecognizedPayout(row) || !row.receivedAt) continue;
    if (currency && row.currency !== currency) continue;
    if (startMs !== undefined && endMs !== undefined) {
      const t = row.receivedAt.getTime();
      if (t < startMs || t >= endMs) continue;
    }
    const money = Money.fromString(row.amount, row.currency);
    const bucket = totals[row.key] ?? (totals[row.key] = {});
    const existing = bucket[money.currency];
    bucket[money.currency] = existing ? existing.add(money) : money;
  }

  return Object.fromEntries(
    Object.entries(totals).map(([key, byCurrency]) => [
      key,
      Object.fromEntries(
        Object.entries(byCurrency).map(([code, money]) => [code, money.toString()]),
      ),
    ]),
  );
}

export function countWithdrawalsByStatus(
  withdrawals: Array<{ status: WithdrawalStatus }>,
): Record<WithdrawalStatus, number> {
  const counts: Record<WithdrawalStatus, number> = {
    PENDING: 0,
    PAID: 0,
    FAILED: 0,
    REVERSED: 0,
  };
  for (const row of withdrawals) {
    counts[row.status] += 1;
  }
  return counts;
}

/** Spec §8: scale toSize must exceed fromSize (strict). */
export function assertScaleSizes(input: {
  fromSize: string;
  toSize: string;
  currency: string;
}): void {
  const from = Money.fromString(input.fromSize, input.currency);
  const to = Money.fromString(input.toSize, input.currency);
  if (!from.isPositive() || !to.isPositive()) {
    throw new Error('Scale sizes must be greater than zero');
  }
  if (!to.amount.greaterThan(from.amount)) {
    throw new Error('toSize must be greater than fromSize');
  }
}

export type ScaleEventSizeRow = {
  id: string;
  toSize: string;
  scaledAt: Date;
};

/**
 * ADR-011 / OQ-016: authoritative currentSize after scale CRUD.
 * Latest event by scaledAt DESC, then id DESC; none → initialSize.
 */
export function resolveCurrentSizeFromScaleEvents(
  events: ScaleEventSizeRow[],
  initialSize: string,
): string {
  if (events.length === 0) return initialSize.trim();
  const sorted = [...events].sort((a, b) => {
    const byDate = b.scaledAt.getTime() - a.scaledAt.getTime();
    if (byDate !== 0) return byDate;
    return b.id.localeCompare(a.id);
  });
  return sorted[0]!.toSize.trim();
}

export type BrokerCashflow = {
  amount: string;
  currency: string;
};

/** Sum positive cashflows per currency (deposits or withdrawals). */
export function sumBrokerCashflowsByCurrency(rows: BrokerCashflow[]): Record<string, string> {
  const totals: Record<string, Money> = {};
  for (const row of rows) {
    const money = Money.fromString(row.amount, row.currency);
    if (!money.isPositive()) {
      throw new Error('Broker cashflow amounts must be greater than zero');
    }
    const existing = totals[money.currency];
    totals[money.currency] = existing ? existing.add(money) : money;
  }
  return Object.fromEntries(
    Object.entries(totals).map(([currency, money]) => [currency, money.toString()]),
  );
}

/**
 * Net deposited = deposits − withdrawals for a single currency account.
 * Throws on currency mismatch (no silent FX).
 */
export function netDeposited(input: {
  currency: string;
  deposits: BrokerCashflow[];
  withdrawals: BrokerCashflow[];
}): string {
  const code = input.currency.trim().toUpperCase();
  let deposits = Money.fromString('0', code);
  let withdrawals = Money.fromString('0', code);
  for (const row of input.deposits) {
    const money = Money.fromString(row.amount, row.currency);
    if (money.currency !== code) throw new Error('Deposit currency must match account currency');
    deposits = deposits.add(money);
  }
  for (const row of input.withdrawals) {
    const money = Money.fromString(row.amount, row.currency);
    if (money.currency !== code) throw new Error('Withdrawal currency must match account currency');
    withdrawals = withdrawals.add(money);
  }
  return deposits.sub(withdrawals).toString();
}

/** Spec: ROI denominator zero → N/A (not Infinity). Formula itself still OQ-003. */
export function formatReturnOrNA(numerator: string, denominator: string, currency: string): string {
  const denom = Money.fromString(denominator, currency);
  if (denom.amount.isZero()) return 'N/A';
  const num = Money.fromString(numerator, currency);
  const pct = num.amount.div(denom.amount).times(100);
  return `${pct.toFixed(2)}%`;
}

export type AccountSizeRow = {
  initialSize: string;
  currentSize: string;
  currency: string;
};

function sumSizeField(
  rows: AccountSizeRow[],
  field: 'initialSize' | 'currentSize',
): Record<string, string> {
  const totals: Record<string, Money> = {};
  for (const row of rows) {
    const money = Money.fromString(row[field], row.currency);
    const existing = totals[money.currency];
    totals[money.currency] = existing ? existing.add(money) : money;
  }
  return Object.fromEntries(
    Object.entries(totals).map(([currency, money]) => [currency, money.toString()]),
  );
}

/** ADR-014 / OQ-001: total funded capital = SUM(initialSize) per currency. */
export function sumTotalFundedCapitalByCurrency(rows: AccountSizeRow[]): Record<string, string> {
  return sumSizeField(rows, 'initialSize');
}

/** ADR-014 / OQ-001: current funded capital = SUM(currentSize) per currency. */
export function sumCurrentFundedCapitalByCurrency(rows: AccountSizeRow[]): Record<string, string> {
  return sumSizeField(rows, 'currentSize');
}

/** ADR-014: portfolio growth % per currency; N/A if initial = 0. */
export function portfolioGrowthByCurrency(rows: AccountSizeRow[]): Record<string, string> {
  const initial = sumTotalFundedCapitalByCurrency(rows);
  const current = sumCurrentFundedCapitalByCurrency(rows);
  const currencies = new Set([...Object.keys(initial), ...Object.keys(current)]);
  const out: Record<string, string> = {};
  for (const currency of currencies) {
    const init = Money.fromString(initial[currency] ?? '0', currency);
    if (init.amount.isZero()) {
      out[currency] = 'N/A';
      continue;
    }
    const cur = Money.fromString(current[currency] ?? '0', currency);
    out[currency] = `${cur.amount.minus(init.amount).div(init.amount).times(100).toFixed(2)}%`;
  }
  return out;
}

/** Inclusive UTC month count from earliest receivedAt through `now` (OQ-017 / ADR-014). */
export function inclusiveUtcMonthCount(
  withdrawals: WithdrawalRecord[],
  now: Date = new Date(),
): number | null {
  const recognized = withdrawals.filter(isRecognizedPayout);
  if (recognized.length === 0) return null;
  let earliest = recognized[0]!.receivedAt!;
  for (const row of recognized) {
    if (row.receivedAt!.getTime() < earliest.getTime()) earliest = row.receivedAt!;
  }
  const startY = earliest.getUTCFullYear();
  const startM = earliest.getUTCMonth();
  const endY = now.getUTCFullYear();
  const endM = now.getUTCMonth();
  return (endY - startY) * 12 + (endM - startM) + 1;
}

export function averagePayoutByCurrency(withdrawals: WithdrawalRecord[]): Record<string, string> {
  const sums: Record<string, Money> = {};
  const counts: Record<string, number> = {};
  for (const row of withdrawals) {
    if (!isRecognizedPayout(row)) continue;
    const money = Money.fromString(row.amount, row.currency);
    sums[money.currency] = sums[money.currency] ? sums[money.currency]!.add(money) : money;
    counts[money.currency] = (counts[money.currency] ?? 0) + 1;
  }
  const out: Record<string, string> = {};
  for (const [currency, money] of Object.entries(sums)) {
    const n = counts[currency] ?? 0;
    out[currency] = n === 0 ? 'N/A' : money.amount.div(n).toFixed();
  }
  return out;
}

export function averageMonthlyIncomeByCurrency(
  withdrawals: WithdrawalRecord[],
  now: Date = new Date(),
): Record<string, string> {
  const months = inclusiveUtcMonthCount(withdrawals, now);
  const lifetime = sumRecognizedByCurrency(withdrawals);
  if (months === null) {
    return Object.fromEntries(Object.keys(lifetime).map((c) => [c, 'N/A']));
  }
  const out: Record<string, string> = {};
  for (const [currency, amount] of Object.entries(lifetime)) {
    out[currency] = Money.fromString(amount, currency).amount.div(months).toFixed();
  }
  return out;
}

export function incomeYieldByCurrency(
  withdrawals: WithdrawalRecord[],
  accounts: AccountSizeRow[],
): Record<string, string> {
  const income = sumRecognizedByCurrency(withdrawals);
  const capital = sumCurrentFundedCapitalByCurrency(accounts);
  const currencies = new Set([...Object.keys(income), ...Object.keys(capital)]);
  const out: Record<string, string> = {};
  for (const currency of currencies) {
    const cap = Money.fromString(capital[currency] ?? '0', currency);
    if (cap.amount.isZero()) {
      out[currency] = 'N/A';
      continue;
    }
    const inc = Money.fromString(income[currency] ?? '0', currency);
    out[currency] = `${inc.amount.div(cap.amount).times(100).toFixed(2)}%`;
  }
  return out;
}

export function largestRecognizedByCurrency(
  withdrawals: WithdrawalRecord[],
): Record<string, string> {
  const best: Record<string, Money> = {};
  for (const row of withdrawals) {
    if (!isRecognizedPayout(row)) continue;
    const money = Money.fromString(row.amount, row.currency);
    const existing = best[money.currency];
    if (!existing || money.amount.greaterThan(existing.amount)) best[money.currency] = money;
  }
  return Object.fromEntries(
    Object.entries(best).map(([currency, money]) => [currency, money.toString()]),
  );
}

export function bestMonthByCurrency(
  withdrawals: WithdrawalRecord[],
): Record<string, { month: string; amount: string }> {
  const buckets: Record<string, Record<string, Money>> = {};
  for (const row of withdrawals) {
    if (!isRecognizedPayout(row) || !row.receivedAt) continue;
    const month = `${row.receivedAt.getUTCFullYear()}-${String(row.receivedAt.getUTCMonth() + 1).padStart(2, '0')}`;
    const money = Money.fromString(row.amount, row.currency);
    const byMonth = buckets[money.currency] ?? (buckets[money.currency] = {});
    byMonth[month] = byMonth[month] ? byMonth[month]!.add(money) : money;
  }
  const out: Record<string, { month: string; amount: string }> = {};
  for (const [currency, byMonth] of Object.entries(buckets)) {
    let topMonth = '';
    let topMoney: Money | null = null;
    for (const [month, money] of Object.entries(byMonth)) {
      if (!topMoney || money.amount.greaterThan(topMoney.amount)) {
        topMoney = money;
        topMonth = month;
      }
    }
    if (topMoney) out[currency] = { month: topMonth, amount: topMoney.toString() };
  }
  return out;
}

/**
 * ADR-014 / OQ-003: broker net P/L = latestEquity + withdrawals − deposits.
 * N/A when latest equity missing.
 */
export function brokerNetProfitLoss(input: {
  currency: string;
  latestEquity: string | null;
  deposits: BrokerCashflow[];
  withdrawals: BrokerCashflow[];
}): string {
  if (input.latestEquity == null) return 'N/A';
  const code = input.currency.trim().toUpperCase();
  let deposits = Money.fromString('0', code);
  let withdrawals = Money.fromString('0', code);
  for (const row of input.deposits) {
    deposits = deposits.add(Money.fromString(row.amount, row.currency));
  }
  for (const row of input.withdrawals) {
    withdrawals = withdrawals.add(Money.fromString(row.amount, row.currency));
  }
  const equity = Money.fromString(input.latestEquity, code);
  return equity.add(withdrawals).sub(deposits).toString();
}

export function brokerRoi(input: {
  currency: string;
  latestEquity: string | null;
  deposits: BrokerCashflow[];
  withdrawals: BrokerCashflow[];
}): string {
  const pnl = brokerNetProfitLoss(input);
  if (pnl === 'N/A') return 'N/A';
  const code = input.currency.trim().toUpperCase();
  let deposits = Money.fromString('0', code);
  for (const row of input.deposits) {
    deposits = deposits.add(Money.fromString(row.amount, row.currency));
  }
  return formatReturnOrNA(pnl, deposits.toString(), code);
}

export type EquityPoint = { id: string; equity: string; snapshotDate: Date; currency: string };

/** ADR-014 / OQ-005: peak equity among snapshots. */
export function peakEquity(points: EquityPoint[]): { equity: string; currency: string } | null {
  if (points.length === 0) return null;
  const sorted = [...points].sort((a, b) => {
    const byAmt = Money.fromString(b.equity, b.currency).amount.comparedTo(
      Money.fromString(a.equity, a.currency).amount,
    );
    if (byAmt !== 0) return byAmt;
    const byDate = b.snapshotDate.getTime() - a.snapshotDate.getTime();
    if (byDate !== 0) return byDate;
    return b.id.localeCompare(a.id);
  });
  const top = sorted[0]!;
  return { equity: top.equity, currency: top.currency };
}

/** ADR-014 / OQ-004: drawdown from peak to latest. */
export function equityDrawdownPercent(input: {
  peakEquity: string | null;
  latestEquity: string | null;
  currency: string;
}): string {
  if (input.peakEquity == null || input.latestEquity == null) return 'N/A';
  const peak = Money.fromString(input.peakEquity, input.currency);
  if (peak.amount.isZero()) return 'N/A';
  const latest = Money.fromString(input.latestEquity, input.currency);
  return `${peak.amount.minus(latest.amount).div(peak.amount).times(100).toFixed(2)}%`;
}

/**
 * ADR-014 / OQ-012: combine same-currency maps only.
 * Returns null when currencies are mixed or empty.
 */
export function combineSameCurrencyMaps(
  a: Record<string, string>,
  b: Record<string, string>,
): { currency: string; amount: string } | null {
  const currencies = new Set([...Object.keys(a), ...Object.keys(b)]);
  if (currencies.size !== 1) return null;
  const currency = [...currencies][0]!;
  const total = Money.fromString(a[currency] ?? '0', currency).add(
    Money.fromString(b[currency] ?? '0', currency),
  );
  return { currency, amount: total.toString() };
}
