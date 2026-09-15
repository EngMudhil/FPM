'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, ConfirmationDialog } from '@fpm/ui';
import { archiveAccountAction } from '@/server/actions/accounts';

export function AccountArchiveButton({
  accountId,
  archived,
}: {
  accountId: string;
  archived: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (archived) return null;

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        Archive
      </Button>
      {error ? (
        <p className="fpm-field__error" role="alert">
          {error}
        </p>
      ) : null}
      <ConfirmationDialog
        open={open}
        title="Archive account?"
        description="The account will be hidden from the default list. Withdrawal history remains intact."
        confirmLabel="Archive"
        onCancel={() => setOpen(false)}
        onConfirm={async () => {
          const result = await archiveAccountAction(accountId);
          setOpen(false);
          if (!result.ok) {
            setError(result.error.message);
            return;
          }
          router.refresh();
        }}
      />
    </>
  );
}
