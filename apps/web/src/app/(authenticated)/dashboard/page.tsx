import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Badge, Card, EmptyState, MetricCard } from '@fpm/ui';
import { formatDisplayMoney } from '@fpm/money';
import { getDashboardAction } from '@/server/actions/dashboard';
import { getSessionAction } from '@/server/actions/auth';

function statusTone(status: string) {
  if (status === 'PAID') return 'success' as const;
  if (status === 'PENDING') return 'warning' as const;
  if (status === 'FAILED') return 'danger' as const;
  return 'neutral' as const;
}

function formatShortDate(value: Date | null) {
  if (!value) return '—';
  return value.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

function AreaChart({ points }: { points: Array<{ label: string; amountRaw: number }> }) {
  const width = 640;
  const height = 180;
  const padX = 12;
  const padY = 16;
  const max = Math.max(...points.map((p) => p.amountRaw), 1);
  const coords = points.map((p, i) => {
    const x = padX + (i / Math.max(points.length - 1, 1)) * (width - padX * 2);
    const y = height - padY - (p.amountRaw / max) * (height - padY * 2);
    return `${x},${y}`;
  });
  const line = coords.join(' ');
  const area = `${padX},${height - padY} ${line} ${width - padX},${height - padY}`;
  const yTop = max >= 1000 ? `$${Math.round(max / 1000)}K` : `$${Math.round(max)}`;
  const yMid = max >= 1000 ? `$${Math.round(max / 2000)}K` : `$${Math.round(max / 2)}`;

  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          right: 8,
          top: 0,
          fontSize: 11,
          color: 'var(--fpm-text-muted)',
        }}
      >
        {yTop}
      </div>
      <div
        style={{
          position: 'absolute',
          right: 8,
          top: '45%',
          fontSize: 11,
          color: 'var(--fpm-text-muted)',
        }}
      >
        {yMid}
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="180" role="img">
        <defs>
          <linearGradient id="fpmIncomeFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#fpmIncomeFill)" />
        <polyline
          points={line}
          fill="none"
          stroke="#0d9488"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {coords.length > 0 ? (
          <circle
            cx={Number(coords[coords.length - 1]!.split(',')[0])}
            cy={Number(coords[coords.length - 1]!.split(',')[1])}
            r="5"
            fill="#0d9488"
          />
        ) : null}
      </svg>
    </div>
  );
}

function BarChart({ points }: { points: Array<{ shortLabel: string; amountRaw: number }> }) {
  const max = Math.max(...points.map((p) => p.amountRaw), 1);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 8,
        height: 180,
        paddingTop: 8,
      }}
    >
      {points.map((p) => {
        const h = Math.max(8, (p.amountRaw / max) * 140);
        return (
          <div
            key={p.shortLabel + p.amountRaw}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <div
              title={`${p.shortLabel}: ${p.amountRaw}`}
              style={{
                width: '100%',
                maxWidth: 28,
                height: h,
                borderRadius: '8px 8px 4px 4px',
                background: 'linear-gradient(180deg, #a78bfa 0%, #7c3aed 100%)',
              }}
            />
            <span style={{ fontSize: 11, color: 'var(--fpm-text-muted)' }}>{p.shortLabel}</span>
          </div>
        );
      })}
    </div>
  );
}

function ProgressRow({
  name,
  amount,
  percent,
  color,
  subtitle,
}: {
  name: string;
  amount: string;
  percent: number;
  color: string;
  subtitle?: string;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 6,
          fontWeight: 600,
        }}
      >
        <span>{name}</span>
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{amount}</span>
      </div>
      <div
        style={{
          height: 10,
          borderRadius: 999,
          background: 'color-mix(in srgb, #0f172a 6%, transparent)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${Math.min(Math.max(percent, 2), 100)}%`,
            height: '100%',
            borderRadius: 999,
            background: color,
          }}
        />
      </div>
      {subtitle ? (
        <div style={{ marginTop: 4, fontSize: 12, color: 'var(--fpm-text-muted)' }}>{subtitle}</div>
      ) : null}
    </div>
  );
}

