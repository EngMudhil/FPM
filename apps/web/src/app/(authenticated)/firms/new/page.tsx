import { Card, PageHeader } from '@fpm/ui';
import { createFirmAction } from '@/server/actions/firms';
import { FirmForm } from '@/components/firms/firm-form';

export default function NewFirmPage() {
  async function action(formData: FormData) {
    'use server';
    await createFirmAction(formData);
  }

  return (
    <>
      <PageHeader
        title="Add firm"
        description="Create a prop trading firm."
        breadcrumbs={[{ label: 'Firms', href: '/firms' }, { label: 'New' }]}
      />
      <Card>
        <FirmForm action={action} submitLabel="Create firm" cancelHref="/firms" />
      </Card>
    </>
  );
}
