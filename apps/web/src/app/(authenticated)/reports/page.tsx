import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  MetricCard,
  PageHeader,
  Select,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@fpm/ui';
import { getReportsAction } from '@/server/actions/reports';

function statusTone(status: string) {
  if (status === 'PAID') return 'success' as const;
  if (status === 'PENDING') return 'warning' as const;
  if (status === 'FAILED') return 'danger' as const;
  return 'neutral' as const;
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; currency?: string }>;
}) {
  const params = await searchParams;
  const result = await getReportsAction({
    period: params.period || undefined,
    currency: params.currency || undefined,
  });

  if (!result.ok) {
    if (result.error.code === 'UNAUTHENTICATED') redirect('/login');
    return (
      <>
        <PageHeader title="Reports" description="Currency-safe funded analytics." />
        <EmptyState title="Unable to load reports" description={result.error.message} />
      </>
    );
  }

  const { snapshot } = result;

  return (
    <>
      <PageHeader
        eyebrow="Analytics"
        title="Reports"
        description="Recognized payouts use PAID + receivedAt. Amounts never mix currencies."
      />

      <Alert tone="info" title="Confirmed report metrics">
        {snapshot.deferred.join(' · ')}
      </Alert>

      <form
        method="get"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'end',
          marginTop: 20,
          marginBottom: 20,
        }}
      >
        <label style={{ display: 'grid', gap: 6, fontSize: 13 }}>
          Period
          <Select name="period" defaultValue={snapshot.period} style={{ minWidth: 160 }}>
            <option value="month">This month (UTC)</option>
            <option value="quarter">This quarter (UTC)</option>
            <option value="year">This year (UTC)</option>
            <option value="all">All time</option>
          </Select>
        </label>
        <label style={{ display: 'grid', gap: 6, fontSize: 13 }}>
          Currency filter
          <Select
            name="currency"
            defaultValue={snapshot.currencyFilter ?? ''}
            style={{ minWidth: 140 }}
          >
            <option value="">All currencies</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </Select>
        </label>
        <Button type="submit" variant="secondary" size="sm">
          Apply
        </Button>
      </form>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
        }}
      >
        <MetricCard
          label={`Recognized · ${snapshot.periodLabel}`}
          value={snapshot.totals.recognizedInPeriod}
          helper="PAID + receivedAt in period"
          tone="purple"
        />
        <MetricCard
          label="Lifetime recognized"
          value={snapshot.totals.recognizedLifetime}
          helper="All-time recognized (currency filter applied)"
          tone="yellow"
        />
        <MetricCard
          label="Pending"
          value={snapshot.totals.pendingAllTime}
          helper="Status PENDING"
          tone="orange"
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 16,
          marginTop: 24,
        }}
      >
        <Card>
          <h2 style={{ margin: '0 0 12px', fontSize: 16 }}>Withdrawal status</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {(Object.entries(snapshot.withdrawalStatusDistribution) as Array<[string, number]>).map(
              ([status, count]) => (
                <Badge key={status} tone={statusTone(status)}>
                  {status}: {count}
                </Badge>
              ),
            )}
          </div>
        </Card>
        <Card>
          <h2 style={{ margin: '0 0 12px', fontSize: 16 }}>Account phases</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {(Object.entries(snapshot.phaseDistribution) as Array<[string, number]>).map(
              ([phase, count]) => (
                <Badge key={phase} tone={phase === 'ACTIVE' ? 'info' : 'neutral'}>
                  {phase}: {count}
                </Badge>
              ),
            )}
          </div>
        </Card>
      </div>

      <section style={{ marginTop: 32 }}>
        <PageHeader title="Income by firm" description="Recognized payouts in selected period." />
        {snapshot.incomeByFirm.length === 0 ? (
          <EmptyState
            title="No recognized income"
            description="No PAID+receivedAt rows match filters."
          />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Firm</TH>
                <TH>Recognized</TH>
              </TR>
            </THead>
            <TBody>
              {snapshot.incomeByFirm.map((row) => (
                <TR key={row.label}>
                  <TD>{row.label}</TD>
                  <TD style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                    {row.amounts}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </section>

      <section style={{ marginTop: 32 }}>
        <PageHeader
          title="Income by account"
          description="Recognized payouts in selected period."
          actions={
            <Link href="/withdrawals" className="fpm-btn fpm-btn--secondary">
              Withdrawals
            </Link>
          }
        />
        {snapshot.incomeByAccount.length === 0 ? (
          <EmptyState
            title="No recognized income"
            description="No PAID+receivedAt rows match filters."
          />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Account</TH>
                <TH>Recognized</TH>
              </TR>
            </THead>
            <TBody>
              {snapshot.incomeByAccount.map((row) => (
                <TR key={row.label}>
                  <TD>{row.label}</TD>
                  <TD style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                    {row.amounts}
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
