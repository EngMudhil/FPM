import { describe, expect, it } from 'vitest';
import { isNavItemActive } from './navigation';

describe('navigation performance invariants', () => {
  it('keeps sidebar active matching for nested firm routes', () => {
    expect(isNavItemActive('/firms', '/firms')).toBe(true);
    expect(isNavItemActive('/firms/abc', '/firms')).toBe(true);
    expect(isNavItemActive('/accounts', '/firms')).toBe(false);
  });
});
