'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Alert, Button, FormField, Input } from '@fpm/ui';
import { changePasswordAction, updateProfileAction } from '@/server/actions/workspace';

export function SecurityForms({ email, name }: { email: string; name: string | null }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div style={{ display: 'grid', gap: 28, maxWidth: 520 }}>
      {error ? (
        <Alert tone="danger" title="Error">
          {error}
        </Alert>
      ) : null}
      {message ? (
        <Alert tone="success" title="Saved">
          {message}
        </Alert>
      ) : null}

      <form
        style={{ display: 'grid', gap: 12 }}
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          setError(null);
          setMessage(null);
          startTransition(async () => {
            const result = await updateProfileAction(fd);
            if (!result.ok) {
              setError(result.error.message);
              return;
            }
            setMessage('Profile updated.');
            router.refresh();
          });
        }}
      >
        <h2 style={{ margin: 0, fontSize: 16 }}>Profile</h2>
        <FormField id="email" label="Email">
          <Input id="email" value={email} disabled readOnly />
        </FormField>
        <FormField id="name" label="Display name">
          <Input id="name" name="name" defaultValue={name ?? ''} />
        </FormField>
        <Button type="submit" variant="primary" disabled={pending}>
          Save profile
        </Button>
      </form>

      <form
        style={{ display: 'grid', gap: 12 }}
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const fd = new FormData(form);
          setError(null);
          setMessage(null);
          startTransition(async () => {
            const result = await changePasswordAction(fd);
            if (!result.ok) {
              setError(result.error.message);
              return;
            }
            setMessage('Password changed.');
            form.reset();
          });
        }}
      >
        <h2 style={{ margin: 0, fontSize: 16 }}>Change password</h2>
        <FormField id="currentPassword" label="Current password" required>
          <Input id="currentPassword" name="currentPassword" type="password" required />
        </FormField>
        <FormField id="newPassword" label="New password" required hint="At least 8 characters">
          <Input id="newPassword" name="newPassword" type="password" required minLength={8} />
        </FormField>
        <FormField id="confirmPassword" label="Confirm new password" required>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            minLength={8}
          />
        </FormField>
        <Button type="submit" variant="secondary" disabled={pending}>
          Update password
        </Button>
      </form>
    </div>
  );
}
