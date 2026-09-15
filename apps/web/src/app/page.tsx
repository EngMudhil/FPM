import Link from 'next/link';

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '2rem',
      }}
    >
      <section style={{ maxWidth: '36rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Funded Portfolio Manager
        </p>
        <h1 style={{ fontSize: '2.25rem', margin: '0.75rem 0' }}>Foundation ready</h1>
        <p style={{ color: 'var(--muted)', lineHeight: 1.6 }}>
          Application and database foundation (FPM-003). Business modules are not implemented yet.
        </p>
        <p style={{ marginTop: '1.5rem' }}>
          <Link href="/login" style={{ color: 'var(--success)', fontWeight: 600 }}>
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
