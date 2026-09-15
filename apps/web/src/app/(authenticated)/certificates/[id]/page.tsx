import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge, Card, PageHeader } from '@fpm/ui';
import { getCertificateAction } from '@/server/actions/certificates';
import { CertificateDeleteButton } from '@/components/certificates/certificate-delete-button';

export default async function CertificateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getCertificateAction(id);
  if (!result.ok) {
    if (result.error.code === 'NOT_FOUND') notFound();
    return <p role="alert">{result.error.message}</p>;
  }

  const { certificate } = result;

  return (
    <>
      <PageHeader
        title={certificate.title || certificate.originalFilename}
        description="Private certificate object"
        breadcrumbs={[
          { label: 'Certificates', href: '/certificates' },
          { label: certificate.title || certificate.originalFilename },
        ]}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <Link
              href={`/certificates/${certificate.id}/edit`}
              className="fpm-btn fpm-btn--secondary"
            >
              Edit metadata
            </Link>
            <CertificateDeleteButton certificateId={certificate.id} />
          </div>
        }
      />
      <Card>
        <img
          src={`/api/certificates/${certificate.id}/file`}
          alt={certificate.title || certificate.originalFilename}
          style={{
            maxWidth: '100%',
            borderRadius: 12,
            border: '1px solid var(--fpm-border)',
          }}
        />
        <dl style={{ display: 'grid', gap: 12, margin: '16px 0 0' }}>
          <div>
            <dt style={{ color: 'var(--fpm-text-muted)', fontSize: 12 }}>Withdrawal</dt>
            <dd style={{ margin: 0 }}>
              <Link href={`/withdrawals/${certificate.withdrawalId}`}>
                {certificate.withdrawalId}
              </Link>
            </dd>
          </div>
          <div>
            <dt style={{ color: 'var(--fpm-text-muted)', fontSize: 12 }}>Type / size</dt>
            <dd style={{ margin: 0 }}>
              <Badge tone="info">{certificate.mimeType}</Badge> · {certificate.sizeBytes} bytes
            </dd>
          </div>
          <div>
            <dt style={{ color: 'var(--fpm-text-muted)', fontSize: 12 }}>Checksum (sha256)</dt>
            <dd style={{ margin: 0, fontFamily: 'ui-monospace, monospace', fontSize: 12 }}>
              {certificate.checksum}
            </dd>
          </div>
          <div>
            <dt style={{ color: 'var(--fpm-text-muted)', fontSize: 12 }}>Notes</dt>
            <dd style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{certificate.notes ?? '—'}</dd>
          </div>
        </dl>
      </Card>
    </>
  );
}
