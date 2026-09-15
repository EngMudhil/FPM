'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Alert, Button, FormField, Input, Select, Table, TBody, TD, TH, THead, TR } from '@fpm/ui';
import {
  inviteMemberAction,
  removeMemberAction,
  updateMemberRoleAction,
} from '@/server/actions/workspace';

type MemberRow = {
  membershipId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  email: string;
  name: string | null;
  userId: string;
};

export function MembersPanel({
  members,
  canManage,
  currentUserId,
}: {
  members: MemberRow[];
  canManage: boolean;
  currentUserId: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<{ ok: boolean; error?: { message: string } }>, okMsg: string) {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error?.message ?? 'Request failed');
        return;
      }
      setMessage(okMsg);
      router.refresh();
    });
  }

  return (
    <div style={{ display: 'grid', gap: 24 }}>
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

      {canManage ? (
        <form
          style={{ display: 'grid', gap: 12, maxWidth: 520 }}
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const fd = new FormData(form);
            setError(null);
            setMessage(null);
            startTransition(async () => {
              const result = await inviteMemberAction(fd);
              if (!result.ok) {
                setError(result.error?.message ?? 'Request failed');
                return;
              }
              setMessage('Member invited.');
              form.reset();
              router.refresh();
            });
          }}
        >
          <h2 style={{ margin: 0, fontSize: 16 }}>Invite member</h2>
          <FormField id="email" label="Email" required>
            <Input id="email" name="email" type="email" required />
          </FormField>
          <FormField id="name" label="Display name" hint="Optional">
            <Input id="name" name="name" />
          </FormField>
          <FormField
            id="password"
            label="Initial password"
            required
            hint="Used when creating a new user; ignored if the email already exists"
          >
            <Input id="password" name="password" type="password" required minLength={8} />
          </FormField>
          <FormField id="role" label="Role" required>
            <Select id="role" name="role" defaultValue="MEMBER">
              <option value="OWNER">OWNER</option>
              <option value="ADMIN">ADMIN</option>
              <option value="MEMBER">MEMBER</option>
              <option value="VIEWER">VIEWER</option>
            </Select>
          </FormField>
          <Button type="submit" variant="primary" disabled={pending}>
            Invite
          </Button>
        </form>
      ) : null}

      <Table>
        <THead>
          <TR>
            <TH>Email</TH>
            <TH>Name</TH>
            <TH>Role</TH>
            {canManage ? <TH>Actions</TH> : null}
          </TR>
        </THead>
        <TBody>
          {members.map((m) => (
            <TR key={m.membershipId}>
              <TD>
                {m.email}
                {m.userId === currentUserId ? ' (you)' : ''}
              </TD>
              <TD>{m.name ?? '—'}</TD>
              <TD>
                {canManage ? (
                  <form
                    style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}
                    onSubmit={(e) => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      run(() => updateMemberRoleAction(fd), 'Role updated.');
                    }}
                  >
                    <input type="hidden" name="membershipId" value={m.membershipId} />
                    <Select name="role" defaultValue={m.role} aria-label={`Role for ${m.email}`}>
                      <option value="OWNER">OWNER</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="MEMBER">MEMBER</option>
                      <option value="VIEWER">VIEWER</option>
                    </Select>
                    <Button type="submit" size="sm" variant="secondary" disabled={pending}>
                      Save
                    </Button>
                  </form>
                ) : (
                  m.role
                )}
              </TD>
              {canManage ? (
                <TD>
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    disabled={pending}
                    onClick={() => {
                      const fd = new FormData();
                      fd.set('membershipId', m.membershipId);
                      run(() => removeMemberAction(fd), 'Member removed.');
                    }}
                  >
                    Remove
                  </Button>
                </TD>
              ) : null}
            </TR>
          ))}
        </TBody>
      </Table>
    </div>
  );
}
