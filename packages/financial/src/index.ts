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
