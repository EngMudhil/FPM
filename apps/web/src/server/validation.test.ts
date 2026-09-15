import { describe, expect, it } from 'vitest';
import { AppError, toPublicError } from '../server/errors';
import {
  emailSchema,
  idSchema,
  loginInputSchema,
  moneyInputSchema,
  paginationSchema,
} from '../server/validation';

describe('validation foundation', () => {
  it('accepts valid login input', () => {
    const parsed = loginInputSchema.parse({
      email: 'Owner@FPM.local',
      password: 'secret',
    });
    expect(parsed.email).toBe('owner@fpm.local');
  });

  it('rejects invalid email and id', () => {
    expect(() => emailSchema.parse('not-an-email')).toThrow();
    expect(() => idSchema.parse('not-a-uuid')).toThrow();
  });

  it('rejects invalid money amount', () => {
    expect(() => moneyInputSchema.parse({ amount: '1.2.3', currency: 'USD' })).toThrow();
  });

  it('applies pagination defaults', () => {
    expect(paginationSchema.parse({})).toEqual({ page: 1, pageSize: 20 });
  });
});

describe('error foundation', () => {
  it('maps AppError without leaking internals', () => {
    const err = new AppError('FORBIDDEN', 'Workspace access denied', 403);
    expect(toPublicError(err)).toEqual({
      code: 'FORBIDDEN',
      message: 'Workspace access denied',
      status: 403,
    });
  });

  it('hides unexpected errors from clients', () => {
    expect(toPublicError(new Error('SELECT * FROM secrets'))).toEqual({
      code: 'INTERNAL',
      message: 'An unexpected error occurred',
      status: 500,
    });
  });
});
