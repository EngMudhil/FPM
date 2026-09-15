import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge, Card, PageHeader } from '@fpm/ui';
import { getAccountAction } from '@/server/actions/accounts';
import { accountDisplayName } from '@/server/services/accounts';
import { AccountArchiveButton } from '@/components/accounts/account-archive-button';

function phaseTone(phase: string) {
  if (phase === 'ACTIVE') return 'success' as const;
  if (phase === 'PAUSED') return 'warning' as const;
  return 'neutral' as const;
}

export default async function AccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getAccountAction(id);
  if (!result.ok) {
    if (result.error.code === 'NOT_FOUND') notFound();
    return <p role="alert">{result.error.message}</p>;
  }

  const { account } = result;
  const title = accountDisplayName(account);

  return (
    <>
      <PageHeader
        title={title}
        description={`${account.firmName}${account.accountNumber ? ` · #${account.accountNumber}` : ''}`}
        breadcrumbs={[{ label: 'Funded Accounts', href: '/accounts' }, { label: title }]}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href={`/accounts/${account.id}/edit`} className="fpm-btn fpm-btn--secondary">
              Edit
            </Link>
            <AccountArchiveButton accountId={account.id} archived={Boolean(account.archivedAt)} />
          </div>
        }
      />
      <Card>
        <dl style={{ display: 'grid', gap: 12, margin: 0 }}>
          <div>
            <dt style={{ color: 'var(--fpm-text-muted)', fontSize: 12 }}>Phase</dt>
            <dd style={{ margin: 0 }}>
              <Badge tone={phaseTone(account.phase)}>{account.phase}</Badge>
            </dd>
          </div>
          <div>
            <dt style={{ color: 'var(--fpm-text-muted)', fontSize: 12 }}>Firm</dt>
            <dd style={{ margin: 0 }}>
              <Link href={`/firms/${account.firmId}`}>{account.firmName}</Link>
            </dd>
          </div>
          <div>
            <dt style={{ color: 'var(--fpm-text-muted)', fontSize: 12 }}>Sizes</dt>
            <dd style={{ margin: 0, fontVariantNumeric: 'tabular-nums' }}>
              Initial {account.initialSize} {account.currency} · Current {account.currentSize}{' '}
              {account.currency}
            </dd>
          </div>
          <div>
            <dt style={{ color: 'var(--fpm-text-muted)', fontSize: 12 }}>Platform</dt>
            <dd style={{ margin: 0 }}>{account.platform ?? '—'}</dd>
          </div>
          <div>
            <dt style={{ color: 'var(--fpm-text-muted)', fontSize: 12 }}>Start date</dt>
            <dd style={{ margin: 0 }}>{account.startDate ?? '—'}</dd>
          </div>
          <div>
            <dt style={{ color: 'var(--fpm-text-muted)', fontSize: 12 }}>Notes</dt>
            <dd style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{account.notes ?? '—'}</dd>
          </div>
        </dl>
      </Card>
    </>
  );
}
