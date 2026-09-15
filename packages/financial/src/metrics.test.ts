import { describe, expect, it } from 'vitest';
import {
  averageMonthlyIncomeByCurrency,
  averagePayoutByCurrency,
  brokerNetProfitLoss,
  brokerRoi,
  combineSameCurrencyMaps,
  equityDrawdownPercent,
  equityDrawdownAmountExclWithdrawals,
  inclusiveUtcMonthCount,
  peakEquity,
  portfolioGrowthByCurrency,
  sumCurrentFundedCapitalByCurrency,
  sumTotalFundedCapitalByCurrency,
} from './index';

describe('ADR-014 capital and growth', () => {
  const accounts = [
    { initialSize: '100000', currentSize: '150000', currency: 'USD' },
    { initialSize: '50000', currentSize: '50000', currency: 'EUR' },
  ];

  it('sums total and current capital per currency', () => {
    expect(sumTotalFundedCapitalByCurrency(accounts)).toEqual({ USD: '100000', EUR: '50000' });
    expect(sumCurrentFundedCapitalByCurrency(accounts)).toEqual({ USD: '150000', EUR: '50000' });
  });

  it('computes portfolio growth with N/A on zero initial', () => {
    expect(portfolioGrowthByCurrency(accounts).USD).toBe('50.00%');
    expect(portfolioGrowthByCurrency(accounts).EUR).toBe('0.00%');
    expect(
      portfolioGrowthByCurrency([{ initialSize: '0', currentSize: '10', currency: 'USD' }]).USD,
    ).toBe('N/A');
  });
});

describe('ADR-014 income averages', () => {
  const rows = [
    {
      amount: '100',
      currency: 'USD',
      status: 'PAID' as const,
      requestedAt: new Date('2026-01-01'),
      receivedAt: new Date('2026-01-15'),
    },
    {
      amount: '50',
      currency: 'USD',
      status: 'PAID' as const,
      requestedAt: new Date('2026-01-01'),
      receivedAt: new Date('2026-03-15'),
    },
  ];

  it('averages payouts and inclusive months', () => {
    expect(averagePayoutByCurrency(rows).USD).toBe('75.00');
    expect(inclusiveUtcMonthCount(rows, new Date('2026-03-20T00:00:00.000Z'))).toBe(3);
    expect(averageMonthlyIncomeByCurrency(rows, new Date('2026-03-20T00:00:00.000Z')).USD).toBe(
      '50.00',
    );
  });
});

describe('ADR-014 broker and drawdown', () => {
  it('computes P/L and ROI with N/A rules', () => {
    expect(
      brokerNetProfitLoss({
        currency: 'USD',
        latestEquity: '1200',
        deposits: [{ amount: '1000', currency: 'USD' }],
        withdrawals: [{ amount: '100', currency: 'USD' }],
      }),
    ).toBe('300');
    expect(
      brokerRoi({
        currency: 'USD',
        latestEquity: '1200',
        deposits: [],
        withdrawals: [],
      }),
    ).toBe('N/A');
  });

  it('peak and drawdown', () => {
    const peak = peakEquity([
      { id: 'a', equity: '100', snapshotDate: new Date('2026-01-01'), currency: 'USD' },
      { id: 'b', equity: '150', snapshotDate: new Date('2026-02-01'), currency: 'USD' },
    ]);
    expect(peak?.equity).toBe('150');
    expect(equityDrawdownPercent({ peakEquity: '150', latestEquity: '120', currency: 'USD' })).toBe(
      '20.00%',
    );
    expect(
      equityDrawdownAmountExclWithdrawals({
        peakEquity: '8644',
        latestEquity: '8000',
        withdrawalsTotal: '644',
        currency: 'USD',
      }),
    ).toBe('0.00');
    expect(
      equityDrawdownAmountExclWithdrawals({
        peakEquity: '1000',
        latestEquity: '800',
        withdrawalsTotal: '0',
        currency: 'USD',
      }),
    ).toBe('200.00');
  });

  it('combines only same currency', () => {
    expect(combineSameCurrencyMaps({ USD: '10' }, { USD: '5' })).toEqual({
      currency: 'USD',
      amount: '15',
    });
    expect(combineSameCurrencyMaps({ USD: '10' }, { EUR: '5' })).toBeNull();
  });
});
