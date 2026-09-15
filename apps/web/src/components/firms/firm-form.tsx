import { Button, FormField, Input, Textarea } from '@fpm/ui';
import Link from 'next/link';

type FirmFormValues = {
  name?: string;
  website?: string | null;
  notes?: string | null;
};

export function FirmForm({
  action,
  defaults,
  submitLabel,
  cancelHref,
}: {
  action: (formData: FormData) => void | Promise<void>;
  defaults?: FirmFormValues;
  submitLabel: string;
  cancelHref: string;
}) {
  return (
    <form action={action} style={{ display: 'grid', gap: 16, maxWidth: 520 }}>
      <FormField id="name" label="Firm name" required>
        <Input
          id="name"
          name="name"
          required
          defaultValue={defaults?.name ?? ''}
          placeholder="e.g. FTMO"
        />
      </FormField>
      <FormField id="website" label="Website" hint="Optional">
        <Input
          id="website"
          name="website"
          type="text"
          defaultValue={defaults?.website ?? ''}
          placeholder="https://"
        />
      </FormField>
      <FormField id="notes" label="Notes" hint="Optional">
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
