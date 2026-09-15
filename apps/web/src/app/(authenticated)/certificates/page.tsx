import Link from 'next/link';
import { Badge, Card, EmptyState, PageHeader } from '@fpm/ui';
import { listCertificatesAction } from '@/server/actions/certificates';

export default async function CertificatesPage() {
  const result = await listCertificatesAction();
  if (!result.ok) {
    return (
      <>
        <PageHeader title="Certificates" description="Payout evidence gallery." />
        <EmptyState title="Unable to load certificates" description={result.error.message} />
      </>
    );
  }

  const { items } = result;

  return (
    <>
      <PageHeader
        title="Certificates"
        description="Private payout evidence linked to withdrawals."
        actions={
          <Link href="/certificates/new" className="fpm-btn fpm-btn--primary">
            + Add Certificate
          </Link>
        }
      />

      {items.length === 0 ? (
        <EmptyState
          title="No certificates yet"
          description="Upload a PNG, JPEG, or WebP image linked to a withdrawal."
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 16,
          }}
        >
          {items.map((cert) => (
            <Card key={cert.id} style={{ padding: 12 }}>
              <Link
                href={`/certificates/${cert.id}`}
                style={{ color: 'inherit', textDecoration: 'none' }}
              >
                <img
                  src={`/api/certificates/${cert.id}/file`}
                  alt={cert.title || cert.originalFilename}
                  style={{
                    width: '100%',
                    height: 140,
                    objectFit: 'cover',
                    borderRadius: 8,
                    border: '1px solid var(--fpm-border)',
                    background: 'var(--fpm-hover)',
                  }}
                />
                <div style={{ marginTop: 10, fontWeight: 600 }}>
                  {cert.title || cert.originalFilename}
                </div>
                <div style={{ marginTop: 4 }}>
                  <Badge tone="info">{cert.mimeType}</Badge>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
