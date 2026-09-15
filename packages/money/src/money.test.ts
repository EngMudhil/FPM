import { describe, expect, it } from 'vitest';
import { Money, parseMoneyInput } from './index';

describe('Money', () => {
  it('adds exact decimals without floating error', () => {
    const a = Money.fromString('0.1', 'USD');
    const b = Money.fromString('0.2', 'USD');
    expect(a.add(b).toString()).toBe('0.3');
  });

  it('rejects mixed currency addition', () => {
    const a = Money.fromString('1', 'USD');
    const b = Money.fromString('1', 'EUR');
    expect(() => a.add(b)).toThrow(/Currency mismatch/);
  });

  it('serializes as string amount', () => {
    expect(Money.fromString('10.50', 'usd').toJSON()).toEqual({
      amount: '10.5',
      currency: 'USD',
    });
  });

  it('parses validated input', () => {
    const money = parseMoneyInput({ amount: '100.00', currency: 'usd' });
    expect(money.currency).toBe('USD');
    expect(money.isPositive()).toBe(true);
  });
});
