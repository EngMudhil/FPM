import { Card, EmptyState, FormField, Input, PageHeader, Select, Textarea, Button } from '@fpm/ui';
import {
  createBrokerAccountAction,
  createBrokerAction,
  listBrokersAction,
} from '@/server/actions/brokers';

export default async function NewBrokerAccountPage() {
  const brokersResult = await listBrokersAction();
  const brokers = brokersResult.ok ? brokersResult.items : [];

  async function createBrokerForm(formData: FormData) {
    'use server';
    await createBrokerAction(formData);
  }

  async function createAccountForm(formData: FormData) {
    'use server';
    await createBrokerAccountAction(formData);
  }

  return (
    <>
      <PageHeader
        title="Add broker account"
        description="Create a live broker account. Add a broker first if needed."
        breadcrumbs={[{ label: 'Broker Accounts', href: '/broker-accounts' }, { label: 'New' }]}
      />

      <Card style={{ marginBottom: 20 }}>
        <h2 style={{ margin: '0 0 12px', fontSize: 16 }}>Add broker</h2>
        <form action={createBrokerForm} style={{ display: 'grid', gap: 12, maxWidth: 480 }}>
          <FormField id="name" label="Broker name" required>
            <Input id="name" name="name" required placeholder="e.g. Interactive Brokers" />
          </FormField>
          <FormField id="website" label="Website">
            <Input id="website" name="website" placeholder="https://" />
          </FormField>
          <Button type="submit" variant="secondary" size="sm">
            Save broker
          </Button>
        </form>
      </Card>

      {brokers.length === 0 ? (
        <EmptyState
          title="Add a broker first"
          description="Broker accounts require a broker brand record."
        />
      ) : (
        <Card>
          <form action={createAccountForm} style={{ display: 'grid', gap: 16, maxWidth: 560 }}>
            <FormField id="brokerId" label="Broker" required>
              <Select id="brokerId" name="brokerId" required defaultValue="">
                <option value="" disabled>
                  Select broker
                </option>
                {brokers.map((broker) => (
                  <option key={broker.id} value={broker.id}>
                    {broker.name}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField id="accountName" label="Account name" required>
              <Input id="accountName" name="accountName" required />
            </FormField>
            <FormField id="accountNumber" label="Account number">
              <Input id="accountNumber" name="accountNumber" />
            </FormField>
            <FormField id="startingCapital" label="Starting capital" required>
              <Input id="startingCapital" name="startingCapital" required placeholder="10000" />
            </FormField>
            <FormField id="currency" label="Currency" required>
              <Input id="currency" name="currency" required defaultValue="USD" maxLength={3} />
            </FormField>
            <FormField id="startDate" label="Start date">
              <Input id="startDate" name="startDate" type="date" />
            </FormField>
            <FormField id="notes" label="Notes">
              <Textarea id="notes" name="notes" rows={3} />
            </FormField>
            <Button type="submit" variant="primary">
              Create account
            </Button>
          </form>
        </Card>
      )}
    </>
  );
}
