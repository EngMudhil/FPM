import Link from 'next/link';
import { EmptyState, PageHeader, Table, TBody, TD, TH, THead, TR } from '@fpm/ui';
import { listBrokerAccountsAction } from '@/server/actions/brokers';

export default async function BrokerAccountsPage() {
  const result = await listBrokerAccountsAction();
  if (!result.ok) {
    return (
      <>
        <PageHeader title="Broker Accounts" description="Real capital accounts." />
        <EmptyState title="Unable to load broker accounts" description={result.error.message} />
      </>
    );
  }

  const { items } = result;

  return (
    <>
      <PageHeader
        title="Broker Accounts"
        description="Real broker capital, deposits, withdrawals, and equity snapshots."
        actions={
          <Link href="/broker-accounts/new" className="fpm-btn fpm-btn--primary">
            + Add Broker Account
          </Link>
        }
      />
      {items.length === 0 ? (
        <EmptyState
          title="No broker accounts yet"
          description="Add a broker and live account to track real capital."
        />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Account</TH>
              <TH>Broker</TH>
              <TH>Starting</TH>
              <TH>Currency</TH>
              <TH>Actions</TH>
            </TR>
          </THead>
          <TBody>
            {items.map((row) => (
              <TR key={row.id}>
                <TD style={{ fontWeight: 600 }}>{row.accountName}</TD>
                <TD>{row.brokerName}</TD>
                <TD style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {row.startingCapital} {row.currency}
                </TD>
                <TD>{row.currency}</TD>
                <TD>
                  <Link href={`/broker-accounts/${row.id}`}>View</Link>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </>
  );
}
