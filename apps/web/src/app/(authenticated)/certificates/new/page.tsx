import Link from 'next/link';
import { Button, Card, EmptyState, FormField, Input, PageHeader, Select, Textarea } from '@fpm/ui';
import {
  createCertificateAction,
  listWithdrawalOptionsForCertificateAction,
} from '@/server/actions/certificates';

export default async function NewCertificatePage() {
  const optionsResult = await listWithdrawalOptionsForCertificateAction();
  const options = optionsResult.ok ? optionsResult.options : [];

  async function action(formData: FormData) {
    'use server';
    await createCertificateAction(formData);
  }

  if (options.length === 0) {
    return (
      <>
        <PageHeader title="Add certificate" description="Link evidence to a withdrawal." />
        <EmptyState
          title="Record a withdrawal first"
          description="Certificates must reference an existing withdrawal."
        />
        <div style={{ marginTop: 16 }}>
          <Link href="/withdrawals/new" className="fpm-btn fpm-btn--primary">
            + Record Withdrawal
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Add certificate"
        description="PNG/JPEG/WebP · max 10 MB · private storage"
        breadcrumbs={[{ label: 'Certificates', href: '/certificates' }, { label: 'New' }]}
      />
      <Card>
        <form
          action={action}
          encType="multipart/form-data"
          style={{ display: 'grid', gap: 16, maxWidth: 560 }}
        >
          <FormField id="withdrawalId" label="Withdrawal" required>
            <Select id="withdrawalId" name="withdrawalId" required defaultValue="">
              <option value="" disabled>
                Select withdrawal
              </option>
              {options.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField id="file" label="Image" required hint="Magic-byte validated on the server">
            <Input
              id="file"
              name="file"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              required
            />
          </FormField>
          <FormField id="title" label="Title">
            <Input id="title" name="title" placeholder="Optional title" />
          </FormField>
          <FormField id="issuedAt" label="Issued date">
            <Input id="issuedAt" name="issuedAt" type="date" />
          </FormField>
          <FormField id="notes" label="Notes">
            <Textarea id="notes" name="notes" rows={3} />
          </FormField>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button type="submit" variant="primary">
              Upload certificate
            </Button>
            <Link href="/certificates" className="fpm-btn fpm-btn--secondary">
              Cancel
            </Link>
          </div>
        </form>
      </Card>
    </>
  );
}
