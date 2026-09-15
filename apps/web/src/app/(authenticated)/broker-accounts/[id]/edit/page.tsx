import { notFound } from 'next/navigation';
import { Button, Card, FormField, Input, PageHeader, Select, Textarea } from '@fpm/ui';
import {
  getBrokerAccountMetaAction,
  listBrokersAction,
  updateBrokerAccountAction,
} from '@/server/actions/brokers';

export default async function EditBrokerAccountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [meta, brokersResult] = await Promise.all([
    getBrokerAccountMetaAction(id),
    listBrokersAction(),
  ]);
  if (!meta.ok) {
    if (meta.error.code === 'NOT_FOUND') notFound();
    return <p role="alert">{meta.error.message}</p>;
  }
  const { account } = meta;
  const brokers = brokersResult.ok ? brokersResult.items : [];

  async function action(formData: FormData) {
    'use server';
    await updateBrokerAccountAction(account.id, formData);
  }

  return (
    <>
      <PageHeader
        title="Edit broker account"
        breadcrumbs={[
          { label: 'Broker Accounts', href: '/broker-accounts' },
          { label: account.accountName, href: `/broker-accounts/${account.id}` },
          { label: 'Edit' },
        ]}
      />
      <Card>
        <form action={action} style={{ display: 'grid', gap: 16, maxWidth: 560 }}>
          <FormField id="brokerId" label="Broker" required>
            <Select id="brokerId" name="brokerId" required defaultValue={account.brokerId}>
              {brokers.map((broker) => (
                <option key={broker.id} value={broker.id}>
                  {broker.name}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField id="accountName" label="Account name" required>
            <Input
              id="accountName"
              name="accountName"
              required
              defaultValue={account.accountName}
            />
          </FormField>
          <FormField id="accountNumber" label="Account number">
            <Input
              id="accountNumber"
              name="accountNumber"
              defaultValue={account.accountNumber ?? ''}
            />
          </FormField>
          <FormField id="startingCapital" label="Starting capital" required>
            <Input
              id="startingCapital"
              name="startingCapital"
              required
              defaultValue={account.startingCapital}
            />
          </FormField>
          <FormField id="currency" label="Currency" required>
            <Input
              id="currency"
              name="currency"
              required
              defaultValue={account.currency}
              maxLength={3}
            />
          </FormField>
          <FormField id="startDate" label="Start date">
            <Input
              id="startDate"
              name="startDate"
              type="date"
              defaultValue={account.startDate ?? ''}
            />
          </FormField>
          <FormField id="notes" label="Notes">
            <Textarea id="notes" name="notes" rows={3} defaultValue={account.notes ?? ''} />
          </FormField>
          <Button type="submit" variant="primary">
            Save changes
          </Button>
        </form>
      </Card>
    </>
  );
}
