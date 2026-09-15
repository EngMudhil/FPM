'use client';

import { useState, useTransition } from 'react';
import { Button } from '@fpm/ui';
import { createBackupAction } from '@/server/actions/backup';

export function CreateBackupButton() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div>
      <Button
        variant="primary"
        disabled={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await createBackupAction();
            if (!result.ok) setError(result.error.message);
            else window.location.reload();
          });
        }}
      >
        {pending ? 'Creating backup…' : 'Create backup ZIP'}
      </Button>
      {error ? (
        <p className="fpm-field__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
