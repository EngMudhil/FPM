import { describe, expect, it } from 'vitest';
import {
  isRecognizedPayout,
  sumRecognizedByCurrency,
  sumRecognizedInRange,
  utcMonthBounds,
} from '@fpm/financial';

/** FPM-019: assert NEW date basis ≠ old requestedAt period behavior. */
describe('QA regression: receivedAt recognition', () => {
  it('does not recognize PAID without receivedAt', () => {
    expect(
      isRecognizedPayout({
        amount: '100',
        currency: 'USD',
        status: 'PAID',
        requestedAt: new Date('2026-09-01'),
        receivedAt: null,
      }),
    ).toBe(false);
  });

  it('period totals ignore requestedAt-only PAID rows', () => {
    const bounds = utcMonthBounds(new Date('2026-09-15T00:00:00.000Z'));
    const rows = [
      {
        amount: '100',
        currency: 'USD',
        status: 'PAID' as const,
        requestedAt: new Date('2026-09-10'),
        receivedAt: null,
      },
      {
        amount: '40',
        currency: 'USD',
        status: 'PAID' as const,
        requestedAt: new Date('2026-08-01'),
        receivedAt: new Date('2026-09-05'),
      },
    ];
    expect(sumRecognizedByCurrency(rows)).toEqual({ USD: '40' });
    expect(sumRecognizedInRange(rows, bounds.thisMonth.start, bounds.thisMonth.end)).toEqual({
      USD: '40',
    });
  });
});
