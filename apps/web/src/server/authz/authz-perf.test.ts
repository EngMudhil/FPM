import { describe, expect, it } from 'vitest';
import { hasMinimumWorkspaceRole } from './workspace';

describe('hasMinimumWorkspaceRole', () => {
  it('compares roles without a database round-trip', () => {
    expect(hasMinimumWorkspaceRole('VIEWER', 'VIEWER')).toBe(true);
    expect(hasMinimumWorkspaceRole('MEMBER', 'VIEWER')).toBe(true);
    expect(hasMinimumWorkspaceRole('VIEWER', 'MEMBER')).toBe(false);
    expect(hasMinimumWorkspaceRole('ADMIN', 'ADMIN')).toBe(true);
    expect(hasMinimumWorkspaceRole('OWNER', 'ADMIN')).toBe(true);
  });
});
