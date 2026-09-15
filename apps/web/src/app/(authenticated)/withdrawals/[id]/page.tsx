import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge, Card, PageHeader } from '@fpm/ui';
import { getWithdrawalAction } from '@/server/actions/withdrawals';
import { WithdrawalDeleteButton } from '@/components/withdrawals/withdrawal-delete-button';

function statusTone(status: string) {
  if (status === 'PAID') return 'success' as const;
  if (status === 'PENDING') return 'warning' as const;
  if (status === 'FAILED') return 'danger' as const;
  return 'neutral' as const;
}

export default async function WithdrawalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getWithdrawalAction(id);
  if (!result.ok) {
    if (result.error.code === 'NOT_FOUND') notFound();
    return <p role="alert">{result.error.message}</p>;
  }

  const { withdrawal } = result;

  return (
    <>
      <PageHeader
        title={`${withdrawal.amount} ${withdrawal.currency}`}
        description={withdrawal.accountLabel}
        breadcrumbs={[
          { label: 'Withdrawals', href: '/withdrawals' },
          { label: `${withdrawal.amount} ${withdrawal.currency}` },
        ]}
        actions={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <Link
              href={`/withdrawals/${withdrawal.id}/edit`}
              className="fpm-btn fpm-btn--secondary"
            >
              Edit
            </Link>
            <WithdrawalDeleteButton withdrawalId={withdrawal.id} status={withdrawal.status} />
          </div>
        }
      />
      <Card>
        <dl style={{ display: 'grid', gap: 12, margin: 0 }}>
          <div>
            <dt style={{ color: 'var(--fpm-text-muted)', fontSize: 12 }}>Status</dt>
            <dd style={{ margin: 0 }}>
              <Badge tone={statusTone(withdrawal.status)}>{withdrawal.status}</Badge>
            </dd>
          </div>
          <div>
            <dt style={{ color: 'var(--fpm-text-muted)', fontSize: 12 }}>Account</dt>
            <dd style={{ margin: 0 }}>
              <Link href={`/accounts/${withdrawal.tradingAccountId}`}>
                {withdrawal.accountLabel}
              </Link>
            </dd>
          </div>
          <div>
            <dt style={{ color: 'var(--fpm-text-muted)', fontSize: 12 }}>Requested</dt>
            <dd style={{ margin: 0 }}>{withdrawal.requestedAt.toISOString()}</dd>
          </div>
          <div>
            <dt style={{ color: 'var(--fpm-text-muted)', fontSize: 12 }}>Received (receivedAt)</dt>
            <dd style={{ margin: 0 }}>{withdrawal.receivedAt?.toISOString() ?? '—'}</dd>
          </div>
          <div>
            <dt style={{ color: 'var(--fpm-text-muted)', fontSize: 12 }}>Notes</dt>
            <dd style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{withdrawal.notes ?? '—'}</dd>
          </div>
        </dl>
      </Card>
    </>
  );
}
