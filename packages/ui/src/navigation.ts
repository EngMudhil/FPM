export type NavItem = {
  label: string;
  href: string;
  icon?:
    | 'home'
    | 'building'
    | 'card'
    | 'withdraw'
    | 'trend'
    | 'shield'
    | 'globe'
    | 'report'
    | 'settings'
    | 'users'
    | 'workspace'
    | 'data'
    | 'audit';
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

/** Spec §5 / ADR-008 information architecture */
export const fpmNavGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: 'home' },
      { label: 'Reports', href: '/reports', icon: 'report' },
    ],
  },
  {
    label: 'Prop Firms',
    items: [
      { label: 'Firms', href: '/firms', icon: 'building' },
      { label: 'Funded Accounts', href: '/accounts', icon: 'card' },
      { label: 'Withdrawals', href: '/withdrawals', icon: 'withdraw' },
      { label: 'Scale Events', href: '/scale-events', icon: 'trend' },
      { label: 'Certificates', href: '/certificates', icon: 'shield' },
    ],
  },
  {
    label: 'Real Accounts',
    items: [{ label: 'Broker Accounts', href: '/broker-accounts', icon: 'globe' }],
  },
  {
    label: 'System',
    items: [
      { label: 'Security', href: '/settings/security', icon: 'settings' },
      { label: 'Workspace', href: '/settings/workspace', icon: 'workspace' },
      { label: 'Members', href: '/settings/members', icon: 'users' },
      { label: 'Data Management', href: '/settings/data', icon: 'data' },
      { label: 'Audit Log', href: '/settings/audit-log', icon: 'audit' },
    ],
  },
];

export function isNavItemActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (href !== '/' && pathname.startsWith(`${href}/`)) return true;
  return false;
}
