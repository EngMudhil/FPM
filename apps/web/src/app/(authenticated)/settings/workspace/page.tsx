import { Alert, Card, EmptyState, FormField, Input, PageHeader, Button } from '@fpm/ui';
import {
  getWorkspaceSettingsAction,
  updateWorkspaceSettingsAction,
} from '@/server/actions/workspace';

export default async function WorkspaceSettingsPage() {
  const result = await getWorkspaceSettingsAction();
  if (!result.ok) {
    return (
      <>
        <PageHeader title="Workspace" description="Workspace identity and defaults." />
        <EmptyState title="Unable to load workspace" description={result.error.message} />
      </>
    );
  }

  const { workspace, role } = result;
  const canEdit = role === 'OWNER' || role === 'ADMIN';

  async function save(formData: FormData) {
    'use server';
    await updateWorkspaceSettingsAction(formData);
  }

  return (
    <>
      <PageHeader
        title="Workspace"
        description="Name, timezone, and default currency for this workspace."
        breadcrumbs={[{ label: 'Settings' }, { label: 'Workspace' }]}
      />

      <Alert tone="info" title="ADR-015">
        ADMIN can edit settings. Timezone is stored for display/policy; financial period math uses
        UTC month boundaries until OQ-009 TZ period edges expand.
      </Alert>

      <Card style={{ marginTop: 20, maxWidth: 520 }}>
        {canEdit ? (
          <form action={save} style={{ display: 'grid', gap: 16 }}>
            <FormField id="name" label="Workspace name" required>
              <Input id="name" name="name" required defaultValue={workspace.name} />
            </FormField>
            <FormField
              id="timezone"
              label="Timezone"
              required
              hint="IANA name, e.g. UTC or America/New_York"
            >
              <Input id="timezone" name="timezone" required defaultValue={workspace.timezone} />
            </FormField>
            <FormField id="defaultCurrency" label="Default currency" required hint="ISO 4217 code">
              <Input
                id="defaultCurrency"
                name="defaultCurrency"
                required
                defaultValue={workspace.defaultCurrency}
              />
            </FormField>
            <Button type="submit" variant="primary">
              Save workspace
            </Button>
          </form>
        ) : (
          <dl style={{ display: 'grid', gap: 12, margin: 0 }}>
            <div>
              <dt style={{ fontSize: 12, color: 'var(--fpm-text-muted)' }}>Name</dt>
              <dd style={{ margin: 0 }}>{workspace.name}</dd>
            </div>
            <div>
              <dt style={{ fontSize: 12, color: 'var(--fpm-text-muted)' }}>Timezone</dt>
              <dd style={{ margin: 0 }}>{workspace.timezone}</dd>
            </div>
            <div>
              <dt style={{ fontSize: 12, color: 'var(--fpm-text-muted)' }}>Default currency</dt>
              <dd style={{ margin: 0 }}>{workspace.defaultCurrency}</dd>
            </div>
          </dl>
        )}
      </Card>
    </>
  );
}
