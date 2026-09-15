import { describe, expect, it } from 'vitest';
import { fpmTokens } from './tokens';
import { isNavItemActive, fpmNavGroups } from './navigation';
import { cn } from './lib/cn';

describe('fpmTokens', () => {
  it('matches Spec primary and background tokens', () => {
    expect(fpmTokens.color.background).toBe('#F8FAFC');
    expect(fpmTokens.color.primary).toBe('#2563EB');
    expect(fpmTokens.color.success).toBe('#0D9488');
    expect(fpmTokens.radius.card).toBe('16px');
  });
});

describe('navigation IA', () => {
  it('includes Spec groups', () => {
    expect(fpmNavGroups.map((g) => g.label)).toEqual([
      'Overview',
      'Prop Firms',
      'Real Accounts',
      'System',
    ]);
  });

  it('includes Spec system settings routes', () => {
    const system = fpmNavGroups.find((g) => g.label === 'System');
    expect(system?.items.map((i) => i.href)).toEqual([
      '/settings/security',
      '/settings/workspace',
      '/settings/members',
      '/settings/data',
      '/settings/audit-log',
    ]);
  });

  it('marks nested routes active', () => {
    expect(isNavItemActive('/firms/new', '/firms')).toBe(true);
    expect(isNavItemActive('/accounts', '/firms')).toBe(false);
  });
});

describe('cn', () => {
  it('joins truthy class names', () => {
    const skip = false;
    expect(cn('a', skip && 'b', 'c')).toBe('a c');
  });
});
