import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge, Card, PageHeader } from '@fpm/ui';
import { getFirmAction } from '@/server/actions/firms';
import { FirmDangerActions } from '@/components/firms/firm-danger-actions';

export default async function FirmDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getFirmAction(id);
  if (!result.ok) {
    if (result.error.code === 'NOT_FOUND') notFound();
    return <p role="alert">{result.error.message}</p>;
  }

  const { firm } = result;

  return (
    <>
      <PageHeader
        title={firm.name}
        description="Firm detail"
        breadcrumbs={[{ label: 'Firms', href: '/firms' }, { label: firm.name }]}
        actions={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Link href={`/firms/${firm.id}/edit`} className="fpm-btn fpm-btn--secondary">
              Edit
            </Link>
            <FirmDangerActions firmId={firm.id} archived={Boolean(firm.archivedAt)} />
          </div>
        }
      />
      <Card>
        <dl style={{ display: 'grid', gap: 12, margin: 0 }}>
          <div>
            <dt style={{ color: 'var(--fpm-text-muted)', fontSize: 12 }}>Status</dt>
            <dd style={{ margin: 0 }}>
              {firm.archivedAt ? (
                <Badge tone="neutral">Archived</Badge>
              ) : (
                <Badge tone="success">Active</Badge>
              )}
            </dd>
          </div>
          <div>
            <dt style={{ color: 'var(--fpm-text-muted)', fontSize: 12 }}>Website</dt>
            <dd style={{ margin: 0 }}>{firm.website ?? '—'}</dd>
          </div>
          <div>
            <dt style={{ color: 'var(--fpm-text-muted)', fontSize: 12 }}>Notes</dt>
            <dd style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{firm.notes ?? '—'}</dd>
          </div>
          <div>
            <dt style={{ color: 'var(--fpm-text-muted)', fontSize: 12 }}>Created</dt>
            <dd style={{ margin: 0 }}>{firm.createdAt.toISOString()}</dd>
          </div>
        </dl>
      </Card>
    </>
  );
}
