'use client';

import { useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { AppShell, Button, FpmLinkProvider } from '@fpm/ui';
import { SoftLink } from '@/components/soft-link';

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
    <FpmLinkProvider linkComponent={SoftLink}>
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
    </FpmLinkProvider>
  );
}
