import { notFound } from 'next/navigation';
import { Card, PageHeader } from '@fpm/ui';
import {
  getAccountAction,
  listFirmOptionsAction,
  updateAccountAction,
} from '@/server/actions/accounts';
import { accountDisplayName } from '@/server/services/accounts';
import { AccountForm } from '@/components/accounts/account-form';

export default async function EditAccountPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [result, firmsResult] = await Promise.all([getAccountAction(id), listFirmOptionsAction()]);
  if (!result.ok) {
    if (result.error.code === 'NOT_FOUND') notFound();
    return <p role="alert">{result.error.message}</p>;
  }

  const { account } = result;
  const firms = firmsResult.ok ? firmsResult.options : [];
  const title = accountDisplayName(account);

  async function action(formData: FormData) {
    'use server';
    await updateAccountAction(account.id, formData);
  }

  return (
    <>
      <PageHeader
        title={`Edit ${title}`}
        description="Update funded account details."
        breadcrumbs={[
          { label: 'Funded Accounts', href: '/accounts' },
          { label: title, href: `/accounts/${account.id}` },
          { label: 'Edit' },
        ]}
      />
      <Card>
        <AccountForm
          action={action}
          firms={firms}
          defaults={account}
          submitLabel="Save changes"
          cancelHref={`/accounts/${account.id}`}
        />
      </Card>
    </>
  );
}
