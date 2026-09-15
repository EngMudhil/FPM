import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { getSessionAction, logoutAction } from '@/server/actions/auth';
import { AuthenticatedShell } from '@/components/authenticated-shell';

async function logout() {
  'use server';
  await logoutAction();
  redirect('/login');
}

export default async function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const session = await getSessionAction();
  if (!session.ok) {
    redirect('/login');
  }

  return (
    <AuthenticatedShell userEmail={session.user.email} logoutAction={logout}>
      {children}
    </AuthenticatedShell>
  );
}
