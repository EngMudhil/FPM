import { Button, FormField, Input, Select, Textarea } from '@fpm/ui';
import Link from 'next/link';

type AccountOption = { id: string; label: string; currency: string };

function toDateInputValue(value?: Date | string | null) {
  if (!value) return '';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

export function WithdrawalForm({
  action,
  accounts,
  defaults,
  submitLabel,
  cancelHref,
  lockAccount,
  lockAmount,
}: {
  action: (formData: FormData) => void | Promise<void>;
  accounts: AccountOption[];
  defaults?: {
    tradingAccountId?: string;
    amount?: string;
    status?: string;
    requestedAt?: Date | string | null;
    receivedAt?: Date | string | null;
    notes?: string | null;
  };
  submitLabel: string;
  cancelHref: string;
  lockAccount?: boolean;
  lockAmount?: boolean;
}) {
  return (
    <form action={action} style={{ display: 'grid', gap: 16, maxWidth: 560 }}>
      <FormField id="tradingAccountId" label="Funded account" required>
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
      <FormField id="amount" label="Amount" required hint="Exact decimal; currency follows account">
        <Input
          id="amount"
          name="amount"
          required
          readOnly={lockAmount}
          defaultValue={defaults?.amount ?? ''}
          placeholder="1000.00"
        />
      </FormField>
      <FormField id="status" label="Status" required>
        <Select id="status" name="status" defaultValue={defaults?.status ?? 'PENDING'}>
          <option value="PENDING">Pending</option>
          <option value="PAID">Paid</option>
          <option value="FAILED">Failed</option>
          <option value="REVERSED">Reversed</option>
        </Select>
      </FormField>
      <FormField id="requestedAt" label="Requested date" required>
        <Input
          id="requestedAt"
          name="requestedAt"
          type="date"
          required
          defaultValue={
            toDateInputValue(defaults?.requestedAt) || new Date().toISOString().slice(0, 10)
          }
        />
      </FormField>
      <FormField
        id="receivedAt"
        label="Received / paid date"
        hint="Required when status is Paid (maps to receivedAt)"
      >
        <Input
          id="receivedAt"
          name="receivedAt"
          type="date"
          defaultValue={toDateInputValue(defaults?.receivedAt)}
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
