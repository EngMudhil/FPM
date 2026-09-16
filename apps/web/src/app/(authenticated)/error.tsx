'use client';

import { useEffect } from 'react';
import { Button } from '@fpm/ui';

export default function AuthenticatedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[fpm] authenticated route error', error.digest ?? error.message);
  }, [error]);

  return (
    <div role="alert" style={{ display: 'grid', gap: 12, maxWidth: 480 }}>
      <h1 style={{ margin: 0, fontSize: 20 }}>Something went wrong</h1>
      <p style={{ margin: 0, color: 'var(--fpm-text-secondary)' }}>
        This page could not be loaded. Your session and workspace data were not changed.
      </p>
      <div>
        <Button type="button" variant="primary" onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  );
}
