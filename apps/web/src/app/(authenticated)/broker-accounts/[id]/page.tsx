import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Alert,
  Button,
  Card,
  FormField,
  Input,
  MetricCard,
  PageHeader,
  Table,
  TBody,
  TD,
  Textarea,
  TH,
  THead,
  TR,
} from '@fpm/ui';
import {
  addBrokerCashWithdrawalAction,
  addBrokerDepositAction,
  addEquitySnapshotAction,
  deleteBrokerAccountAction,
  getBrokerAccountAction,
} from '@/server/actions/brokers';

function formatDate(value: Date) {
  return value.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default async function BrokerAccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getBrokerAccountAction(id);
  if (!result.ok) {
    if (result.error.code === 'NOT_FOUND') notFound();
    return <p role="alert">{result.error.message}</p>;
  }

  const { account, deposits, withdrawals, snapshots, metrics } = result;

  async function depositAction(formData: FormData) {
    'use server';
    await addBrokerDepositAction(account.id, formData);
  }
  async function withdrawalAction(formData: FormData) {
    'use server';
    await addBrokerCashWithdrawalAction(account.id, formData);
  }
  async function snapshotAction(formData: FormData) {
    'use server';
    await addEquitySnapshotAction(account.id, formData);
  }
  async function deleteAction() {
    'use server';
    await deleteBrokerAccountAction(account.id);
  }

  return (
    <>
      <PageHeader
        title={account.accountName}
        description={`${account.brokerName}${account.accountNumber ? ` · #${account.accountNumber}` : ''}`}
        breadcrumbs={[
          { label: 'Broker Accounts', href: '/broker-accounts' },
          { label: account.accountName },
        ]}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <Link
              href={`/broker-accounts/${account.id}/edit`}
              className="fpm-btn fpm-btn--secondary"
            >
              Edit
            </Link>
            <form action={deleteAction}>
              <Button type="submit" variant="danger" size="sm">
                Delete
              </Button>
            </form>
          </div>
        }
      />

      <Alert tone="info" title="Confirmed broker metrics">
        Net deposited and latest equity are authoritative. Profit/loss and ROI remain deferred
        (OQ-003). Duplicate equity dates are rejected (ADR-012 / OQ-015).
      </Alert>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16,
          marginTop: 20,
        }}
      >
        <MetricCard
          label="Starting capital"
          value={`${account.startingCapital} ${account.currency}`}
        />
        <MetricCard
          label="Net deposited"
          value={metrics.netDeposited}
          helper="Deposits − withdrawals"
        />
        <MetricCard label="Latest equity" value={metrics.latestEquity} />
        <MetricCard label="P/L" value="—" helper={metrics.profitLoss} />
        <MetricCard label="ROI" value="—" helper={metrics.roi} />
      </div>

      <section style={{ marginTop: 28 }}>
        <PageHeader title="Deposits" description="Cash deposited into this account." />
        <Card style={{ marginBottom: 16 }}>
          <form action={depositAction} style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <FormField id="deposit-amount" label="Amount" required>
              <Input id="deposit-amount" name="amount" required placeholder="1000" />
            </FormField>
            <FormField id="deposit-date" label="Date" required>
              <Input
                id="deposit-date"
                name="date"
                type="date"
                required
                defaultValue={new Date().toISOString().slice(0, 10)}
              />
            </FormField>
            <FormField id="deposit-notes" label="Notes">
              <Input id="deposit-notes" name="notes" />
            </FormField>
            <div style={{ alignSelf: 'end' }}>
              <Button type="submit" variant="secondary" size="sm">
                Add deposit
              </Button>
            </div>
          </form>
        </Card>
        <Table>
          <THead>
            <TR>
              <TH>Amount</TH>
              <TH>Date</TH>
              <TH>Notes</TH>
            </TR>
          </THead>
          <TBody>
            {deposits.map((row) => (
              <TR key={row.id}>
                <TD style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {row.amount} {row.currency}
                </TD>
                <TD>{formatDate(row.depositDate)}</TD>
                <TD>{row.notes ?? '—'}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </section>

      <section style={{ marginTop: 28 }}>
        <PageHeader title="Withdrawals" description="Cash withdrawn from this account." />
        <Card style={{ marginBottom: 16 }}>
          <form action={withdrawalAction} style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <FormField id="wd-amount" label="Amount" required>
              <Input id="wd-amount" name="amount" required />
            </FormField>
            <FormField id="wd-date" label="Date" required>
              <Input
                id="wd-date"
                name="date"
                type="date"
                required
                defaultValue={new Date().toISOString().slice(0, 10)}
              />
            </FormField>
            <FormField id="wd-notes" label="Notes">
              <Input id="wd-notes" name="notes" />
            </FormField>
            <div style={{ alignSelf: 'end' }}>
              <Button type="submit" variant="secondary" size="sm">
                Add withdrawal
              </Button>
            </div>
          </form>
        </Card>
        <Table>
          <THead>
            <TR>
              <TH>Amount</TH>
              <TH>Date</TH>
              <TH>Notes</TH>
            </TR>
          </THead>
          <TBody>
            {withdrawals.map((row) => (
              <TR key={row.id}>
                <TD style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {row.amount} {row.currency}
                </TD>
                <TD>{formatDate(row.withdrawalDate)}</TD>
                <TD>{row.notes ?? '—'}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </section>

      <section style={{ marginTop: 28 }}>
        <PageHeader
          title="Equity snapshots"
          description="Point-in-time equity. Duplicate dates are rejected."
        />
        <Card style={{ marginBottom: 16 }}>
          <form action={snapshotAction} style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <FormField id="eq-equity" label="Equity" required>
              <Input id="eq-equity" name="equity" required />
            </FormField>
            <FormField id="eq-date" label="Date" required>
              <Input
                id="eq-date"
                name="date"
                type="date"
                required
                defaultValue={new Date().toISOString().slice(0, 10)}
              />
            </FormField>
            <FormField id="eq-notes" label="Notes">
              <Textarea id="eq-notes" name="notes" rows={2} />
            </FormField>
            <div style={{ alignSelf: 'end' }}>
              <Button type="submit" variant="secondary" size="sm">
                Add snapshot
              </Button>
            </div>
          </form>
        </Card>
        <Table>
          <THead>
            <TR>
              <TH>Equity</TH>
              <TH>Date</TH>
              <TH>Notes</TH>
            </TR>
          </THead>
          <TBody>
            {snapshots.map((row) => (
              <TR key={row.id}>
                <TD style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {row.equity} {row.currency}
                </TD>
                <TD>{formatDate(row.snapshotDate)}</TD>
                <TD>{row.notes ?? '—'}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </section>
    </>
  );
}
