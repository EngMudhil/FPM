'use client';

import { useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { AppShell, Button } from '@fpm/ui';

export function AuthenticatedShell({
  userEmail,
  logoutAction,
  children,
}: {
  userEmail: string;
  logoutAction: () => Promise<void>;
  children: ReactNode;
}) {
  const pathname = usePathname() ?? '/dashboard';
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AppShell
      pathname={pathname}
      userEmail={userEmail}
      mobileMenuOpen={mobileOpen}
      onMobileMenuOpenChange={setMobileOpen}
      footerAction={
        <form action={logoutAction}>
          <Button type="submit" variant="ghost" size="sm">
            Sign out
          </Button>
        </form>
      }
    >
      {children}
    </AppShell>
  );
}
