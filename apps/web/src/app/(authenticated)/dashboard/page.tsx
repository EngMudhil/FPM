import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  Alert,
  Badge,
  Card,
  EmptyState,
  MetricCard,
  PageHeader,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@fpm/ui';
import { getDashboardAction } from '@/server/actions/dashboard';

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

export default async function DashboardPage() {
  const result = await getDashboardAction();
  if (!result.ok) {
    if (result.error.code === 'UNAUTHENTICATED') redirect('/login');
    return (
      <>
        <PageHeader title="Dashboard" description="Funded overview." />
        <EmptyState title="Unable to load dashboard" description={result.error.message} />
      </>
    );
  }

  const { workspace, snapshot } = result;
  const { metrics, withdrawalStatusDistribution, phaseDistribution } = snapshot;

  return (
    <>
      <PageHeader
        eyebrow="Funded"
        title="Dashboard"
        description={`${workspace.name} · Recognized income uses PAID + receivedAt (Financial Domain).`}
        actions={
          <Link href="/withdrawals/new" className="fpm-btn fpm-btn--primary">
            + Log Withdrawal
          </Link>
        }
      />

      <Alert tone="info" title="Financial Domain (ADR-014)">
        Capital, growth, yield, averages, and same-currency combined totals come from
        `@fpm/financial`. Mixed currencies never silently combine.
      </Alert>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16,
          marginTop: 24,
        }}
      >
        <MetricCard
          label="Total funded capital"
          value={metrics.totalFundedCapital}
          helper="SUM(initialSize) · per currency"
          tone="neutral"
        />
        <MetricCard
          label="Current funded capital"
          value={metrics.currentFundedCapital}
          helper="SUM(currentSize) · per currency"
          tone="neutral"
        />
        <MetricCard
          label="Portfolio growth"
          value={metrics.portfolioGrowth}
          helper="(current−initial)/initial"
          tone="teal"
        />
        <MetricCard
          label="This month"
          value={metrics.thisMonthRecognized}
          helper="Recognized · receivedAt · UTC month"
          tone="yellow"
        />
        <MetricCard
          label="Last month"
          value={metrics.lastMonthRecognized}
          helper="Recognized · receivedAt · UTC month"
          tone="orange"
        />
        <MetricCard
          label="Lifetime"
          value={metrics.lifetimeRecognized}
          helper={`${metrics.recognizedPayoutCount} recognized payouts`}
          tone="purple"
        />
        <MetricCard
          label="Pending"
          value={metrics.pendingAmount}
          helper="Status PENDING · per currency"
          tone="pink"
        />
        <MetricCard label="Avg payout" value={metrics.averagePayout} helper="Recognized ÷ count" />
        <MetricCard
          label="Avg / month"
          value={metrics.averageMonthly}
          helper="Recognized ÷ inclusive UTC months"
        />
        <MetricCard
          label="Income yield"
          value={metrics.incomeYield}
          helper="Lifetime ÷ current capital"
        />
        <MetricCard
          label="Largest withdrawal"
          value={metrics.largestWithdrawal}
          helper="Max recognized"
        />
        <MetricCard label="Best month" value={metrics.bestMonth} helper="UTC month of receivedAt" />
        <MetricCard
          label="Active accounts"
          value={String(metrics.activeAccountCount)}
          helper={`${metrics.totalAccountCount} total (non-archived)`}
        />
        <MetricCard
          label="Combined capital"
          value={metrics.combinedManagedCapital}
          helper="Funded current + broker equity (same FX only)"
        />
        <MetricCard
          label="Combined profit"
          value={metrics.combinedGeneratedProfit}
          helper="Recognized + broker P/L (same FX only)"
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
            {(Object.entries(withdrawalStatusDistribution) as Array<[string, number]>).map(
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
            {(Object.entries(phaseDistribution) as Array<[string, number]>).map(
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
        <PageHeader
          title="Recent withdrawals"
          description="Latest payout records."
          actions={
            <Link href="/withdrawals" className="fpm-btn fpm-btn--secondary">
              View all
            </Link>
          }
        />
        {snapshot.recentWithdrawals.length === 0 ? (
          <EmptyState
            title="No withdrawals yet"
            description="Log a payout to populate income metrics."
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
              </TR>
            </THead>
            <TBody>
              {snapshot.recentWithdrawals.map((row) => (
                <TR key={row.id}>
                  <TD style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                    <Link href={`/withdrawals/${row.id}`}>
                      {row.amount} {row.currency}
                    </Link>
                  </TD>
                  <TD>
                    <Badge tone={statusTone(row.status)}>{row.status}</Badge>
                  </TD>
                  <TD>{row.accountLabel}</TD>
                  <TD>{formatDate(row.requestedAt)}</TD>
                  <TD>{formatDate(row.receivedAt)}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </section>

      <section style={{ marginTop: 32 }}>
        <PageHeader
          title="Recent scale events"
          description="Latest size upgrades."
          actions={
            <Link href="/scale-events" className="fpm-btn fpm-btn--secondary">
              View all
            </Link>
          }
        />
        {snapshot.recentScaleEvents.length === 0 ? (
          <EmptyState
            title="No scale events yet"
            description="Record a scale-up when an account size increases."
          />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Account</TH>
                <TH>From → To</TH>
                <TH>Scaled</TH>
              </TR>
            </THead>
            <TBody>
              {snapshot.recentScaleEvents.map((row) => (
                <TR key={row.id}>
                  <TD>
                    <Link href={`/scale-events/${row.id}`}>{row.accountLabel}</Link>
                  </TD>
                  <TD style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                    {row.fromSize} → {row.toSize} {row.currency}
                  </TD>
                  <TD>{formatDate(row.scaledAt)}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </section>
    </>
  );
}
