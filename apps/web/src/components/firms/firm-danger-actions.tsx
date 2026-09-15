'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, ConfirmationDialog } from '@fpm/ui';
import { archiveFirmAction, deleteFirmAction } from '@/server/actions/firms';

export function FirmDangerActions({ firmId, archived }: { firmId: string; archived: boolean }) {
  const router = useRouter();
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {!archived ? (
        <Button variant="secondary" size="sm" onClick={() => setArchiveOpen(true)}>
          Archive
        </Button>
      ) : null}
      <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
        Delete
      </Button>
      {error ? (
        <p className="fpm-field__error" role="alert">
          {error}
        </p>
      ) : null}

      <ConfirmationDialog
        open={archiveOpen}
        title="Archive firm?"
        description="The firm will be hidden from the default list. Financial history remains intact."
        confirmLabel="Archive"
        onCancel={() => setArchiveOpen(false)}
        onConfirm={async () => {
          const result = await archiveFirmAction(firmId);
          setArchiveOpen(false);
          if (!result.ok) {
            setError(result.error.message);
            return;
          }
          router.refresh();
        }}
      />

      <ConfirmationDialog
        open={deleteOpen}
        title="Delete firm permanently?"
        description="Hard delete is only safe when no funded-account history depends on this firm. Prefer Archive when unsure."
        confirmLabel="Delete permanently"
        destructive
        onCancel={() => setDeleteOpen(false)}
        onConfirm={async () => {
          const result = await deleteFirmAction(firmId);
          setDeleteOpen(false);
          if (result && 'ok' in result && !result.ok) {
            setError(result.error.message);
          }
        }}
      />
    </div>
  );
}
