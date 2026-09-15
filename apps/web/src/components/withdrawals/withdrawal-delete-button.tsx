'use client';

import { useState } from 'react';
import { Button, ConfirmationDialog } from '@fpm/ui';
import { deleteWithdrawalAction } from '@/server/actions/withdrawals';

export function WithdrawalDeleteButton({
  withdrawalId,
  status,
}: {
  withdrawalId: string;
  status: string;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === 'PAID') {
    return (
      <p className="fpm-field__hint" style={{ margin: 0 }}>
        PAID history cannot be deleted — use Reversed.
      </p>
    );
  }

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
        title="Delete withdrawal?"
        description="This removes a non-PAID withdrawal record."
        confirmLabel="Delete"
        destructive
        onCancel={() => setOpen(false)}
        onConfirm={async () => {
          const result = await deleteWithdrawalAction(withdrawalId);
          setOpen(false);
          if (result && 'ok' in result && !result.ok) {
            setError(result.error.message);
          }
        }}
      />
    </>
  );
}
