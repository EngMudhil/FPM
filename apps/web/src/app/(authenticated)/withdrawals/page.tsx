import Link from 'next/link';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  PageHeader,
  Select,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@fpm/ui';
import { listWithdrawalsAction } from '@/server/actions/withdrawals';

function statusTone(status: string) {
  if (status === 'PAID') return 'success' as const;
  if (status === 'PENDING') return 'warning' as const;
  if (status === 'FAILED') return 'danger' as const;
  return 'neutral' as const;
}

function formatDate(value: Date | null) {
  if (!value) return '—';
  return value.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default async function WithdrawalsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? '1') || 1;
  const result = await listWithdrawalsAction({
    status: params.status || undefined,
    page,
    pageSize: 50,
  });

  if (!result.ok) {
    return (
      <>
        <PageHeader title="Withdrawals" description="Manual payout records." />
        <EmptyState title="Unable to load withdrawals" description={result.error.message} />
      </>
    );
  }

  const { items, total, totals } = result;
  const recognized = Object.entries(totals.recognizedByCurrency);
  const pending = Object.entries(totals.pendingByCurrency);

  return (
    <>
      <PageHeader
        title="Withdrawals"
        description="Manual payout ledger. Paid income uses received date (receivedAt)."
        actions={
          <Link href="/withdrawals/new" className="fpm-btn fpm-btn--primary">
            + Record Withdrawal
          </Link>
        }
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 12,
          marginBottom: 20,
        }}
      >
        <Card>
          <div style={{ fontSize: 12, color: 'var(--fpm-text-muted)' }}>
            Recognized (PAID + received)
          </div>
          <div style={{ marginTop: 6, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
            {recognized.length === 0 ? '—' : recognized.map(([c, a]) => `${a} ${c}`).join(' · ')}
          </div>
        </Card>
        <Card>
          <div style={{ fontSize: 12, color: 'var(--fpm-text-muted)' }}>Pending</div>
          <div style={{ marginTop: 6, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
            {pending.length === 0 ? '—' : pending.map(([c, a]) => `${a} ${c}`).join(' · ')}
          </div>
        </Card>
      </div>

      <form
        method="get"
        style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}
      >
        <Select name="status" defaultValue={params.status ?? ''} style={{ maxWidth: 180 }}>
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="PAID">Paid</option>
          <option value="FAILED">Failed</option>
          <option value="REVERSED">Reversed</option>
        </Select>
        <Button type="submit" variant="secondary" size="sm">
          Filter
        </Button>
        <span style={{ color: 'var(--fpm-text-muted)', fontSize: 13 }}>
          {total} withdrawal{total === 1 ? '' : 's'}
        </span>
      </form>

      {items.length === 0 ? (
        <EmptyState
          title="No withdrawals yet"
          description="Record a manual payout from a funded account."
        />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Amount</TH>
              <TH>Status</TH>
              <TH>Account</TH>
              <TH>Requested</TH>
              <TH>Received</TH>
              <TH>Actions</TH>
            </TR>
          </THead>
          <TBody>
            {items.map((row) => (
              <TR key={row.id}>
                <TD style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                  {row.amount} {row.currency}
                </TD>
                <TD>
                  <Badge tone={statusTone(row.status)}>{row.status}</Badge>
                </TD>
                <TD>{row.accountLabel}</TD>
                <TD>{formatDate(row.requestedAt)}</TD>
                <TD>{formatDate(row.receivedAt)}</TD>
                <TD>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <Link href={`/withdrawals/${row.id}`}>View</Link>
                    <Link href={`/withdrawals/${row.id}/edit`}>Edit</Link>
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
