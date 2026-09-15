import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from './password';

describe('password hashing', () => {
  it('hashes and verifies without storing plaintext', async () => {
    const password = 'CorrectHorseBattery1!';
    const hash = await hashPassword(password);
    expect(hash).not.toContain(password);
    expect(hash.startsWith('$2')).toBe(true);
    expect(await verifyPassword(password, hash)).toBe(true);
    expect(await verifyPassword('wrong', hash)).toBe(false);
  });
});
