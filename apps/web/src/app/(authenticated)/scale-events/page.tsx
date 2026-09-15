import Link from 'next/link';
import { EmptyState, PageHeader, Table, TBody, TD, TH, THead, TR } from '@fpm/ui';
import { listScaleEventsAction } from '@/server/actions/scale-events';

function formatDate(value: Date) {
  return value.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function deltaPercent(fromSize: string, toSize: string): string {
  const from = Number(fromSize);
  const to = Number(toSize);
  if (!Number.isFinite(from) || from === 0 || !Number.isFinite(to)) return '—';
  const pct = ((to - from) / from) * 100;
  return `${pct.toFixed(1)}%`;
}

export default async function ScaleEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? '1') || 1;
  const result = await listScaleEventsAction({ page, pageSize: 50 });

  if (!result.ok) {
    return (
      <>
        <PageHeader title="Scale Events" description="Account size upgrades." />
        <EmptyState title="Unable to load scale events" description={result.error.message} />
      </>
    );
  }

  const { items, total } = result;

  return (
    <>
      <PageHeader
        title="Scale Events"
        description="Record when a funded account gets scaled up. Current size updates in the same transaction."
        actions={
          <Link href="/scale-events/new" className="fpm-btn fpm-btn--primary">
            + Add Scale Event
          </Link>
        }
      />

      {items.length === 0 ? (
        <EmptyState
          title="No scale events yet"
          description="Record when a funded account gets scaled up."
        />
      ) : (
        <>
          <p style={{ color: 'var(--fpm-text-muted)', fontSize: 13, marginBottom: 12 }}>
            {total} scale event{total === 1 ? '' : 's'}
          </p>
          <Table>
            <THead>
              <TR>
                <TH>Account</TH>
                <TH>From → To</TH>
                <TH>Δ%</TH>
                <TH>Scaled</TH>
                <TH>Actions</TH>
              </TR>
            </THead>
            <TBody>
              {items.map((row) => (
                <TR key={row.id}>
                  <TD>{row.accountLabel}</TD>
                  <TD style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                    {row.fromSize} → {row.toSize} {row.currency}
                  </TD>
                  <TD style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {deltaPercent(row.fromSize, row.toSize)}
                  </TD>
                  <TD>{formatDate(row.scaledAt)}</TD>
                  <TD>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <Link href={`/scale-events/${row.id}`}>View</Link>
                      <Link href={`/scale-events/${row.id}/edit`}>Edit</Link>
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </>
      )}
    </>
  );
}
