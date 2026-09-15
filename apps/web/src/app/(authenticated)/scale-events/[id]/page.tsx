import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, PageHeader } from '@fpm/ui';
import { getScaleEventAction } from '@/server/actions/scale-events';
import { ScaleEventDeleteButton } from '@/components/scale-events/scale-event-delete-button';

export default async function ScaleEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getScaleEventAction(id);
  if (!result.ok) {
    if (result.error.code === 'NOT_FOUND') notFound();
    return <p role="alert">{result.error.message}</p>;
  }

  const { scaleEvent } = result;

  return (
    <>
      <PageHeader
        title={`${scaleEvent.fromSize} → ${scaleEvent.toSize} ${scaleEvent.currency}`}
        description={scaleEvent.accountLabel}
        breadcrumbs={[
          { label: 'Scale Events', href: '/scale-events' },
          { label: `${scaleEvent.toSize} ${scaleEvent.currency}` },
        ]}
        actions={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <Link
              href={`/scale-events/${scaleEvent.id}/edit`}
              className="fpm-btn fpm-btn--secondary"
            >
              Edit
            </Link>
            <ScaleEventDeleteButton scaleEventId={scaleEvent.id} />
          </div>
        }
      />
      <Card>
        <dl style={{ display: 'grid', gap: 12, margin: 0 }}>
          <div>
            <dt style={{ color: 'var(--fpm-text-muted)', fontSize: 12 }}>Account</dt>
            <dd style={{ margin: 0 }}>
              <Link href={`/accounts/${scaleEvent.tradingAccountId}`}>
                {scaleEvent.accountLabel}
              </Link>
            </dd>
          </div>
          <div>
            <dt style={{ color: 'var(--fpm-text-muted)', fontSize: 12 }}>From size</dt>
            <dd style={{ margin: 0, fontVariantNumeric: 'tabular-nums' }}>
              {scaleEvent.fromSize} {scaleEvent.currency}
            </dd>
          </div>
          <div>
            <dt style={{ color: 'var(--fpm-text-muted)', fontSize: 12 }}>To size</dt>
            <dd style={{ margin: 0, fontVariantNumeric: 'tabular-nums' }}>
              {scaleEvent.toSize} {scaleEvent.currency}
            </dd>
          </div>
          <div>
            <dt style={{ color: 'var(--fpm-text-muted)', fontSize: 12 }}>Scaled at</dt>
            <dd style={{ margin: 0 }}>{scaleEvent.scaledAt.toISOString()}</dd>
          </div>
          <div>
            <dt style={{ color: 'var(--fpm-text-muted)', fontSize: 12 }}>Notes</dt>
            <dd style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{scaleEvent.notes ?? '—'}</dd>
          </div>
        </dl>
      </Card>
    </>
  );
}
