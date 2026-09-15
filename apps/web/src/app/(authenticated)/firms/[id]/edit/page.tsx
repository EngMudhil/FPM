import { notFound } from 'next/navigation';
import { Card, PageHeader } from '@fpm/ui';
import { getFirmAction, updateFirmAction } from '@/server/actions/firms';
import { FirmForm } from '@/components/firms/firm-form';

export default async function EditFirmPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getFirmAction(id);
  if (!result.ok) {
    if (result.error.code === 'NOT_FOUND') notFound();
    return <p role="alert">{result.error.message}</p>;
  }

  const { firm } = result;

  async function action(formData: FormData) {
    'use server';
    await updateFirmAction(firm.id, formData);
  }

  return (
    <>
      <PageHeader
        title={`Edit ${firm.name}`}
        description="Update firm details."
        breadcrumbs={[
          { label: 'Firms', href: '/firms' },
          { label: firm.name, href: `/firms/${firm.id}` },
          { label: 'Edit' },
        ]}
      />
      <Card>
        <FirmForm
          action={action}
          defaults={firm}
          submitLabel="Save changes"
          cancelHref={`/firms/${firm.id}`}
        />
      </Card>
    </>
  );
}
