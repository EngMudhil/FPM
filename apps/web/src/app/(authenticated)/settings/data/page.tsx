import Link from 'next/link';
import {
  Alert,
  Badge,
  Card,
  EmptyState,
  PageHeader,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@fpm/ui';
import { CreateBackupButton } from '@/components/backup/create-backup-button';
import { RestorePanel } from '@/components/restore/restore-panel';
import { listBackupsAction } from '@/server/actions/backup';
import { listRestoreJobsAction } from '@/server/actions/restore';
import { EXPORT_MODULES } from '@/server/export/modules';

const labels: Record<(typeof EXPORT_MODULES)[number], string> = {
  firms: 'Prop Firms',
  'trading-accounts': 'Trading Accounts',
  withdrawals: 'Withdrawals',
  'scale-events': 'Scale Events',
  certificates: 'Certificates',
  'dashboard-summary': 'Dashboard Summary',
};

export default async function DataSettingsPage() {
  const [backups, restores] = await Promise.all([listBackupsAction(), listRestoreJobsAction()]);

  return (
    <>
      <PageHeader
        title="Data Management"
        description="Excel exports, Spec ZIP backups, and safe restore (ADR-013)."
      />

      <Alert tone="info" title="Backup & restore">
        Upload never mutates live data. Restore requires typed RESTORE, a one-time token, and a
        successful pre-restore safety backup. Users/sessions/secrets are never restored from ZIP.
      </Alert>

      <Card style={{ marginTop: 20 }}>
        <h2 style={{ margin: '0 0 12px', fontSize: 16 }}>Workspace backup</h2>
        <CreateBackupButton />
        {!backups.ok ? (
          <EmptyState title="Unable to load backups" description={backups.error.message} />
        ) : backups.items.length === 0 ? (
          <p style={{ marginTop: 16, color: 'var(--fpm-text-muted)' }}>No backups yet.</p>
        ) : (
          <div style={{ marginTop: 16 }}>
            <Table>
              <THead>
                <TR>
                  <TH>Created</TH>
                  <TH>Status</TH>
                  <TH>Size</TH>
                  <TH>Download</TH>
                </TR>
              </THead>
              <TBody>
                {backups.items.map((row) => (
                  <TR key={row.id}>
                    <TD>{row.createdAt.toISOString()}</TD>
                    <TD>
                      <Badge
                        tone={
                          row.status === 'COMPLETED'
                            ? 'success'
                            : row.status === 'FAILED'
                              ? 'danger'
                              : 'warning'
                        }
                      >
                        {row.status}
                      </Badge>
                    </TD>
                    <TD>{row.sizeBytes} bytes</TD>
                    <TD>
                      {row.status === 'COMPLETED' ? (
                        <Link href={`/api/backups/${row.id}`}>Download ZIP</Link>
                      ) : (
                        '—'
                      )}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
        )}
      </Card>

      <Card style={{ marginTop: 20 }}>
        <h2 style={{ margin: '0 0 12px', fontSize: 16 }}>Safe restore</h2>
        {!restores.ok ? (
          <EmptyState title="Unable to load restore jobs" description={restores.error.message} />
        ) : (
          <RestorePanel jobs={restores.items} />
        )}
      </Card>

      <Card style={{ marginTop: 20 }}>
        <h2 style={{ margin: '0 0 12px', fontSize: 16 }}>Download Excel modules</h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
          {EXPORT_MODULES.map((moduleName) => (
            <li key={moduleName}>
              <Link href={`/api/exports/${moduleName}`} className="fpm-btn fpm-btn--secondary">
                Export {labels[moduleName]}
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
