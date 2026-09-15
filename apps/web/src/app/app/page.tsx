import { getSessionAction, logoutAction } from '@/server/actions/auth';
import { redirect } from 'next/navigation';

export default async function AppHomePage() {
  const session = await getSessionAction();
  if (!session.ok) {
    redirect('/login');
  }

  async function logout() {
    'use server';
    await logoutAction();
    redirect('/login');
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', background: '#F8FAFC' }}>
      <aside
        style={{
          width: 260,
          background: '#fff',
          borderRight: '1px solid #E2E8F0',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div>
          <strong style={{ color: '#2563EB' }}>FPM</strong>
          <div style={{ fontSize: 12, color: '#64748B' }}>Portfolio Manager</div>
        </div>
        <nav style={{ fontSize: 14, color: '#475569' }}>
          <div style={{ padding: '0.5rem 0.75rem', background: '#EFF6FF', borderRadius: 8 }}>
            Foundation
          </div>
        </nav>
        <div style={{ marginTop: 'auto', fontSize: 12, color: '#64748B' }}>
          <div>{session.user.email}</div>
          <form action={logout}>
            <button
              type="submit"
              style={{
                marginTop: 8,
                background: 'transparent',
                border: '1px solid #E2E8F0',
                borderRadius: 8,
                padding: '0.4rem 0.75rem',
                cursor: 'pointer',
              }}
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <section style={{ flex: 1, padding: '2rem' }}>
        <h1 style={{ marginTop: 0, color: '#0F172A' }}>Application foundation</h1>
        <p style={{ color: '#64748B', maxWidth: 560 }}>
          Auth, workspace ownership, and database access are available. Business modules (Firms,
          Accounts, Withdrawals, …) are intentionally not implemented in FPM-003.
        </p>
        <div
          style={{
            marginTop: '1.5rem',
            background: '#fff',
            border: '1px solid #E2E8F0',
            borderRadius: 12,
            padding: '1rem 1.25rem',
            maxWidth: 480,
          }}
        >
          <div style={{ fontSize: 12, color: '#64748B' }}>Workspace</div>
          <div style={{ fontWeight: 600 }}>{session.workspace.name}</div>
          <div style={{ fontSize: 13, color: '#475569', marginTop: 8 }}>
            Role: {session.role} · TZ: {session.workspace.timezone} · Default currency:{' '}
            {session.workspace.defaultCurrency}
          </div>
        </div>
      </section>
    </main>
  );
}
