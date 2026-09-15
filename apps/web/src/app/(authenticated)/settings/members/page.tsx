import { Alert, EmptyState, PageHeader } from '@fpm/ui';
import { listMembersAction } from '@/server/actions/workspace';
import { MembersPanel } from '@/components/settings/members-panel';

export default async function MembersSettingsPage() {
  const result = await listMembersAction();
  if (!result.ok) {
    return (
      <>
        <PageHeader title="Members" description="Workspace roles and invites." />
        <EmptyState title="Unable to load members" description={result.error.message} />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Members"
        description="OWNER manages invites and roles. The last OWNER cannot be removed or demoted."
        breadcrumbs={[{ label: 'Settings' }, { label: 'Members' }]}
      />

      <Alert tone="info" title="Private local invites">
        Invites create local email/password users. There is no outbound email provider.
      </Alert>

      <div style={{ marginTop: 20 }}>
        <MembersPanel
          members={result.members}
          canManage={result.role === 'OWNER'}
          currentUserId={result.currentUserId}
        />
      </div>
    </>
  );
}
