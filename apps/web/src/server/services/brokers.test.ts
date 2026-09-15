import { describe, expect, it } from 'vitest';
import { formatReturnOrNA, netDeposited } from '@fpm/financial';

describe('broker service domain wiring', () => {
  it('exposes net deposited and N/A ROI helper', () => {
    expect(
      netDeposited({
        currency: 'USD',
        deposits: [{ amount: '5', currency: 'USD' }],
        withdrawals: [],
      }),
    ).toBe('5');
    expect(formatReturnOrNA('1', '0', 'USD')).toBe('N/A');
  });
});
