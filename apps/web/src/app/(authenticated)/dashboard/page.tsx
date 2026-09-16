import Link from 'next/link';
import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { Alert, Badge, Card, EmptyState, MetricCard } from '@fpm/ui';
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

function Icon({ d, paths }: { d?: string; paths?: string[] }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      {d ? <path d={d} strokeLinecap="round" strokeLinejoin="round" /> : null}
      {paths?.map((p) => (
        <path key={p} d={p} strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </svg>
  );
}

function PeriodNav() {
  return (
    <div className="fpm-metric-card__nav" aria-hidden>
      <span>‹</span>
      <span>›</span>
    </div>
  );
}

function SectionDivider({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        paddingTop: 16,
      }}
    >
      <div style={{ flexShrink: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>{title}</div>
        <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{subtitle}</div>
      </div>
      <div style={{ flex: 1, height: 1, background: '#E2E8F0', minWidth: 24 }} aria-hidden />
    </div>
  );
}

function AreaChart({ points }: { points: Array<{ label: string; amountRaw: number }> }) {
  const width = 720;
  const height = 200;
  const padL = 8;
  const padR = 48;
  const padT = 12;
  const padB = 28;
  const max = Math.max(...points.map((p) => p.amountRaw), 1);
  const coords = points.map((p, i) => {
    const x = padL + (i / Math.max(points.length - 1, 1)) * (width - padL - padR);
    const y = padT + (1 - p.amountRaw / max) * (height - padT - padB);
    return { x, y, label: p.label };
  });
  const line = coords.map((c) => `${c.x},${c.y}`).join(' ');
  const area = `${padL},${height - padB} ${line} ${coords[coords.length - 1]?.x ?? padL},${height - padB}`;
  const yTicks = [1, 0.66, 0.33].map((f) => {
    const v = max * f;
    return v >= 1000 ? `$${Math.round(v / 1000)}K` : `$${Math.round(v)}`;
  });

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="200" role="img">
        <defs>
          <linearGradient id="fpmIncomeFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {yTicks.map((label, i) => {
          const y = padT + (i / (yTicks.length - 1 || 1)) * (height - padT - padB);
          return (
            <g key={label}>
              <line
                x1={padL}
                x2={width - padR}
                y1={y}
                y2={y}
                stroke="color-mix(in srgb, #0f172a 6%, transparent)"
              />
              <text x={width - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#94a3b8">
                {label}
              </text>
            </g>
          );
        })}
        <polygon points={area} fill="url(#fpmIncomeFill)" />
        <polyline
          points={line}
          fill="none"
          stroke="#7c3aed"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {coords.length > 0 ? (
          <circle
            cx={coords[coords.length - 1]!.x}
            cy={coords[coords.length - 1]!.y}
            r="5"
            fill="#7c3aed"
          />
        ) : null}
        {coords.map((c, i) =>
          i % 2 === 0 || i === coords.length - 1 ? (
            <text
              key={c.label + i}
              x={c.x}
              y={height - 6}
              textAnchor="middle"
              fontSize="11"
              fill="#94a3b8"
            >
              {c.label}
            </text>
          ) : null,
        )}
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
        gap: 6,
        height: 190,
        paddingTop: 8,
      }}
    >
      {points.map((p, i) => {
        const h = p.amountRaw <= 0 ? 4 : Math.max(10, (p.amountRaw / max) * 150);
        return (
          <div
            key={`${p.shortLabel}-${i}`}
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
                maxWidth: 26,
                height: h,
                borderRadius: '8px 8px 4px 4px',
                background: 'linear-gradient(180deg, #93c5fd 0%, #2563eb 100%)',
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
  rank,
  barHeight = 10,
}: {
  name: string;
  amount: string;
  percent: number;
  color: string;
  subtitle?: string;
  rank?: number;
  barHeight?: number;
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
          alignItems: 'center',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {rank != null ? (
            <span
              style={{
                width: 20,
                height: 20,
                borderRadius: 999,
                display: 'inline-grid',
                placeItems: 'center',
                fontSize: 11,
                fontWeight: 700,
                background: 'color-mix(in srgb, #0f172a 8%, transparent)',
                color: '#0F172A',
                flexShrink: 0,
              }}
            >
              {rank}
            </span>
          ) : null}
          {name}
        </span>
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{amount}</span>
      </div>
      <div
        style={{
          height: barHeight,
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

function SnapshotStat({
  label,
  value,
  helper,
  icon,
  color,
}: {
  label: string;
  value: string;
  helper: string;
  icon: ReactNode;
  color: string;
}) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 14,
        padding: '14px 12px',
        boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          display: 'grid',
          placeItems: 'center',
          background: color,
          marginBottom: 10,
          color: '#0f172a',
        }}
      >
        {icon}
      </div>
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
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 750, letterSpacing: '-0.02em' }}>{value}</div>
      <div style={{ marginTop: 4, fontSize: 12, color: 'var(--fpm-text-muted)' }}>{helper}</div>
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

  const momBadge =
    m.thisMonthChange && m.thisMonthChange !== '0%'
      ? m.thisMonthChange.replace('+', '').replace('-', '↓ ')
      : null;

  const combinedProfitNegative =
    m.combinedGeneratedProfit.startsWith('−') || m.combinedGeneratedProfit.startsWith('-');

  return (
    <div style={{ display: 'grid', gap: 20, paddingBottom: 48 }}>
      <Card
        style={{
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid #E2E8F0',
          borderRadius: 16,
          background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 55%, #EEF2FF 100%)',
          padding: 24,
        }}
      >
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: -80,
            right: -60,
            width: 340,
            height: 340,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, color-mix(in srgb, #3b82f6 18%, transparent) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          aria-hidden
          style={{
            position: 'absolute',
            bottom: -70,
            left: -40,
            width: 240,
            height: 240,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, color-mix(in srgb, #6366f1 16%, transparent) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'relative',
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
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: '0.09em',
                textTransform: 'uppercase',
                color: '#94A3B8',
              }}
            >
              Trading business
            </div>
            <h1
              style={{
                margin: '6px 0 0',
                fontSize: 17,
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: '#0F172A',
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
            position: 'relative',
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
                fontSize: 'clamp(2.6rem, 5vw, 3.75rem)',
                fontWeight: 750,
                letterSpacing: '-0.04em',
                lineHeight: 1,
                marginBottom: 16,
                fontVariantNumeric: 'tabular-nums',
                color: '#0F172A',
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
            {m.largestWithdrawal === '—' ? (
              <div style={{ fontSize: 14, fontStyle: 'italic', color: 'var(--fpm-text-muted)' }}>
                No withdrawals recorded yet.
              </div>
            ) : (
              <>
                <div style={{ fontSize: 30, fontWeight: 750, letterSpacing: '-0.03em' }}>
                  {m.largestWithdrawal}
                </div>
                <div style={{ marginTop: 10, fontSize: 13, color: '#7c3aed', fontWeight: 600 }}>
                  {m.largestWithdrawalFirm ?? '—'}
                </div>
                <div style={{ marginTop: 4, fontSize: 12, color: 'var(--fpm-text-muted)' }}>
                  {m.largestWithdrawalDate ?? '—'}
                </div>
              </>
            )}
          </div>
        </div>
      </Card>

      {m.pendingWithdrawalCount > 0 ? (
        <Alert tone="warning">
          {m.pendingWithdrawalCount} pending withdrawal
          {m.pendingWithdrawalCount === 1 ? '' : 's'} totaling {m.pendingWithdrawalAmount}.{' '}
          <Link href="/withdrawals?status=PENDING">View pending</Link>
        </Alert>
      ) : null}

      <section>
        <SectionDivider title="Funded Business" subtitle="Prop firm accounts, payouts & income" />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 12,
            marginTop: 14,
          }}
        >
          <MetricCard
            label="This month"
            value={m.thisMonth}
            helper={m.thisMonthHelper}
            helperTone={m.thisMonthChange?.startsWith('-') ? 'danger' : 'muted'}
            tone="yellow"
            icon={
              <Icon d="M8 2v3M16 2v3M3 9h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
            }
            badge={
              momBadge ? <span className="fpm-metric-card__badge">{momBadge}</span> : undefined
            }
          />
          <MetricCard
            label="Last month"
            value={m.lastMonth}
            helper={m.lastMonthHelper}
            tone="orange"
            icon={<Icon d="M12 2v20M17 7H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />}
          />
          <MetricCard
            label={m.quarterLabel}
            value={m.quarterToDate}
            helper={m.quarterHelper}
            tone="green"
            icon={<Icon paths={['M4 20V10', 'M10 20V4', 'M16 20v-8', 'M22 20V12']} />}
            headerRight={<PeriodNav />}
          />
          <MetricCard
            label={m.yearLabel}
            value={m.yearToDate}
            helper={m.yearHelper}
            tone="teal"
            icon={<Icon paths={['M3 17 9 11l4 4 8-8', 'M14 7h7v7']} />}
            headerRight={<PeriodNav />}
          />
          <MetricCard
            label="Lifetime income"
            value={m.lifetime}
            helper={m.lifetimeHelper}
            tone="purple"
            icon={<Icon paths={['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M12 7v10M9 10h6']} />}
          />
          <MetricCard
            label="Avg / month"
            value={m.averageMonthly}
            helper="Running average"
            tone="pink"
            icon={<Icon paths={['M4 19h16', 'M7 16V9', 'M12 16V5', 'M17 16v-4']} />}
          />
        </div>
      </section>

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
            gap: 12,
          }}
        >
          <SnapshotStat
            label="Income yield"
            value={m.incomeYield}
            helper="Return on funded capital"
            color="#dbeafe"
            icon={<Icon paths={['M4 20V10', 'M10 20V4', 'M16 20v-8']} />}
          />
          <SnapshotStat
            label="Avg payout size"
            value={m.averagePayout}
            helper={`Across ${m.recognizedPayoutCount} payouts`}
            color="#dcfce7"
            icon={<Icon paths={['M4 19h16', 'M7 16V9', 'M12 16V5', 'M17 16v-4']} />}
          />
          <SnapshotStat
            label="Business tenure"
            value={m.businessTenure}
            helper={m.businessTenureHelper}
            color="#e0f2fe"
            icon={<Icon paths={['M12 7v5l3 2', 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z']} />}
          />
          <SnapshotStat
            label="Largest withdrawal"
            value={m.largestWithdrawal}
            helper={m.largestWithdrawalFirm ?? '—'}
            color="#fef3c7"
            icon={<Icon d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z" />}
          />
          <SnapshotStat
            label="Best month"
            value={m.bestMonth}
            helper={m.bestMonthHelper}
            color="#ede9fe"
            icon={<Icon paths={['M3 17 9 11l4 4 8-8', 'M14 7h7v7']} />}
          />
        </div>
      </Card>

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
            <div style={{ fontSize: 28, fontWeight: 750, color: '#0f766e' }}>{m.lifetime}</div>
          </div>
        </div>
        <AreaChart points={snapshot.cumulativeIncome} />
      </Card>

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
                barHeight={5}
                rank={idx + 1}
              />
            ))
          )}
        </Card>
      </div>

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
                    border: index === 0 ? '1px solid #BFDBFE' : '1px solid transparent',
                  }}
                >
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span
                      aria-hidden
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 999,
                        marginTop: 6,
                        background: row.status === 'PAID' ? '#16a34a' : '#94a3b8',
                        flexShrink: 0,
                      }}
                    />
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
                  </div>
                  <div
                    style={{
                      fontWeight: 750,
                      fontVariantNumeric: 'tabular-nums',
                      fontSize: index === 0 ? 15 : undefined,
                    }}
                  >
                    {formatDisplayMoney(row.amount, row.currency, { decimals: 0, compact: true })}
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
                    border: index === 0 ? '1px solid #BFDBFE' : '1px solid transparent',
                  }}
                >
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span
                      aria-hidden
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 999,
                        marginTop: 6,
                        background: '#2563eb',
                        flexShrink: 0,
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: 650 }}>{row.label}</div>
                      <div style={{ marginTop: 4, fontSize: 12, color: 'var(--fpm-text-muted)' }}>
                        {row.count} payout{row.count === 1 ? '' : 's'}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 750, fontSize: index === 0 ? 15 : undefined }}>
                    {row.amount}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {m.brokerAccountCount > 0 ? (
        <section>
          <SectionDivider title="Real Accounts" subtitle="Broker accounts, equity & P/L" />

          <Card
            style={{
              background: m.brokerNetPlNegative
                ? 'linear-gradient(135deg, #fff1f2 0%, #ffffff 70%)'
                : 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 70%)',
              marginTop: 14,
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
                    color: m.brokerNetPlNegative
                      ? 'var(--fpm-danger-dark, #be123c)'
                      : 'var(--fpm-success-dark)',
                    fontWeight: 600,
                  }}
                >
                  <span>
                    · {m.brokerAccountCount} Broker Account
                    {m.brokerAccountCount === 1 ? '' : 's'}
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
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 750,
                    color: m.brokerNetPlNegative
                      ? 'var(--fpm-danger-dark, #be123c)'
                      : 'var(--fpm-success-dark)',
                  }}
                >
                  {m.brokerNetPl}
                </div>
                <div style={{ fontSize: 13, color: 'var(--fpm-text-muted)', marginTop: 4 }}>
                  ROI: {m.brokerRoiHero}
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
            <MetricCard
              label="Current equity"
              value={m.currentRealEquity}
              tone="purple"
              accentValue
            />
            <MetricCard label="Net P/L" value={m.brokerNetPl} tone="green" accentValue />
            <MetricCard label="ROI" value={m.brokerRoi} tone="teal" accentValue />
            <MetricCard label="Total deposits" value={m.totalDeposits} tone="orange" accentValue />
            <MetricCard
              label="Total withdrawals"
              value={m.totalBrokerWithdrawals}
              tone="pink"
              accentValue
            />
            <MetricCard label="Peak equity" value={m.peakEquity} tone="purple" accentValue />
            <MetricCard
              label="Trading drawdown"
              value={m.tradingDrawdown}
              helper="excl. withdrawals"
              tone="teal"
              accentValue
            />
            <MetricCard
              label="Accounts"
              value={String(m.brokerAccountCount)}
              tone="orange"
              accentValue
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 14,
            }}
          >
            <Card style={{ background: 'color-mix(in srgb, #dcfce7 45%, #fff)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
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
                      color={row.amountRaw >= 0 ? '#16a34a' : '#dc2626'}
                      barHeight={3}
                    />
                  );
                })
              )}
            </Card>
            <Card style={{ background: 'color-mix(in srgb, #ede9fe 50%, #fff)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
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
                      color={row.amountRaw >= 0 ? '#16a34a' : '#dc2626'}
                      barHeight={3}
                    />
                  );
                })
              )}
            </Card>
          </div>
        </section>
      ) : null}

      <section>
        <SectionDivider
          title="Combined Business Overview"
          subtitle="Total across funded + real accounts"
        />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 14,
            marginTop: 14,
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
                color: combinedProfitNegative
                  ? 'var(--fpm-danger-dark, #be123c)'
                  : 'var(--fpm-success-dark)',
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                {
                  label: 'Funded accts',
                  value: m.activeAccountCount,
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
