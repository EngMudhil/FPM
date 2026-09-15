'use client';

import { useState } from 'react';
import { Button, ConfirmationDialog } from '@fpm/ui';
import { deleteCertificateAction } from '@/server/actions/certificates';

export function CertificateDeleteButton({ certificateId }: { certificateId: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <Button variant="danger" size="sm" onClick={() => setOpen(true)}>
        Delete
      </Button>
      {error ? (
        <p className="fpm-field__error" role="alert">
          {error}
        </p>
      ) : null}
      <ConfirmationDialog
        open={open}
        title="Delete certificate?"
        description="Removes metadata and the private stored image object."
        confirmLabel="Delete"
        destructive
        onCancel={() => setOpen(false)}
        onConfirm={async () => {
          const result = await deleteCertificateAction(certificateId);
          setOpen(false);
          if (result && 'ok' in result && !result.ok) {
            setError(result.error.message);
          }
        }}
      />
    </>
  );
}
