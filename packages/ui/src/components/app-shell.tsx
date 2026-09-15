'use client';

import type { ReactNode } from 'react';
import { fpmNavGroups, isNavItemActive, type NavGroup } from '../navigation';
import { Button } from './button';
import { NavIcon } from './nav-icon';

export type SidebarProps = {
  pathname: string;
  userEmail?: string;
  groups?: NavGroup[];
  footerAction?: ReactNode;
  open?: boolean;
  onNavigate?: () => void;
};

export function Sidebar({
  pathname,
  userEmail,
  groups = fpmNavGroups,
  footerAction,
  open = true,
  onNavigate,
}: SidebarProps) {
  return (
    <aside className="fpm-sidebar" data-open={open ? 'true' : 'false'} aria-label="Primary">
      <div className="fpm-sidebar__brand">
        <span className="fpm-sidebar__mark" aria-hidden>
          F
        </span>
        <div className="fpm-sidebar__brand-text">
          FPM
          <br />
          Portfolio Manager
        </div>
      </div>

      <nav aria-label="Main">
        {groups.map((group) => (
          <div className="fpm-sidebar__group" key={group.label}>
            <div className="fpm-sidebar__group-label">{group.label}</div>
            {group.items.map((item) => {
              const active = isNavItemActive(pathname, item.href);
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className="fpm-sidebar__link"
                  aria-current={active ? 'page' : undefined}
                  onClick={onNavigate}
                >
                  {item.icon ? <NavIcon name={item.icon} /> : null}
                  <span>{item.label}</span>
                </a>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="fpm-sidebar__footer">
        {userEmail ? <div>{userEmail}</div> : null}
        {footerAction}
      </div>
    </aside>
  );
}

export type AppShellProps = {
  pathname: string;
  userEmail?: string;
  children: ReactNode;
  footerAction?: ReactNode;
  mobileMenuOpen: boolean;
  onMobileMenuOpenChange: (open: boolean) => void;
};

export function AppShell({
  pathname,
  userEmail,
  children,
  footerAction,
  mobileMenuOpen,
  onMobileMenuOpenChange,
}: AppShellProps) {
  return (
    <div className="fpm-shell">
      <div className="fpm-shell__mobile-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="fpm-sidebar__mark" aria-hidden>
            F
          </span>
          <strong style={{ fontSize: 13 }}>FPM</strong>
        </div>
        <Button
          variant="secondary"
          size="sm"
          aria-expanded={mobileMenuOpen}
          aria-controls="fpm-primary-nav"
          onClick={() => onMobileMenuOpenChange(!mobileMenuOpen)}
        >
          Menu
        </Button>
      </div>

      <div
        className="fpm-shell__drawer-backdrop"
        data-open={mobileMenuOpen ? 'true' : 'false'}
        onClick={() => onMobileMenuOpenChange(false)}
        aria-hidden
      />

      <div id="fpm-primary-nav">
        <Sidebar
          pathname={pathname}
          userEmail={userEmail}
          footerAction={footerAction}
          open={mobileMenuOpen}
          onNavigate={() => onMobileMenuOpenChange(false)}
        />
      </div>

      <main className="fpm-shell__main">{children}</main>
    </div>
  );
}
