import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  FormField,
  Input,
  MetricCard,
  PageHeader,
  SearchInput,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@fpm/ui';
import { getSessionAction } from '@/server/actions/auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await getSessionAction();
  if (!session.ok) redirect('/login');

  return (
    <>
      <PageHeader
        eyebrow="Trading business"
        title={`Welcome back`}
        description={`${session.workspace.name} · Design system baseline (FPM-004). Domain metrics arrive in later tasks.`}
        actions={<Button disabled>+ Record Withdrawal</Button>}
      />

      <Alert tone="info" title="Foundation shell">
        Sidebar IA follows Spec §5 / ADR-008. Financial totals are intentionally omitted until the
        Financial Domain ships.
      </Alert>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16,
          marginTop: 24,
        }}
      >
        <MetricCard label="This month" value="—" helper="Pending domain" tone="yellow" />
        <MetricCard label="Last month" value="—" helper="Pending domain" tone="orange" />
        <MetricCard label="Lifetime" value="—" helper="Pending domain" tone="purple" />
        <MetricCard label="Avg / month" value="—" helper="Pending domain" tone="pink" />
      </div>

      <section style={{ marginTop: 32 }}>
        <PageHeader
          title="Component baseline"
          description="Reusable primitives from @fpm/ui for upcoming modules."
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          <Badge tone="success">Paid</Badge>
          <Badge tone="warning">Pending</Badge>
          <Badge tone="danger">Failed</Badge>
          <Badge tone="info">Active</Badge>
          <Badge>Closed</Badge>
        </div>
        <Card>
          <div style={{ display: 'grid', gap: 12, maxWidth: 420 }}>
            <FormField id="demo-search" label="Search">
              <SearchInput id="demo-search" placeholder="Search firms…" disabled />
            </FormField>
            <FormField id="demo-name" label="Firm name" required hint="Example field">
              <Input id="demo-name" placeholder="e.g. FTMO" disabled />
            </FormField>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="primary" disabled>
                Primary
              </Button>
              <Button variant="secondary" disabled>
                Secondary
              </Button>
            </div>
          </div>
        </Card>
        <div style={{ marginTop: 16 }}>
          <Table>
            <THead>
              <TR>
                <TH>Module</TH>
                <TH>Status</TH>
              </TR>
            </THead>
            <TBody>
              <TR>
                <TD>Firms</TD>
                <TD>
                  <Badge tone="warning">FPM-005</Badge>
                </TD>
              </TR>
              <TR>
                <TD>Withdrawals</TD>
                <TD>
                  <Badge tone="warning">FPM-007/008</Badge>
                </TD>
              </TR>
            </TBody>
          </Table>
        </div>
        <div style={{ marginTop: 16 }}>
          <EmptyState
            title="No module data yet"
            description="Business screens will use this empty-state pattern."
          />
        </div>
      </section>
    </>
  );
}
