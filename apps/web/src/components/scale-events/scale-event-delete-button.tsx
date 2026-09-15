'use client';

import { useState } from 'react';
import { Button, ConfirmationDialog } from '@fpm/ui';
import { deleteScaleEventAction } from '@/server/actions/scale-events';

export function ScaleEventDeleteButton({ scaleEventId }: { scaleEventId: string }) {
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
        title="Delete scale event?"
        description="Account current size will resync from remaining events (or initial size)."
        confirmLabel="Delete"
        destructive
        onCancel={() => setOpen(false)}
        onConfirm={async () => {
          const result = await deleteScaleEventAction(scaleEventId);
          setOpen(false);
          if (result && 'ok' in result && !result.ok) {
            setError(result.error.message);
          }
        }}
      />
    </>
  );
}
