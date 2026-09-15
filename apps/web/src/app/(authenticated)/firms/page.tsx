import Link from 'next/link';
import {
  Badge,
  Button,
  EmptyState,
  PageHeader,
  SearchInput,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@fpm/ui';
import { listFirmsAction } from '@/server/actions/firms';

function formatDate(value: Date) {
  return value.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default async function FirmsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? '1') || 1;
  const result = await listFirmsAction({
    search: params.q,
    page,
    pageSize: 20,
    sort: 'createdAt',
    sortDir: 'desc',
  });

  if (!result.ok) {
    return (
      <>
        <PageHeader title="Firms" description="Manage prop trading firms." />
        <EmptyState title="Unable to load firms" description={result.error.message} />
      </>
    );
  }

  const { items, total } = result;

  return (
    <>
      <PageHeader
        title="Firms"
        description="Manage prop trading firms."
        actions={
          <Link href="/firms/new" className="fpm-btn fpm-btn--primary">
            + Add Firm
          </Link>
        }
      />

      <form
        method="get"
        style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}
      >
        <div style={{ flex: 1, maxWidth: 360 }}>
          <SearchInput name="q" defaultValue={params.q ?? ''} placeholder="Search firms..." />
        </div>
        <Button type="submit" variant="secondary" size="sm">
          Search
        </Button>
        <span style={{ color: 'var(--fpm-text-muted)', fontSize: 13 }}>
          {total} firm{total === 1 ? '' : 's'}
        </span>
      </form>

      {items.length === 0 ? (
        <EmptyState
          title="No firms yet"
          description="Add your first prop firm to start tracking funded accounts."
        />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Name</TH>
              <TH>Website</TH>
              <TH>Created</TH>
              <TH>Actions</TH>
            </TR>
          </THead>
          <TBody>
            {items.map((firm) => (
              <TR key={firm.id}>
                <TD>
                  <Link href={`/firms/${firm.id}`} style={{ fontWeight: 600, color: 'inherit' }}>
                    {firm.name}
                  </Link>
                  {firm.archivedAt ? (
                    <>
                      {' '}
                      <Badge tone="neutral">Archived</Badge>
                    </>
                  ) : null}
                </TD>
                <TD>{firm.website ?? '—'}</TD>
                <TD>{formatDate(firm.createdAt)}</TD>
                <TD>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <Link href={`/firms/${firm.id}/edit`}>Edit</Link>
                    <Link href={`/firms/${firm.id}`}>View</Link>
                  </div>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </>
  );
}
