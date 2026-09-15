import {
  Badge,
  EmptyState,
  PageHeader,
  Select,
  Button,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@fpm/ui';
import { listAuditLogsAction } from '@/server/actions/audit';

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ module?: string; action?: string; page?: string }>;
}) {
  const params = await searchParams;
  const result = await listAuditLogsAction({
    module: params.module || undefined,
    action: params.action || undefined,
    page: params.page || undefined,
  });

  if (!result.ok) {
    return (
      <>
        <PageHeader title="Audit Log" description="Append-only activity history." />
        <EmptyState title="Unable to load audit log" description={result.error.message} />
      </>
    );
  }

  const { items, total } = result;

  return (
    <>
      <PageHeader
        title="Audit Log"
        description="Append-only security and mutation history. Rows are never updated or deleted."
      />

      <form
        method="get"
        style={{ display: 'flex', gap: 12, alignItems: 'end', marginBottom: 16, flexWrap: 'wrap' }}
      >
        <label style={{ display: 'grid', gap: 6, fontSize: 13 }}>
          Module
          <Select name="module" defaultValue={params.module ?? ''} style={{ minWidth: 160 }}>
            <option value="">All modules</option>
            <option value="firms">firms</option>
            <option value="accounts">accounts</option>
            <option value="withdrawals">withdrawals</option>
            <option value="scale-events">scale-events</option>
            <option value="certificates">certificates</option>
            <option value="brokers">brokers</option>
            <option value="exports">exports</option>
          </Select>
        </label>
        <label style={{ display: 'grid', gap: 6, fontSize: 13 }}>
          Action
          <Select name="action" defaultValue={params.action ?? ''} style={{ minWidth: 140 }}>
            <option value="">All actions</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
            <option value="EXPORT">EXPORT</option>
          </Select>
        </label>
        <Button type="submit" variant="secondary" size="sm">
          Filter
        </Button>
        <span style={{ color: 'var(--fpm-text-muted)', fontSize: 13 }}>{total} events</span>
      </form>

      {items.length === 0 ? (
        <EmptyState
          title="No audit events yet"
          description="Mutations write append-only rows here."
        />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>When</TH>
              <TH>Action</TH>
              <TH>Module</TH>
              <TH>Record</TH>
              <TH>Actor</TH>
            </TR>
          </THead>
          <TBody>
            {items.map((row) => (
              <TR key={row.id}>
                <TD style={{ fontSize: 13 }}>{row.createdAt.toISOString()}</TD>
                <TD>
                  <Badge tone={row.action === 'DELETE' ? 'danger' : 'info'}>{row.action}</Badge>
                </TD>
                <TD>{row.module}</TD>
                <TD style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12 }}>
                  {row.recordType ?? '—'}
                  {row.recordId ? ` · ${row.recordId}` : ''}
                </TD>
                <TD style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12 }}>
                  {row.actorUserId ?? '—'}
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </>
  );
}
