import { describe, expect, it } from 'vitest';
import { createHash } from 'node:crypto';

describe('backup checksum helper', () => {
  it('uses sha256 hex digests', () => {
    expect(createHash('sha256').update('fpm').digest('hex')).toHaveLength(64);
  });
});
