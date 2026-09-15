import { Button, FormField, Input, Select, Textarea } from '@fpm/ui';
import Link from 'next/link';

type AccountOption = {
  id: string;
  label: string;
  currency: string;
  currentSize?: string;
  initialSize?: string;
};

function toDateInputValue(value?: Date | string | null) {
  if (!value) return '';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

export function ScaleEventForm({
  action,
  accounts,
  defaults,
  submitLabel,
  cancelHref,
  lockAccount,
}: {
  action: (formData: FormData) => void | Promise<void>;
  accounts: AccountOption[];
  defaults?: {
    tradingAccountId?: string;
    fromSize?: string;
    toSize?: string;
    scaledAt?: Date | string | null;
    notes?: string | null;
  };
  submitLabel: string;
  cancelHref: string;
  lockAccount?: boolean;
}) {
  const selected = accounts.find((a) => a.id === defaults?.tradingAccountId);
  const suggestedFrom = defaults?.fromSize ?? selected?.currentSize ?? selected?.initialSize ?? '';

  return (
    <form action={action} style={{ display: 'grid', gap: 16, maxWidth: 560 }}>
      <FormField id="tradingAccountId" label="Account" required>
        <Select
          id="tradingAccountId"
          name="tradingAccountId"
          required
          disabled={lockAccount}
          defaultValue={defaults?.tradingAccountId ?? ''}
        >
          <option value="" disabled>
            Select account
          </option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.label}
            </option>
          ))}
        </Select>
        {lockAccount && defaults?.tradingAccountId ? (
          <input type="hidden" name="tradingAccountId" value={defaults.tradingAccountId} />
        ) : null}
      </FormField>
      <FormField id="fromSize" label="From size" required hint="Must be less than to size">
        <Input
          id="fromSize"
          name="fromSize"
          required
          defaultValue={suggestedFrom}
          placeholder="100000"
        />
      </FormField>
      <FormField id="toSize" label="To size" required hint="Must exceed from size (Spec §8)">
        <Input
          id="toSize"
          name="toSize"
          required
          defaultValue={defaults?.toSize ?? ''}
          placeholder="150000"
        />
      </FormField>
      <FormField id="scaledAt" label="Scale date" required>
        <Input
          id="scaledAt"
          name="scaledAt"
          type="date"
          required
          defaultValue={
            toDateInputValue(defaults?.scaledAt) || new Date().toISOString().slice(0, 10)
          }
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
