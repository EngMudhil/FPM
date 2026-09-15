import { describe, expect, it } from 'vitest';
import { AppError } from '../errors';
import { assertLastOwnerSafe } from './workspace';

describe('assertLastOwnerSafe', () => {
  it('blocks demoting the last OWNER', () => {
    expect(() =>
      assertLastOwnerSafe({ currentRole: 'OWNER', nextRole: 'ADMIN', ownerCount: 1 }),
    ).toThrow(AppError);
  });

  it('blocks removing the last OWNER', () => {
    expect(() =>
      assertLastOwnerSafe({ currentRole: 'OWNER', nextRole: null, ownerCount: 1 }),
    ).toThrow(/last OWNER/);
  });

  it('allows demoting when another OWNER exists', () => {
    expect(() =>
      assertLastOwnerSafe({ currentRole: 'OWNER', nextRole: 'MEMBER', ownerCount: 2 }),
    ).not.toThrow();
  });

  it('allows removing non-owners', () => {
    expect(() =>
      assertLastOwnerSafe({ currentRole: 'ADMIN', nextRole: null, ownerCount: 1 }),
    ).not.toThrow();
  });
});
