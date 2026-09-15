import { describe, expect, it } from 'vitest';
import {
  assertStatusTransition,
  assertWithdrawalInvariants,
  countRecognizedPayouts,
  isRecognizedPayout,
  sumPendingByCurrency,
  sumRecognizedByCurrency,
  sumRecognizedInRange,
  utcMonthBounds,
} from './index';

describe('withdrawal recognition', () => {
  it('requires PAID and receivedAt', () => {
    expect(
      isRecognizedPayout({
        amount: '100',
        currency: 'USD',
        status: 'PAID',
        requestedAt: new Date('2026-01-01'),
        receivedAt: new Date('2026-01-02'),
      }),
    ).toBe(true);
    expect(
      isRecognizedPayout({
        amount: '100',
        currency: 'USD',
        status: 'PAID',
        requestedAt: new Date('2026-01-01'),
        receivedAt: null,
      }),
    ).toBe(false);
  });

  it('enforces PAID invariants', () => {
    expect(() =>
      assertWithdrawalInvariants({
        status: 'PAID',
        requestedAt: new Date('2026-01-02'),
        receivedAt: new Date('2026-01-01'),
        amount: '10',
        currency: 'USD',
      }),
    ).toThrow(/receivedAt must be on or after/);
  });

  it('sums recognized and pending per currency without mixing', () => {
    const rows = [
      {
        amount: '10',
        currency: 'USD',
        status: 'PAID' as const,
        requestedAt: new Date('2026-01-01'),
        receivedAt: new Date('2026-01-02'),
      },
      {
        amount: '5',
        currency: 'EUR',
        status: 'PAID' as const,
        requestedAt: new Date('2026-01-01'),
        receivedAt: new Date('2026-01-02'),
      },
      {
        amount: '3',
        currency: 'USD',
        status: 'PENDING' as const,
        requestedAt: new Date('2026-01-01'),
        receivedAt: null,
      },
    ];
    expect(sumRecognizedByCurrency(rows)).toEqual({ USD: '10', EUR: '5' });
    expect(sumPendingByCurrency(rows)).toEqual({ USD: '3' });
  });

  it('blocks illegal transitions including PAID → PENDING', () => {
    expect(() => assertStatusTransition('PAID', 'PENDING')).toThrow();
    expect(() => assertStatusTransition('PENDING', 'PAID')).not.toThrow();
    expect(() => assertStatusTransition('PAID', 'REVERSED')).not.toThrow();
  });
});

describe('period recognized payouts', () => {
  it('buckets by receivedAt in half-open range', () => {
    const rows = [
      {
        amount: '100',
        currency: 'USD',
        status: 'PAID' as const,
        requestedAt: new Date('2026-01-01'),
        receivedAt: new Date('2026-09-10T12:00:00.000Z'),
      },
      {
        amount: '50',
        currency: 'USD',
        status: 'PAID' as const,
        requestedAt: new Date('2026-01-01'),
        receivedAt: new Date('2026-08-15T12:00:00.000Z'),
      },
      {
        amount: '25',
        currency: 'USD',
        status: 'PENDING' as const,
        requestedAt: new Date('2026-09-01'),
        receivedAt: null,
      },
    ];
    const bounds = utcMonthBounds(new Date('2026-09-15T00:00:00.000Z'));
    expect(sumRecognizedInRange(rows, bounds.thisMonth.start, bounds.thisMonth.end)).toEqual({
      USD: '100',
    });
    expect(sumRecognizedInRange(rows, bounds.lastMonth.start, bounds.lastMonth.end)).toEqual({
      USD: '50',
    });
    expect(countRecognizedPayouts(rows)).toBe(2);
  });
});
