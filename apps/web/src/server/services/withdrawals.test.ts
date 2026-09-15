import { describe, expect, it } from 'vitest';
import {
  assertStatusTransition,
  isRecognizedPayout,
  sumRecognizedByCurrency,
} from '@fpm/financial';

describe('web financial domain wiring', () => {
  it('exposes recognized payout rules to the app layer', () => {
    expect(
      isRecognizedPayout({
        amount: '1',
        currency: 'USD',
        status: 'PAID',
        requestedAt: new Date('2026-01-01T00:00:00Z'),
        receivedAt: new Date('2026-01-02T00:00:00Z'),
      }),
    ).toBe(true);
    expect(() => assertStatusTransition('PAID', 'FAILED')).toThrow();
    expect(
      sumRecognizedByCurrency([
        {
          amount: '0.1',
          currency: 'USD',
          status: 'PAID',
          requestedAt: new Date('2026-01-01T00:00:00Z'),
          receivedAt: new Date('2026-01-02T00:00:00Z'),
        },
        {
          amount: '0.2',
          currency: 'USD',
          status: 'PAID',
          requestedAt: new Date('2026-01-01T00:00:00Z'),
          receivedAt: new Date('2026-01-03T00:00:00Z'),
        },
      ]).USD,
    ).toBe('0.3');
  });
});
