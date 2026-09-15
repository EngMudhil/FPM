import { describe, expect, it } from 'vitest';
import { accountCreateSchema } from './accounts';
import { accountDisplayName } from '../services/accounts';

describe('account validation', () => {
  it('requires firm, sizes, and currency', () => {
    const parsed = accountCreateSchema.parse({
      firmId: '11111111-1111-4111-8111-111111111111',
      initialSize: '100000.00',
      currency: 'usd',
    });
    expect(parsed.currency).toBe('USD');
    expect(parsed.phase).toBe('ACTIVE');
  });

  it('rejects float-looking invalid sizes', () => {
    expect(() =>
      accountCreateSchema.parse({
        firmId: '11111111-1111-4111-8111-111111111111',
        initialSize: 'abc',
        currency: 'USD',
      }),
    ).toThrow();
  });
});

describe('accountDisplayName', () => {
  it('prefers label, then firm + number', () => {
    expect(accountDisplayName({ label: 'Main', accountNumber: '1', firmName: 'FTMO' })).toBe(
      'Main',
    );
    expect(accountDisplayName({ accountNumber: '99', firmName: 'FTMO' })).toBe('FTMO · 99');
  });
});
