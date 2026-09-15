import Link from 'next/link';
import { Alert, Card, PageHeader } from '@fpm/ui';
import { EXPORT_MODULES } from '@/server/export/modules';

const labels: Record<(typeof EXPORT_MODULES)[number], string> = {
  firms: 'Prop Firms',
  'trading-accounts': 'Trading Accounts',
  withdrawals: 'Withdrawals',
  'scale-events': 'Scale Events',
  certificates: 'Certificates',
  'dashboard-summary': 'Dashboard Summary',
};

export default function DataSettingsPage() {
  return (
    <>
      <PageHeader
        title="Data Management"
        description="Export workspace modules to Excel. Backup/restore arrive in FPM-016/017."
      />

      <Alert tone="info" title="Excel export (FPM-013)">
        Exports include styled headers, autofilter, frozen header row, and formula-injection
        protection for text cells. Money amounts stay as exact decimal strings (no float coercion).
        Broker exports deferred to FPM-014.
      </Alert>

      <Card style={{ marginTop: 20 }}>
        <h2 style={{ margin: '0 0 12px', fontSize: 16 }}>Download modules</h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
          {EXPORT_MODULES.map((module) => (
            <li key={module}>
              <Link href={`/api/exports/${module}`} className="fpm-btn fpm-btn--secondary">
                Export {labels[module]}
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
