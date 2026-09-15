import { loginAction } from '@/server/actions/auth';
import { redirect } from 'next/navigation';

export default function LoginPage() {
  async function action(formData: FormData) {
    'use server';
    const result = await loginAction(formData);
    if (result.ok) {
      redirect('/app');
    }
    redirect('/login?error=1');
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '2rem',
        background: '#F8FAFC',
      }}
    >
      <form
        action={action}
        style={{
          width: '100%',
          maxWidth: 400,
          background: '#fff',
          border: '1px solid #E2E8F0',
          borderRadius: 12,
          padding: '1.5rem',
          display: 'grid',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 24, color: '#0F172A' }}>Sign in</h1>
          <p style={{ margin: '0.35rem 0 0', color: '#64748B', fontSize: 14 }}>
            Funded Portfolio Manager
          </p>
        </div>
        <label style={{ display: 'grid', gap: 6, fontSize: 14 }}>
          Email
          <input
            name="email"
            type="email"
            required
            autoComplete="username"
            style={{
              border: '1px solid #E2E8F0',
              borderRadius: 8,
              padding: '0.6rem 0.75rem',
            }}
          />
        </label>
        <label style={{ display: 'grid', gap: 6, fontSize: 14 }}>
          Password
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            style={{
              border: '1px solid #E2E8F0',
              borderRadius: 8,
              padding: '0.6rem 0.75rem',
            }}
          />
        </label>
        <button
          type="submit"
          style={{
            background: '#0D9488',
            color: '#fff',
            border: 0,
            borderRadius: 8,
            padding: '0.7rem 1rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Sign in
        </button>
      </form>
    </main>
  );
}
