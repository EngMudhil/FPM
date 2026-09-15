import { describe, expect, it } from 'vitest';
import { formatReturnOrNA, netDeposited } from './index';

describe('broker cashflow helpers', () => {
  it('computes net deposited in one currency', () => {
    expect(
      netDeposited({
        currency: 'USD',
        deposits: [{ amount: '1000', currency: 'USD' }],
        withdrawals: [{ amount: '250', currency: 'USD' }],
      }),
    ).toBe('750');
  });

  it('returns N/A when ROI denominator is zero', () => {
    expect(formatReturnOrNA('10', '0', 'USD')).toBe('N/A');
    expect(formatReturnOrNA('10', '100', 'USD')).toBe('10.00%');
  });
});
