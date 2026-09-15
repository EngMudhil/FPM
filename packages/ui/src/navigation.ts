export type NavItem = {
  label: string;
  href: string;
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
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Reports', href: '/reports' },
    ],
  },
  {
    label: 'Prop Firms',
    items: [
      { label: 'Firms', href: '/firms' },
      { label: 'Funded Accounts', href: '/accounts' },
      { label: 'Withdrawals', href: '/withdrawals' },
      { label: 'Scale Events', href: '/scale-events' },
      { label: 'Certificates', href: '/certificates' },
    ],
  },
  {
    label: 'Real Accounts',
    items: [{ label: 'Broker Accounts', href: '/broker-accounts' }],
  },
  {
    label: 'System',
    items: [
      { label: 'Security', href: '/settings/security' },
      { label: 'Workspace', href: '/settings/workspace' },
      { label: 'Members', href: '/settings/members' },
      { label: 'Data Management', href: '/settings/data' },
      { label: 'Audit Log', href: '/settings/audit-log' },
    ],
  },
];

export function isNavItemActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (href !== '/' && pathname.startsWith(`${href}/`)) return true;
  return false;
}
