import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Badge, Card, EmptyState, MetricCard, PageHeader } from '@fpm/ui';
import { formatDisplayMoney } from '@fpm/money';
import { getDashboardAction } from '@/server/actions/dashboard';
import { getSessionAction } from '@/server/actions/auth';

function IconCalendar() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M3 9h18M8 3v4M16 3v4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconTrend() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 16l5-5 4 4 7-8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconGem() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 8l6-4 6 4-6 12L6 8z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconBars() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 19V10M12 19V5M19 19v-7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconClock() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 8v5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconCash() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

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

function formatShortDate(value: Date | null) {
  if (!value) return '—';
  return value.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default async function DashboardPage() {
  const [session, result] = await Promise.all([getSessionAction(), getDashboardAction()]);
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
  const { metrics, recentWithdrawals, recentScaleEvents } = snapshot;
  const firstName =
    session.ok && session.user.name
      ? session.user.name.split(' ')[0]
      : session.ok
        ? session.user.email.split('@')[0]
        : 'trader';

  return (
    <>
      <PageHeader
        eyebrow="Trading business"
        title={`Welcome back, ${firstName}.`}
        description={`${workspace.name} · Prop firm accounts, payouts & income.`}
        actions={
          <Link href="/withdrawals/new" className="fpm-btn fpm-btn--primary">
            + Log Withdrawal
          </Link>
        }
      />

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.6fr) minmax(220px, 0.7fr)',
          gap: 16,
          marginBottom: 28,
        }}
        className="fpm-dash-hero"
      >
        <Card style={{ background: 'linear-gradient(180deg, #fff 0%, #f8fafc 100%)' }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--fpm-text-muted)',
              marginBottom: 8,
            }}
          >
            Total funded capital
          </div>
          <div
            style={{
              fontSize: 44,
              fontWeight: 750,
              letterSpacing: '-0.04em',
              lineHeight: 1.05,
              marginBottom: 16,
            }}
          >
            {metrics.totalFundedCapital}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <Badge tone="success">{metrics.activeAccountCount} Active Accounts</Badge>
            <Badge tone="info">{metrics.firmCount} Firms</Badge>
            <Badge tone="neutral">{metrics.totalAccountCount} Accounts</Badge>
            <Badge tone="success">{metrics.paidWithdrawalCount} Paid Withdrawals</Badge>
          </div>
          <div
            style={{
              marginTop: 18,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
            }}
          >
            <div>
              <div style={{ fontSize: 11, color: 'var(--fpm-text-muted)', fontWeight: 600 }}>
                CURRENT CAPITAL
              </div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{metrics.currentFundedCapital}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--fpm-text-muted)', fontWeight: 600 }}>
                PORTFOLIO GROWTH
              </div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{metrics.portfolioGrowth}</div>
            </div>
          </div>
        </Card>

        <Card style={{ background: 'var(--fpm-metric-purple)' }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--fpm-text-muted)',
              marginBottom: 8,
            }}
          >
            Largest withdrawal
          </div>
          <div style={{ fontSize: 32, fontWeight: 750, letterSpacing: '-0.03em' }}>
            {metrics.largestWithdrawal}
          </div>
          <div style={{ marginTop: 10, fontSize: 13, color: 'var(--fpm-text-secondary)' }}>
            Best month · {metrics.bestMonth}
          </div>
        </Card>
      </section>

      <section style={{ marginBottom: 28 }}>
        <PageHeader
          title="Funded business"
          description="Period income and running averages from recognized payouts."
        />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: 14,
          }}
        >
          <MetricCard
            label="This month"
            value={metrics.thisMonthRecognized}
            helper="Recognized · UTC month"
            tone="yellow"
            icon={<IconCalendar />}
          />
          <MetricCard
            label="Last month"
            value={metrics.lastMonthRecognized}
            helper="Recognized · prior UTC month"
            tone="orange"
            icon={<IconTrend />}
          />
          <MetricCard
            label="Lifetime income"
            value={metrics.lifetimeRecognized}
            helper={`${metrics.recognizedPayoutCount} paid payouts`}
            tone="purple"
            icon={<IconGem />}
          />
          <MetricCard
            label="Avg / month"
            value={metrics.averageMonthly}
            helper="Running average"
            tone="pink"
            icon={<IconBars />}
          />
          <MetricCard
            label="Pending"
            value={metrics.pendingAmount}
            helper="Awaiting receipt"
            tone="pink"
            icon={<IconClock />}
          />
          <MetricCard
            label="Avg payout"
            value={metrics.averagePayout}
            helper="Across recognized payouts"
            tone="teal"
            icon={<IconCash />}
          />
        </div>
      </section>

      <section style={{ marginBottom: 28 }}>
        <Card style={{ background: 'color-mix(in srgb, var(--fpm-primary-pale) 65%, #fff)' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
              marginBottom: 18,
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Business snapshot</h2>
              <p style={{ margin: '4px 0 0', color: 'var(--fpm-text-muted)', fontSize: 13 }}>
                Funded trading overview · all time
              </p>
            </div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.06em',
                color: 'var(--fpm-text-muted)',
              }}
            >
              {new Date()
                .toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
                .toUpperCase()}
            </div>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 16,
            }}
          >
            {[
              { label: 'Income yield', value: metrics.incomeYield },
              { label: 'Avg payout size', value: metrics.averagePayout },
              { label: 'Largest withdrawal', value: metrics.largestWithdrawal },
              { label: 'Best month', value: metrics.bestMonth },
              { label: 'Combined capital', value: metrics.combinedManagedCapital },
              { label: 'Combined profit', value: metrics.combinedGeneratedProfit },
            ].map((item) => (
              <div key={item.label}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: 'var(--fpm-text-muted)',
                    marginBottom: 6,
                  }}
                >
                  {item.label}
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 16,
          marginBottom: 28,
        }}
      >
        <Card>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: 14,
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: 16 }}>Recent withdrawals</h2>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--fpm-text-muted)' }}>
                Most recent requests
              </p>
            </div>
            <Link href="/withdrawals" style={{ fontSize: 13, color: 'var(--fpm-primary)' }}>
              View all →
            </Link>
          </div>
          {recentWithdrawals.length === 0 ? (
            <EmptyState title="No withdrawals yet" description="Log a payout to populate income." />
          ) : (
            <div style={{ display: 'grid', gap: 8 }}>
              {recentWithdrawals.map((row, index) => (
                <Link
                  key={row.id}
                  href={`/withdrawals/${row.id}`}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    alignItems: 'center',
                    textDecoration: 'none',
                    color: 'inherit',
                    padding: '12px 12px',
                    borderRadius: 12,
                    background:
                      index === 0
                        ? 'color-mix(in srgb, var(--fpm-primary-pale) 80%, #fff)'
                        : 'transparent',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{row.accountLabel}</div>
                    <div
                      style={{
                        display: 'flex',
                        gap: 8,
                        alignItems: 'center',
                        marginTop: 4,
                        fontSize: 12,
                        color: 'var(--fpm-text-muted)',
                      }}
                    >
                      <Badge tone={statusTone(row.status)}>{row.status}</Badge>
                      <span>{formatShortDate(row.receivedAt ?? row.requestedAt)}</span>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                    {formatDisplayMoney(row.amount, row.currency)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: 14,
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: 16 }}>Recent scale events</h2>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--fpm-text-muted)' }}>
                Latest size upgrades
              </p>
            </div>
            <Link href="/scale-events" style={{ fontSize: 13, color: 'var(--fpm-primary)' }}>
              View all →
            </Link>
          </div>
          {recentScaleEvents.length === 0 ? (
            <EmptyState
              title="No scale events yet"
              description="Record a scale-up when an account size increases."
            />
          ) : (
            <div style={{ display: 'grid', gap: 8 }}>
              {recentScaleEvents.map((row, index) => (
                <Link
                  key={row.id}
                  href={`/scale-events/${row.id}`}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    alignItems: 'center',
                    textDecoration: 'none',
                    color: 'inherit',
                    padding: '12px 12px',
                    borderRadius: 12,
                    background:
                      index === 0
                        ? 'color-mix(in srgb, var(--fpm-metric-green) 70%, #fff)'
                        : 'transparent',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{row.accountLabel}</div>
                    <div style={{ marginTop: 4, fontSize: 12, color: 'var(--fpm-text-muted)' }}>
                      {formatDate(row.scaledAt)}
                    </div>
                  </div>
                  <div
                    style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums', fontSize: 13 }}
                  >
                    {formatDisplayMoney(row.fromSize, row.currency)} →{' '}
                    {formatDisplayMoney(row.toSize, row.currency)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .fpm-dash-hero { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
