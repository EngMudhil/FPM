import { describe, expect, it } from 'vitest';
import { getServerEnv, resetEnvCache } from './env';

describe('getServerEnv', () => {
  it('fails when DATABASE_URL is missing', () => {
    resetEnvCache();
    expect(() =>
      getServerEnv({
        AUTH_SECRET: 'x'.repeat(32),
      } as unknown as NodeJS.ProcessEnv),
    ).toThrow(/DATABASE_URL/);
  });

  it('fails when AUTH_SECRET is too short', () => {
    resetEnvCache();
    expect(() =>
      getServerEnv({
        DATABASE_URL: 'postgresql://fpm:fpm@localhost:5432/fpm',
        AUTH_SECRET: 'short',
      } as unknown as NodeJS.ProcessEnv),
    ).toThrow(/AUTH_SECRET/);
  });

  it('loads valid configuration', () => {
    resetEnvCache();
    const env = getServerEnv({
      DATABASE_URL: 'postgresql://fpm:fpm@localhost:5432/fpm',
      AUTH_SECRET: 'x'.repeat(32),
      NODE_ENV: 'test',
    } as unknown as NodeJS.ProcessEnv);
    expect(env.DATABASE_URL).toContain('postgresql://');
    expect(env.SESSION_MAX_AGE_SECONDS).toBe(7200);
  });
});
