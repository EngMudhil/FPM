import { Button, FormField, Input, Select, Textarea } from '@fpm/ui';
import Link from 'next/link';

type FirmOption = { id: string; name: string };

type Defaults = {
  firmId?: string;
  accountNumber?: string | null;
  label?: string | null;
  phase?: string;
  initialSize?: string;
  currentSize?: string;
  currency?: string;
  platform?: string | null;
  startDate?: string | null;
  notes?: string | null;
};

export function AccountForm({
  action,
  firms,
  defaults,
  submitLabel,
  cancelHref,
}: {
  action: (formData: FormData) => void | Promise<void>;
  firms: FirmOption[];
  defaults?: Defaults;
  submitLabel: string;
  cancelHref: string;
}) {
  return (
    <form action={action} style={{ display: 'grid', gap: 16, maxWidth: 560 }}>
      <FormField id="firmId" label="Firm" required>
        <Select id="firmId" name="firmId" required defaultValue={defaults?.firmId ?? ''}>
          <option value="" disabled>
            Select firm
          </option>
          {firms.map((firm) => (
            <option key={firm.id} value={firm.id}>
              {firm.name}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField id="label" label="Display label" hint="Optional friendly name">
        <Input
          id="label"
          name="label"
          defaultValue={defaults?.label ?? ''}
          placeholder="FTMO 100K #1"
        />
      </FormField>
      <FormField id="accountNumber" label="Account number" hint="Broker/prop account id">
        <Input
          id="accountNumber"
          name="accountNumber"
          defaultValue={defaults?.accountNumber ?? ''}
          placeholder="e.g. 12345678"
        />
      </FormField>
      <FormField id="phase" label="Phase" required>
        <Select id="phase" name="phase" defaultValue={defaults?.phase ?? 'ACTIVE'}>
          <option value="ACTIVE">Active</option>
          <option value="PAUSED">Paused</option>
          <option value="CLOSED">Closed</option>
        </Select>
      </FormField>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <FormField id="initialSize" label="Initial size" required>
          <Input
            id="initialSize"
            name="initialSize"
            required
            defaultValue={defaults?.initialSize ?? ''}
            placeholder="100000"
          />
        </FormField>
        <FormField id="currentSize" label="Current size" hint="Defaults to initial">
          <Input
            id="currentSize"
            name="currentSize"
            defaultValue={defaults?.currentSize ?? defaults?.initialSize ?? ''}
            placeholder="100000"
          />
        </FormField>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <FormField id="currency" label="Currency" required>
          <Input
            id="currency"
            name="currency"
            required
            defaultValue={defaults?.currency ?? 'USD'}
            placeholder="USD"
          />
        </FormField>
        <FormField id="platform" label="Platform">
          <Input
            id="platform"
            name="platform"
            defaultValue={defaults?.platform ?? ''}
            placeholder="MT5"
          />
        </FormField>
      </div>
      <FormField id="startDate" label="Start date" hint="YYYY-MM-DD">
        <Input
          id="startDate"
          name="startDate"
          defaultValue={defaults?.startDate ?? ''}
          placeholder="2026-01-15"
        />
      </FormField>
      <FormField id="notes" label="Notes">
        <Textarea id="notes" name="notes" defaultValue={defaults?.notes ?? ''} rows={4} />
      </FormField>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button type="submit" variant="primary">
          {submitLabel}
        </Button>
        <Link href={cancelHref} className="fpm-btn fpm-btn--secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}
