import Link from 'next/link';
import { Card, EmptyState, PageHeader } from '@fpm/ui';
import {
  createScaleEventAction,
  listAccountOptionsForScaleAction,
} from '@/server/actions/scale-events';
import { ScaleEventForm } from '@/components/scale-events/scale-event-form';

export default async function NewScaleEventPage() {
  const accountsResult = await listAccountOptionsForScaleAction();
  const accounts = accountsResult.ok ? accountsResult.options : [];

  async function action(formData: FormData) {
    'use server';
    const scaled = String(formData.get('scaledAt') || '');
    if (scaled && !scaled.includes('T')) {
      formData.set('scaledAt', `${scaled}T12:00:00.000Z`);
    }
    await createScaleEventAction(formData);
  }

  if (accounts.length === 0) {
    return (
      <>
        <PageHeader title="Add scale event" description="Size upgrade for a funded account." />
        <EmptyState
          title="Add a funded account first"
          description="Scale events must belong to a funded account."
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
        title="Add scale event"
        description="toSize must exceed fromSize. Account current size updates in the same transaction."
        breadcrumbs={[{ label: 'Scale Events', href: '/scale-events' }, { label: 'New' }]}
      />
      <Card>
        <ScaleEventForm
          action={action}
          accounts={accounts}
          submitLabel="Add Scale Event"
          cancelHref="/scale-events"
        />
      </Card>
    </>
  );
}
