import { describe, expect, it } from 'vitest';
import { withdrawalCreateSchema } from './withdrawals';

describe('withdrawal validation', () => {
  it('accepts pending create input', () => {
    const parsed = withdrawalCreateSchema.parse({
      tradingAccountId: '11111111-1111-4111-8111-111111111111',
      amount: '250.50',
      status: 'PENDING',
      requestedAt: '2026-01-15T12:00:00.000Z',
    });
    expect(parsed.amount).toBe('250.50');
  });

  it('rejects zero amount', () => {
    expect(() =>
      withdrawalCreateSchema.parse({
        tradingAccountId: '11111111-1111-4111-8111-111111111111',
        amount: '0',
        requestedAt: '2026-01-15T12:00:00.000Z',
      }),
    ).toThrow();
  });
});