export default async function DashboardPage() {
  const [session, result] = await Promise.all([getSessionAction(), getDashboardAction()]);
  if (!result.ok) {
    if (result.error.code === 'UNAUTHENTICATED') redirect('/login');
    return <EmptyState title="Unable to load dashboard" description={result.error.message} />;
  }

  const { snapshot } = result;
  const m = snapshot.metrics;
  const firstName =
    session.ok && session.user.name
      ? session.user.name.split(/\s+/)[0]
      : session.ok
        ? session.user.email.split('@')[0]
        : 'trader';

  return (
    <div style={{ display: 'grid', gap: 28 }}>
      {/* Hero */}
      <Card
        style={{
          background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 55%, #f8fafc 100%)',
          padding: 24,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
            marginBottom: 18,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--fpm-text-muted)',
              }}
            >
              Trading business
            </div>
            <h1
              style={{
                margin: '6px 0 0',
                fontSize: 32,
                fontWeight: 750,
                letterSpacing: '-0.03em',
              }}
            >
              Welcome back, {firstName}.
            </h1>
          </div>
          <Link href="/withdrawals/new" className="fpm-btn fpm-btn--primary">
            + Log Withdrawal
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.5fr) minmax(220px, 0.7fr)',
            gap: 16,
          }}
          className="fpm-dash-hero-grid"
        >
          <div>
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
                fontSize: 48,
                fontWeight: 750,
                letterSpacing: '-0.04em',
                lineHeight: 1,
                marginBottom: 16,
              }}
            >
              {m.totalFundedCapital}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <Badge tone="success">{m.activeAccountCount} Active Accounts</Badge>
              <Badge tone="info">{m.firmCount} Firms</Badge>
              <Badge tone="warning">{m.certificateCount} Certificates</Badge>
              <Badge tone="success">{m.paidWithdrawalCount} Paid Withdrawals</Badge>
            </div>
          </div>

          <div
            style={{
              background: 'var(--fpm-metric-purple)',
              borderRadius: 16,
              padding: 18,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#6d28d9',
                marginBottom: 8,
              }}
            >
              Largest withdrawal
            </div>
            <div style={{ fontSize: 30, fontWeight: 750, letterSpacing: '-0.03em' }}>
              {m.largestWithdrawal}
            </div>
            <div style={{ marginTop: 10, fontSize: 13, color: '#7c3aed', fontWeight: 600 }}>
              {m.largestWithdrawalFirm ?? '—'}
            </div>
            <div style={{ marginTop: 4, fontSize: 12, color: 'var(--fpm-text-muted)' }}>
              {m.largestWithdrawalDate ?? '—'}
            </div>
          </div>
        </div>
      </Card>

      {/* Funded business KPIs */}
      <section>
        <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 750 }}>Funded Business</h2>
        <p style={{ margin: '0 0 14px', color: 'var(--fpm-text-muted)', fontSize: 14 }}>
          Prop firm accounts, payouts & income
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 12,
          }}
        >
          <MetricCard
            label="This month"
            value={m.thisMonth}
            helper={m.thisMonthHelper}
            tone="yellow"
          />
          <MetricCard
            label="Last month"
            value={m.lastMonth}
            helper={m.lastMonthHelper}
            tone="orange"
          />
          <MetricCard
            label={m.quarterLabel}
            value={m.quarterToDate}
            helper={m.quarterHelper}
            tone="green"
          />
          <MetricCard label={m.yearLabel} value={m.yearToDate} helper={m.yearHelper} tone="teal" />
          <MetricCard
            label="Lifetime income"
            value={m.lifetime}
            helper={m.lifetimeHelper}
            tone="purple"
          />
          <MetricCard
            label="Avg / month"
            value={m.averageMonthly}
            helper="Running average"
            tone="pink"
          />
        </div>
      </section>

      {/* Business snapshot */}
      <Card style={{ background: 'color-mix(in srgb, #dbeafe 45%, #fff)' }}>
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
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Business Snapshot</h2>
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
            {snapshot.asOfLabel}
          </div>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 18,
          }}
        >
          {[
            { label: 'Income yield', value: m.incomeYield, helper: 'Return on funded capital' },
            {
              label: 'Avg payout size',
              value: m.averagePayout,
              helper: `Across ${m.recognizedPayoutCount} payouts`,
            },
            { label: 'Business tenure', value: m.businessTenure, helper: m.businessTenureHelper },
            {
              label: 'Largest withdrawal',
              value: m.largestWithdrawal,
              helper: m.largestWithdrawalFirm ?? '—',
            },
            { label: 'Best month', value: m.bestMonth, helper: m.bestMonthHelper },
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
              <div style={{ fontSize: 22, fontWeight: 750, letterSpacing: '-0.02em' }}>
                {item.value}
              </div>
              <div style={{ marginTop: 4, fontSize: 12, color: 'var(--fpm-text-muted)' }}>
                {item.helper}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Lifetime income growth */}
      <Card style={{ background: 'color-mix(in srgb, #ccfbf1 40%, #fff)' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
            marginBottom: 8,
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Lifetime Income Growth</h2>
            <p style={{ margin: '4px 0 0', color: 'var(--fpm-text-muted)', fontSize: 13 }}>
              Cumulative withdrawal income over time
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--fpm-text-muted)',
              }}
            >
              Current lifetime income
            </div>
            <div style={{ fontSize: 28, fontWeight: 750 }}>{m.lifetime}</div>
          </div>
        </div>
        <AreaChart points={snapshot.cumulativeIncome} />
      </Card>

      {/* Payout trend + Income by firm */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.3fr) minmax(260px, 0.9fr)',
          gap: 16,
        }}
        className="fpm-dash-two"
      >
        <Card style={{ background: 'color-mix(in srgb, #ede9fe 50%, #fff)' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              marginBottom: 8,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Payout Trend</h2>
              <p style={{ margin: '4px 0 0', color: 'var(--fpm-text-muted)', fontSize: 13 }}>
                Monthly payout income
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  color: '#6d28d9',
                }}
              >
                THIS QUARTER
              </div>
              <div style={{ fontSize: 18, fontWeight: 750, color: '#5b21b6' }}>
                {m.quarterToDate}
              </div>
            </div>
          </div>
          <BarChart points={snapshot.payoutTrend} />
        </Card>

        <Card style={{ background: 'color-mix(in srgb, #fce7f3 55%, #fff)' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: 12,
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Income by Firm</h2>
              <p style={{ margin: '4px 0 0', color: 'var(--fpm-text-muted)', fontSize: 13 }}>
                All-time payouts
              </p>
            </div>
            <Link href="/firms" style={{ fontSize: 13, color: 'var(--fpm-primary)' }}>
              View all →
            </Link>
          </div>
          {snapshot.incomeByFirm.length === 0 ? (
            <EmptyState
              title="No firm income yet"
              description="Paid withdrawals will appear here."
            />
          ) : (
            snapshot.incomeByFirm.map((firm, idx) => (
              <ProgressRow
                key={firm.name}
                name={firm.name}
                amount={firm.amount}
                percent={firm.percent}
                color={idx === 0 ? '#7c3aed' : '#f9a8d4'}
                subtitle={`${firm.percent}% of lifetime`}
              />
            ))
          )}
        </Card>
      </div>

      {/* Recent withdrawals + Monthly payouts */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 16,
        }}
      >
        <Card>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 12,
              alignItems: 'baseline',
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Recent Withdrawals</h2>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--fpm-text-muted)' }}>
                Most recent requests
              </p>
            </div>
            <Link href="/withdrawals" style={{ fontSize: 13, color: 'var(--fpm-primary)' }}>
              View all →
            </Link>
          </div>
          {snapshot.recentWithdrawals.length === 0 ? (
            <EmptyState title="No withdrawals yet" description="Log a payout to get started." />
          ) : (
            <div style={{ display: 'grid', gap: 8 }}>
              {snapshot.recentWithdrawals.map((row, index) => (
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
                    padding: '12px',
                    borderRadius: 12,
                    background:
                      index === 0
                        ? 'color-mix(in srgb, var(--fpm-primary-pale) 85%, #fff)'
                        : 'transparent',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 650 }}>{row.firmName}</div>
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
                      <Badge tone={statusTone(row.status)}>
                        {row.status === 'PAID' ? 'Paid' : row.status}
                      </Badge>
                      <span>{formatShortDate(row.receivedAt ?? row.requestedAt)}</span>
                    </div>
                  </div>
                  <div style={{ fontWeight: 750, fontVariantNumeric: 'tabular-nums' }}>
                    {formatDisplayMoney(row.amount, row.currency)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div style={{ marginBottom: 12 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Monthly Payouts</h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--fpm-text-muted)' }}>
              Paid withdrawals, recent first
            </p>
          </div>
          {snapshot.monthlyPayouts.length === 0 ? (
            <EmptyState
              title="No monthly payouts yet"
              description="Recognized income will group here."
            />
          ) : (
            <div style={{ display: 'grid', gap: 8 }}>
              {snapshot.monthlyPayouts.map((row, index) => (
                <div
                  key={row.key}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    alignItems: 'center',
                    padding: '12px',
                    borderRadius: 12,
                    background:
                      index === 0
                        ? 'color-mix(in srgb, var(--fpm-primary-pale) 85%, #fff)'
                        : 'transparent',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 650 }}>{row.label}</div>
                    <div style={{ marginTop: 4, fontSize: 12, color: 'var(--fpm-text-muted)' }}>
                      {row.count} payout{row.count === 1 ? '' : 's'}
                    </div>
                  </div>
                  <div style={{ fontWeight: 750 }}>{row.amount}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Real accounts */}
      <section>
        <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 750 }}>Real Accounts</h2>
        <p style={{ margin: '0 0 14px', color: 'var(--fpm-text-muted)', fontSize: 14 }}>
          Broker accounts, equity & P/L
        </p>

        <Card
          style={{
            background: 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 70%)',
            marginBottom: 14,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--fpm-text-muted)',
                }}
              >
                Current real equity
              </div>
              <div style={{ fontSize: 36, fontWeight: 750, letterSpacing: '-0.03em' }}>
                {m.currentRealEquity}
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: 14,
                  marginTop: 8,
                  fontSize: 13,
                  color: 'var(--fpm-success-dark)',
                  fontWeight: 600,
                }}
              >
                <span>
                  · {m.brokerAccountCount} Broker Account{m.brokerAccountCount === 1 ? '' : 's'}
                </span>
                <span>
                  · {m.brokerCount} Broker{m.brokerCount === 1 ? '' : 's'}
                </span>
              </div>
            </div>
            <div
              style={{
                background: '#fff',
                borderRadius: 14,
                padding: '14px 18px',
                minWidth: 160,
                boxShadow: 'var(--fpm-shadow-card)',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  color: 'var(--fpm-text-muted)',
                }}
              >
                NET P/L
              </div>
              <div style={{ fontSize: 24, fontWeight: 750, color: 'var(--fpm-success-dark)' }}>
                {m.brokerNetPl}
              </div>
              <div style={{ fontSize: 13, color: 'var(--fpm-text-muted)', marginTop: 4 }}>
                ROI: {m.brokerRoi}
              </div>
            </div>
          </div>
        </Card>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 12,
            marginBottom: 14,
          }}
        >
          <MetricCard label="Current equity" value={m.currentRealEquity} tone="purple" />
          <MetricCard label="Net P/L" value={m.brokerNetPl} tone="teal" />
          <MetricCard label="ROI" value={m.brokerRoi} tone="neutral" />
          <MetricCard label="Total deposits" value={m.totalDeposits} tone="yellow" />
          <MetricCard label="Total withdrawals" value={m.totalBrokerWithdrawals} tone="pink" />
          <MetricCard label="Peak equity" value={m.peakEquity} tone="purple" />
          <MetricCard
            label="Trading drawdown"
            value={m.tradingDrawdown}
            helper="excl. withdrawals"
            tone="teal"
          />
          <MetricCard label="Accounts" value={String(m.brokerAccountCount)} tone="orange" />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 14,
          }}
        >
          <Card style={{ background: 'color-mix(in srgb, #dcfce7 45%, #fff)' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}
            >
              <h3 style={{ margin: 0, fontSize: 16 }}>Profit by Broker</h3>
              <Link href="/broker-accounts" style={{ fontSize: 13, color: 'var(--fpm-primary)' }}>
                View all →
              </Link>
            </div>
            {snapshot.profitByBroker.length === 0 ? (
              <p style={{ color: 'var(--fpm-text-muted)', fontSize: 13 }}>No broker P/L yet.</p>
            ) : (
              snapshot.profitByBroker.map((row) => {
                const max = Math.max(
                  ...snapshot.profitByBroker.map((r) => Math.abs(r.amountRaw)),
                  1,
                );
                return (
                  <ProgressRow
                    key={row.name}
                    name={row.name}
                    amount={row.amount}
                    percent={Math.round((Math.abs(row.amountRaw) / max) * 100)}
                    color="#16a34a"
                  />
                );
              })
            )}
          </Card>
          <Card style={{ background: 'color-mix(in srgb, #ede9fe 50%, #fff)' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}
            >
              <h3 style={{ margin: 0, fontSize: 16 }}>Profit by Account</h3>
              <Link href="/broker-accounts" style={{ fontSize: 13, color: 'var(--fpm-primary)' }}>
                View all →
              </Link>
            </div>
            {snapshot.profitByAccount.length === 0 ? (
              <p style={{ color: 'var(--fpm-text-muted)', fontSize: 13 }}>No account P/L yet.</p>
            ) : (
              snapshot.profitByAccount.map((row) => {
                const max = Math.max(
                  ...snapshot.profitByAccount.map((r) => Math.abs(r.amountRaw)),
                  1,
                );
                return (
                  <ProgressRow
                    key={row.name}
                    name={row.name}
                    amount={row.amount}
                    percent={Math.round((Math.abs(row.amountRaw) / max) * 100)}
                    color="#7c3aed"
                  />
                );
              })
            )}
          </Card>
        </div>
      </section>

      {/* Combined overview */}
      <section>
        <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 750 }}>
          Combined Business Overview
        </h2>
        <p style={{ margin: '0 0 14px', color: 'var(--fpm-text-muted)', fontSize: 14 }}>
          Total across funded + real accounts
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 14,
          }}
        >
          <Card style={{ background: 'linear-gradient(160deg, #dbeafe, #fff)' }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                color: 'var(--fpm-text-muted)',
              }}
            >
              Total managed capital
            </div>
            <div style={{ fontSize: 32, fontWeight: 750, margin: '8px 0' }}>
              {m.combinedManagedCapital}
            </div>
            <div style={{ fontSize: 13, color: 'var(--fpm-text-secondary)' }}>
              Funded Capital: {m.fundedCapitalRaw}
              <br />
              Real Equity: {m.realEquityRaw}
            </div>
          </Card>
          <Card style={{ background: 'linear-gradient(160deg, #dcfce7, #fff)' }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                color: 'var(--fpm-text-muted)',
              }}
            >
              Total generated profit
            </div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 750,
                margin: '8px 0',
                color: 'var(--fpm-success-dark)',
              }}
            >
              {m.combinedGeneratedProfit}
            </div>
            <div style={{ fontSize: 13, color: 'var(--fpm-text-secondary)' }}>
              Funded Payouts: {m.fundedPayoutsRaw}
              <br />
              Real Acct P/L: {m.realPlRaw}
            </div>
          </Card>
          <Card>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                color: 'var(--fpm-text-muted)',
                marginBottom: 10,
              }}
            >
              Account summary
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 8,
              }}
            >
              {[
                {
                  label: 'Funded accts',
                  value: m.totalAccountCount,
                  tone: 'var(--fpm-metric-green)',
                },
                {
                  label: 'Broker accts',
                  value: m.brokerAccountCount,
                  tone: 'var(--fpm-metric-teal)',
                },
                { label: 'Prop firms', value: m.firmCount, tone: 'var(--fpm-metric-purple)' },
                { label: 'Brokers', value: m.brokerCount, tone: 'var(--fpm-metric-orange)' },
              ].map((cell) => (
                <div
                  key={cell.label}
                  style={{
                    background: cell.tone,
                    borderRadius: 12,
                    padding: '12px 10px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 20, fontWeight: 750 }}>{cell.value}</div>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      color: 'var(--fpm-text-secondary)',
                    }}
                  >
                    {cell.label}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <style>{`
        @media (max-width: 960px) {
          .fpm-dash-hero-grid, .fpm-dash-two { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
