import { Badge, EmptyState, PageHeader, Table, TBody, TD, TH, THead, TR } from '@fpm/ui';
import { getSecuritySettingsAction } from '@/server/actions/workspace';
import { SecurityForms } from '@/components/settings/security-forms';

function formatWhen(value: Date) {
  return value.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default async function SecuritySettingsPage() {
  const result = await getSecuritySettingsAction();
  if (!result.ok) {
    return (
      <>
        <PageHeader title="Security" description="Profile, password, and login history." />
        <EmptyState title="Unable to load security settings" description={result.error.message} />
      </>
    );
  }

  const { user, loginEvents } = result;

  return (
    <>
      <PageHeader
        title="Security"
        description="Profile, password, and recent login activity."
        breadcrumbs={[{ label: 'Settings' }, { label: 'Security' }]}
      />

      <SecurityForms email={user.email} name={user.name} />

      <section style={{ marginTop: 32 }}>
        <PageHeader
          title="Recent login events"
          description="Latest authentication attempts for your account."
        />
        {loginEvents.length === 0 ? (
          <EmptyState
            title="No login events yet"
            description="Successful and failed logins appear here."
          />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>When</TH>
                <TH>Type</TH>
                <TH>IP</TH>
                <TH>User agent</TH>
              </TR>
            </THead>
            <TBody>
              {loginEvents.map((event) => (
                <TR key={event.id}>
                  <TD>{formatWhen(event.createdAt)}</TD>
                  <TD>
                    <Badge
                      tone={
                        event.type === 'SUCCESS'
                          ? 'success'
                          : event.type === 'LOCKOUT'
                            ? 'danger'
                            : 'warning'
                      }
                    >
                      {event.type}
                    </Badge>
                  </TD>
                  <TD>{event.ipAddress ?? '—'}</TD>
                  <TD style={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {event.userAgent ?? '—'}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </section>
    </>
  );
}
