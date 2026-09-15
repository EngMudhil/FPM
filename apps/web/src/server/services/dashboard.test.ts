import { describe, expect, it } from 'vitest';
import { sumRecognizedInRange, utcMonthBounds } from '@fpm/financial';

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
});
