import { Card, EmptyState, PageHeader } from '@fpm/ui';
import { createAccountAction, listFirmOptionsAction } from '@/server/actions/accounts';
import { AccountForm } from '@/components/accounts/account-form';
import Link from 'next/link';

export default async function NewAccountPage() {
  const firmsResult = await listFirmOptionsAction();
  const firms = firmsResult.ok ? firmsResult.options : [];

  async function action(formData: FormData) {
    'use server';
    await createAccountAction(formData);
  }

  if (firms.length === 0) {
    return (
      <>
        <PageHeader title="Add account" description="Create a funded account." />
        <EmptyState
          title="Add a firm first"
          description="Funded accounts must belong to a prop firm."
        />
        <div style={{ marginTop: 16 }}>
          <Link href="/firms/new" className="fpm-btn fpm-btn--primary">
            + Add Firm
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Add account"
        description="Create a funded or challenge account."
        breadcrumbs={[{ label: 'Funded Accounts', href: '/accounts' }, { label: 'New' }]}
      />
      <Card>
        <AccountForm
          action={action}
          firms={firms}
          submitLabel="Create account"
          cancelHref="/accounts"
        />
      </Card>
    </>
  );
}
