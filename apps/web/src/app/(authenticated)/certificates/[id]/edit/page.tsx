import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button, Card, FormField, Input, PageHeader, Textarea } from '@fpm/ui';
import { getCertificateAction, updateCertificateAction } from '@/server/actions/certificates';

export default async function EditCertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getCertificateAction(id);
  if (!result.ok) {
    if (result.error.code === 'NOT_FOUND') notFound();
    return <p role="alert">{result.error.message}</p>;
  }

  const { certificate } = result;

  async function action(formData: FormData) {
    'use server';
    await updateCertificateAction(certificate.id, formData);
  }

  const issued =
    certificate.issuedAt instanceof Date ? certificate.issuedAt.toISOString().slice(0, 10) : '';

  return (
    <>
      <PageHeader
        title="Edit certificate metadata"
        description="Image file is immutable after upload; replace by deleting and re-uploading."
        breadcrumbs={[
          { label: 'Certificates', href: '/certificates' },
          {
            label: certificate.title || certificate.originalFilename,
            href: `/certificates/${certificate.id}`,
          },
          { label: 'Edit' },
        ]}
      />
      <Card>
        <form action={action} style={{ display: 'grid', gap: 16, maxWidth: 520 }}>
          <FormField id="title" label="Title">
            <Input id="title" name="title" defaultValue={certificate.title ?? ''} />
          </FormField>
          <FormField id="issuedAt" label="Issued date">
            <Input id="issuedAt" name="issuedAt" type="date" defaultValue={issued} />
          </FormField>
          <FormField id="notes" label="Notes">
            <Textarea id="notes" name="notes" rows={4} defaultValue={certificate.notes ?? ''} />
          </FormField>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button type="submit" variant="primary">
              Save
            </Button>
            <Link href={`/certificates/${certificate.id}`} className="fpm-btn fpm-btn--secondary">
              Cancel
            </Link>
          </div>
        </form>
      </Card>
    </>
  );
}
