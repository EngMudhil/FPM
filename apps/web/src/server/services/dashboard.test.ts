import { describe, expect, it } from 'vitest';
import { sumRecognizedInRange, utcMonthBounds, utcPeriodBounds } from '@fpm/financial';

describe('dashboard domain wiring', () => {
  it('uses financial period helpers for month cards', () => {
    const bounds = utcMonthBounds(new Date('2026-09-15T00:00:00.000Z'));
    expect(
      sumRecognizedInRange(
        [
          {
            amount: '10',
            currency: 'USD',
            status: 'PAID',
            requestedAt: new Date('2026-09-01'),
            receivedAt: new Date('2026-09-05'),
          },
        ],
        bounds.thisMonth.start,
        bounds.thisMonth.end,
      ),
    ).toEqual({ USD: '10' });
  });

  it('shifts quarter bounds for period navigation', () => {
    const now = new Date('2026-09-15T00:00:00.000Z');
    const current = utcPeriodBounds('quarter', now)!;
    const priorRef = new Date(Date.UTC(2026, 3, 15)); // Q2
    const prior = utcPeriodBounds('quarter', priorRef)!;
    expect(current.start.toISOString()).toBe('2026-07-01T00:00:00.000Z');
    expect(prior.start.toISOString()).toBe('2026-04-01T00:00:00.000Z');
    expect(
      sumRecognizedInRange(
        [
          {
            amount: '100',
            currency: 'USD',
            status: 'PAID',
            requestedAt: new Date('2026-05-01'),
            receivedAt: new Date('2026-05-10'),
          },
        ],
        prior.start,
        prior.end,
      ),
    ).toEqual({ USD: '100' });
  });
});
