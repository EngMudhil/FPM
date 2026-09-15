import Link from 'next/link';
import { Card, EmptyState, PageHeader } from '@fpm/ui';
import {
  createWithdrawalAction,
  listAccountOptionsForWithdrawalAction,
} from '@/server/actions/withdrawals';
import { WithdrawalForm } from '@/components/withdrawals/withdrawal-form';

export default async function NewWithdrawalPage() {
  const accountsResult = await listAccountOptionsForWithdrawalAction();
  const accounts = accountsResult.ok ? accountsResult.options : [];

  async function action(formData: FormData) {
    'use server';
    const requested = String(formData.get('requestedAt') || '');
    const received = String(formData.get('receivedAt') || '');
    if (requested && !requested.includes('T')) {
      formData.set('requestedAt', `${requested}T12:00:00.000Z`);
    }
    if (received) {
      formData.set('receivedAt', received.includes('T') ? received : `${received}T12:00:00.000Z`);
    }
    await createWithdrawalAction(formData);
  }

  if (accounts.length === 0) {
    return (
      <>
        <PageHeader title="Record withdrawal" description="Manual payout entry." />
        <EmptyState
          title="Add a funded account first"
          description="Withdrawals must belong to a funded account."
        />
        <div style={{ marginTop: 16 }}>
          <Link href="/accounts/new" className="fpm-btn fpm-btn--primary">
            + Add Account
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Record withdrawal"
        description="Manual payout entry. Paid date maps to receivedAt."
        breadcrumbs={[{ label: 'Withdrawals', href: '/withdrawals' }, { label: 'New' }]}
      />
      <Card>
        <WithdrawalForm
          action={action}
          accounts={accounts}
          submitLabel="Save withdrawal"
          cancelHref="/withdrawals"
        />
      </Card>
    </>
  );
}
