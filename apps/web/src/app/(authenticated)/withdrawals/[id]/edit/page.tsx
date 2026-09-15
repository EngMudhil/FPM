import { notFound } from 'next/navigation';
import { Card, PageHeader } from '@fpm/ui';
import {
  getWithdrawalAction,
  listAccountOptionsForWithdrawalAction,
  updateWithdrawalAction,
} from '@/server/actions/withdrawals';
import { WithdrawalForm } from '@/components/withdrawals/withdrawal-form';

export default async function EditWithdrawalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [result, accountsResult] = await Promise.all([
    getWithdrawalAction(id),
    listAccountOptionsForWithdrawalAction(),
  ]);
  if (!result.ok) {
    if (result.error.code === 'NOT_FOUND') notFound();
    return <p role="alert">{result.error.message}</p>;
  }

  const { withdrawal } = result;
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
    } else {
      formData.delete('receivedAt');
    }
    await updateWithdrawalAction(withdrawal.id, formData);
  }

  return (
    <>
      <PageHeader
        title="Edit withdrawal"
        description="PAID records are restricted; reverse instead of delete."
        breadcrumbs={[
          { label: 'Withdrawals', href: '/withdrawals' },
          {
            label: `${withdrawal.amount} ${withdrawal.currency}`,
            href: `/withdrawals/${withdrawal.id}`,
          },
          { label: 'Edit' },
        ]}
      />
      <Card>
        <WithdrawalForm
          action={action}
          accounts={accounts}
          defaults={withdrawal}
          submitLabel="Save changes"
          cancelHref={`/withdrawals/${withdrawal.id}`}
          lockAccount
          lockAmount={withdrawal.status !== 'PENDING'}
        />
      </Card>
    </>
  );
}
