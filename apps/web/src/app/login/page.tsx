import { loginAction } from '@/server/actions/auth';
import { Alert, Button, Card, FormField, Input } from '@fpm/ui';
import { redirect } from 'next/navigation';

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;

  async function action(formData: FormData) {
    'use server';
    const result = await loginAction(formData);
    if (result.ok) {
      redirect('/dashboard');
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
        background: 'var(--fpm-bg)',
      }}
    >
      <Card style={{ width: '100%', maxWidth: 400 }}>
        <form action={action} style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <h1 className="fpm-page-header__title" style={{ fontSize: 24 }}>
              Sign in
            </h1>
            <p className="fpm-page-header__description">Funded Portfolio Manager</p>
          </div>
          {params.error ? (
            <Alert tone="danger" title="Sign in failed">
              Invalid email or password
            </Alert>
          ) : null}
          <FormField id="email" label="Email" required>
            <Input id="email" name="email" type="email" required autoComplete="username" />
          </FormField>
          <FormField id="password" label="Password" required>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </FormField>
          <Button type="submit" variant="primary">
            Sign in
          </Button>
        </form>
      </Card>
    </main>
  );
}
