import { describe, expect, it } from 'vitest';
import { sumRecognizedByKey, utcPeriodBounds } from './index';

describe('report period helpers', () => {
  it('builds UTC quarter and year bounds', () => {
    const q = utcPeriodBounds('quarter', new Date('2026-09-15T00:00:00.000Z'));
    expect(q?.start.toISOString()).toBe('2026-07-01T00:00:00.000Z');
    expect(q?.end.toISOString()).toBe('2026-10-01T00:00:00.000Z');
    expect(utcPeriodBounds('all')).toBeNull();
  });

  it('groups recognized income by key without mixing currencies', () => {
    const grouped = sumRecognizedByKey(
      [
        {
          key: 'Firm A',
          amount: '100',
          currency: 'USD',
          status: 'PAID',
          requestedAt: new Date('2026-01-01'),
          receivedAt: new Date('2026-09-10'),
        },
        {
          key: 'Firm A',
          amount: '40',
          currency: 'EUR',
          status: 'PAID',
          requestedAt: new Date('2026-01-01'),
          receivedAt: new Date('2026-09-11'),
        },
        {
          key: 'Firm B',
          amount: '25',
          currency: 'USD',
          status: 'PAID',
          requestedAt: new Date('2026-01-01'),
          receivedAt: new Date('2026-09-12'),
        },
      ],
      null,
      null,
    );
    expect(grouped['Firm A']).toEqual({ USD: '100', EUR: '40' });
    expect(grouped['Firm B']).toEqual({ USD: '25' });
  });
});
