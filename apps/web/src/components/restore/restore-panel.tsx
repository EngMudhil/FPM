'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, FormField, Input } from '@fpm/ui';
import { confirmRestoreAction, uploadRestoreZipAction } from '@/server/actions/restore';

export function RestorePanel({
  jobs,
}: {
  jobs: Array<{
    id: string;
    status: string;
    confirmationToken: string | null;
    preview: unknown;
    exactDiff: unknown;
    errorMessage: string | null;
  }>;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const ready = jobs.find((j) => j.status === 'PREVIEW_READY') ?? null;

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const form = event.currentTarget;
          const data = new FormData(form);
          setError(null);
          startTransition(async () => {
            const result = await uploadRestoreZipAction(data);
            if (!result.ok) {
              setError(result.error.message);
              return;
            }
            setJobId(result.id);
            setToken(result.confirmationToken);
            setPreview(JSON.stringify(result.exactDiff, null, 2));
          });
        }}
      >
        <FormField id="file" label="Upload backup ZIP" required>
          <Input id="file" name="file" type="file" accept=".zip,application/zip" required />
        </FormField>
        <Button type="submit" variant="secondary" disabled={pending} style={{ marginTop: 8 }}>
          {pending ? 'Validating…' : 'Upload & preview'}
        </Button>
      </form>

      {(preview || ready) && (
        <div>
          <h3 style={{ margin: '0 0 8px', fontSize: 14 }}>Exact diff preview</h3>
          <pre
            style={{
              margin: 0,
              padding: 12,
              background: 'var(--fpm-hover)',
              borderRadius: 8,
              overflow: 'auto',
              fontSize: 12,
            }}
          >
            {preview ?? JSON.stringify(ready?.exactDiff, null, 2)}
          </pre>
          <form
            style={{ display: 'grid', gap: 8, marginTop: 12, maxWidth: 420 }}
            onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              setError(null);
              startTransition(async () => {
                const result = await confirmRestoreAction(data);
                if (!result.ok) setError(result.error.message);
                else router.refresh();
              });
            }}
          >
            <input type="hidden" name="jobId" value={jobId ?? ready?.id ?? ''} />
            <input
              type="hidden"
              name="confirmationToken"
              value={token ?? ready?.confirmationToken ?? ''}
            />
            <FormField id="typedConfirm" label="Type RESTORE to confirm" required>
              <Input id="typedConfirm" name="typedConfirm" required placeholder="RESTORE" />
            </FormField>
            <Button type="submit" variant="danger" disabled={pending}>
              Confirm restore
            </Button>
          </form>
        </div>
      )}

      {error ? (
        <p className="fpm-field__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
