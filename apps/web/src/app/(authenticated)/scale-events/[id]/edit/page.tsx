import { notFound } from 'next/navigation';
import { Card, PageHeader } from '@fpm/ui';
import {
  getScaleEventAction,
  listAccountOptionsForScaleAction,
  updateScaleEventAction,
} from '@/server/actions/scale-events';
import { ScaleEventForm } from '@/components/scale-events/scale-event-form';

export default async function EditScaleEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [result, accountsResult] = await Promise.all([
    getScaleEventAction(id),
    listAccountOptionsForScaleAction(),
  ]);
  if (!result.ok) {
    if (result.error.code === 'NOT_FOUND') notFound();
    return <p role="alert">{result.error.message}</p>;
  }

  const { scaleEvent } = result;
  const accounts = accountsResult.ok ? accountsResult.options : [];

  async function action(formData: FormData) {
    'use server';
    const scaled = String(formData.get('scaledAt') || '');
    if (scaled && !scaled.includes('T')) {
      formData.set('scaledAt', `${scaled}T12:00:00.000Z`);
    }
    await updateScaleEventAction(scaleEvent.id, formData);
  }

  return (
    <>
      <PageHeader
        title="Edit scale event"
        description="Saving resyncs account current size from the latest scale event."
        breadcrumbs={[
          { label: 'Scale Events', href: '/scale-events' },
          {
            label: `${scaleEvent.toSize} ${scaleEvent.currency}`,
            href: `/scale-events/${scaleEvent.id}`,
          },
          { label: 'Edit' },
        ]}
      />
      <Card>
        <ScaleEventForm
          action={action}
          accounts={accounts}
          defaults={scaleEvent}
          submitLabel="Save changes"
          cancelHref={`/scale-events/${scaleEvent.id}`}
          lockAccount
        />
      </Card>
    </>
  );
}
