import { describe, expect, it } from 'vitest';
import { assertSafeZipPath } from './restore';
import { AppError } from '../errors';

describe('restore zip safety', () => {
  it('rejects zip slip and absolute paths', () => {
    expect(() => assertSafeZipPath('../etc/passwd')).toThrow(AppError);
    expect(() => assertSafeZipPath('/etc/passwd')).toThrow(AppError);
    expect(assertSafeZipPath('json/firms.json')).toBe('json/firms.json');
  });
});
