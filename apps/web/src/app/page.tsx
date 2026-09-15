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
      <section style={{ maxWidth: '40rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Funded Portfolio Manager
        </p>
        <h1 style={{ fontSize: '2.5rem', margin: '0.75rem 0' }}>Repository foundation ready</h1>
        <p style={{ color: 'var(--muted)', lineHeight: 1.6 }}>
          This is a placeholder landing page for the FPM rebuild. No business features are
          implemented in this phase.
        </p>
      </section>
    </main>
  );
}
