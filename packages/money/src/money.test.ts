import { describe, expect, it } from 'vitest';
import { Money, parseMoneyInput, formatDisplayMoney, formatDisplayPercent } from './index';

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

describe('formatDisplayMoney', () => {
  it('formats USD with $ and thousands separators', () => {
    expect(formatDisplayMoney('820000', 'USD')).toBe('$820,000');
    expect(formatDisplayMoney('8517.5', 'USD')).toBe('$8,517.5');
    expect(formatDisplayMoney('2966.66666666', 'USD')).toBe('$2,966.67');
  });

  it('formats funded (0dp compact) and real (2dp forced) styles', () => {
    expect(formatDisplayMoney('820000', 'USD', { decimals: 0, compact: true })).toBe('$820,000');
    expect(formatDisplayMoney('1500000', 'USD', { decimals: 0, compact: true })).toBe('$1.5M');
    expect(formatDisplayMoney('8000', 'USD', { decimals: 2, forceFraction: true })).toBe(
      '$8,000.00',
    );
    expect(
      formatDisplayMoney('644', 'USD', { decimals: 2, forceFraction: true, signed: true }),
    ).toBe('+$644.00');
  });

  it('formats non-USD with code suffix', () => {
    expect(formatDisplayMoney('900', 'EUR')).toBe('900 EUR');
  });
});

describe('formatDisplayPercent', () => {
  it('normalizes percent strings', () => {
    expect(formatDisplayPercent('28.571')).toBe('28.57%');
    expect(formatDisplayPercent('N/A')).toBe('N/A');
  });
});
