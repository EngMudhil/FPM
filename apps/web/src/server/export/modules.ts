import { and, asc, desc, eq, isNull } from 'drizzle-orm';
import {
  certificates,
  firms,
  scaleEvents,
  tradingAccounts,
  withdrawals,
  type Database,
} from '@fpm/db';
import {
  countRecognizedPayouts,
  sumPendingByCurrency,
  sumRecognizedByCurrency,
} from '@fpm/financial';
import { accountDisplayName } from '../services/accounts';
import { buildWorkbookBuffer, type ExportColumn } from './workbook';

export const EXPORT_MODULES = [
  'firms',
  'trading-accounts',
  'withdrawals',
  'scale-events',
  'certificates',
  'dashboard-summary',
] as const;

export type ExportModule = (typeof EXPORT_MODULES)[number];

export function isExportModule(value: string): value is ExportModule {
  return (EXPORT_MODULES as readonly string[]).includes(value);
}

function moneyMapLines(map: Record<string, string>): string {
  const entries = Object.entries(map);
  if (entries.length === 0) return '';
  return entries.map(([c, a]) => `${a} ${c}`).join(' | ');
}

export async function buildModuleExport(
  db: Database,
  workspaceId: string,
  module: ExportModule,
): Promise<{ filename: string; buffer: Buffer }> {
  const stamp = new Date().toISOString().slice(0, 10);

  if (module === 'firms') {
    const rows = await db
      .select()
      .from(firms)
      .where(eq(firms.workspaceId, workspaceId))
      .orderBy(asc(firms.name));
    const columns: ExportColumn[] = [
      { key: 'id', header: 'ID', width: 28 },
      { key: 'name', header: 'Name', width: 28 },
      { key: 'website', header: 'Website', width: 32 },
      { key: 'notes', header: 'Notes', width: 40 },
      { key: 'archivedAt', header: 'Archived At', width: 24 },
      { key: 'createdAt', header: 'Created At', width: 24 },
    ];
    const buffer = await buildWorkbookBuffer({
      sheetName: 'Prop Firms',
      columns,
      rows: rows.map((row) => ({
        id: row.id,
        name: row.name,
        website: row.website,
        notes: row.notes,
        archivedAt: row.archivedAt?.toISOString() ?? '',
        createdAt: row.createdAt.toISOString(),
      })),
    });
    return { filename: `fpm-firms-${stamp}.xlsx`, buffer };
  }

  if (module === 'trading-accounts') {
    const rows = await db
      .select({
        account: tradingAccounts,
        firmName: firms.name,
      })
      .from(tradingAccounts)
      .innerJoin(firms, eq(tradingAccounts.firmId, firms.id))
      .where(eq(tradingAccounts.workspaceId, workspaceId))
      .orderBy(asc(firms.name));
    const columns: ExportColumn[] = [
      { key: 'id', header: 'ID', width: 28 },
      { key: 'firmName', header: 'Firm', width: 24 },
      { key: 'accountNumber', header: 'Account Number', width: 18 },
      { key: 'label', header: 'Label', width: 20 },
      { key: 'phase', header: 'Phase', width: 12 },
      { key: 'initialSize', header: 'Initial Size', width: 16 },
      { key: 'currentSize', header: 'Current Size', width: 16 },
      { key: 'currency', header: 'Currency', width: 10 },
      { key: 'platform', header: 'Platform', width: 14 },
      { key: 'startDate', header: 'Start Date', width: 14 },
      { key: 'notes', header: 'Notes', width: 36 },
      { key: 'archivedAt', header: 'Archived At', width: 24 },
    ];
    const buffer = await buildWorkbookBuffer({
      sheetName: 'Trading Accounts',
      columns,
      rows: rows.map((row) => ({
        id: row.account.id,
        firmName: row.firmName,
        accountNumber: row.account.accountNumber,
        label: row.account.label,
        phase: row.account.phase,
        initialSize: row.account.initialSize,
        currentSize: row.account.currentSize,
        currency: row.account.currency,
        platform: row.account.platform,
        startDate: row.account.startDate,
        notes: row.account.notes,
        archivedAt: row.account.archivedAt?.toISOString() ?? '',
      })),
    });
    return { filename: `fpm-trading-accounts-${stamp}.xlsx`, buffer };
  }

  if (module === 'withdrawals') {
    const rows = await db
      .select({
        withdrawal: withdrawals,
        firmName: firms.name,
        accountLabel: tradingAccounts.label,
        accountNumber: tradingAccounts.accountNumber,
      })
      .from(withdrawals)
      .innerJoin(tradingAccounts, eq(withdrawals.tradingAccountId, tradingAccounts.id))
      .innerJoin(firms, eq(tradingAccounts.firmId, firms.id))
      .where(eq(withdrawals.workspaceId, workspaceId))
      .orderBy(desc(withdrawals.requestedAt));
    const columns: ExportColumn[] = [
      { key: 'id', header: 'ID', width: 28 },
      { key: 'account', header: 'Account', width: 28 },
      { key: 'firmName', header: 'Firm', width: 20 },
      { key: 'amount', header: 'Amount', width: 14 },
      { key: 'currency', header: 'Currency', width: 10 },
      { key: 'status', header: 'Status', width: 12 },
      { key: 'requestedAt', header: 'Requested At', width: 24 },
      { key: 'receivedAt', header: 'Received At', width: 24 },
      { key: 'notes', header: 'Notes', width: 36 },
    ];
    const buffer = await buildWorkbookBuffer({
      sheetName: 'Withdrawals',
      columns,
      rows: rows.map((row) => ({
        id: row.withdrawal.id,
        account: accountDisplayName({
          label: row.accountLabel,
          accountNumber: row.accountNumber,
          firmName: row.firmName,
        }),
        firmName: row.firmName,
        amount: row.withdrawal.amount,
        currency: row.withdrawal.currency,
        status: row.withdrawal.status,
        requestedAt: row.withdrawal.requestedAt.toISOString(),
        receivedAt: row.withdrawal.receivedAt?.toISOString() ?? '',
        notes: row.withdrawal.notes,
      })),
    });
    return { filename: `fpm-withdrawals-${stamp}.xlsx`, buffer };
  }

  if (module === 'scale-events') {
    const rows = await db
      .select({
        scaleEvent: scaleEvents,
        firmName: firms.name,
        accountLabel: tradingAccounts.label,
        accountNumber: tradingAccounts.accountNumber,
        currency: tradingAccounts.currency,
      })
      .from(scaleEvents)
      .innerJoin(tradingAccounts, eq(scaleEvents.tradingAccountId, tradingAccounts.id))
      .innerJoin(firms, eq(tradingAccounts.firmId, firms.id))
      .where(eq(scaleEvents.workspaceId, workspaceId))
      .orderBy(desc(scaleEvents.scaledAt));
    const columns: ExportColumn[] = [
      { key: 'id', header: 'ID', width: 28 },
      { key: 'account', header: 'Account', width: 28 },
      { key: 'fromSize', header: 'From Size', width: 14 },
      { key: 'toSize', header: 'To Size', width: 14 },
      { key: 'currency', header: 'Currency', width: 10 },
      { key: 'scaledAt', header: 'Scaled At', width: 24 },
      { key: 'notes', header: 'Notes', width: 36 },
    ];
    const buffer = await buildWorkbookBuffer({
      sheetName: 'Scale Events',
      columns,
      rows: rows.map((row) => ({
        id: row.scaleEvent.id,
        account: accountDisplayName({
          label: row.accountLabel,
          accountNumber: row.accountNumber,
          firmName: row.firmName,
        }),
        fromSize: row.scaleEvent.fromSize,
        toSize: row.scaleEvent.toSize,
        currency: row.currency,
        scaledAt: row.scaleEvent.scaledAt.toISOString(),
        notes: row.scaleEvent.notes,
      })),
    });
    return { filename: `fpm-scale-events-${stamp}.xlsx`, buffer };
  }

  if (module === 'certificates') {
    const rows = await db
      .select()
      .from(certificates)
      .where(eq(certificates.workspaceId, workspaceId))
      .orderBy(desc(certificates.createdAt));
    const columns: ExportColumn[] = [
      { key: 'id', header: 'ID', width: 28 },
      { key: 'withdrawalId', header: 'Withdrawal ID', width: 28 },
      { key: 'title', header: 'Title', width: 28 },
      { key: 'originalFilename', header: 'Filename', width: 28 },
      { key: 'mimeType', header: 'MIME', width: 18 },
      { key: 'sizeBytes', header: 'Size Bytes', width: 14 },
      { key: 'checksum', header: 'Checksum', width: 44 },
      { key: 'issuedAt', header: 'Issued At', width: 24 },
      { key: 'notes', header: 'Notes', width: 36 },
    ];
    const buffer = await buildWorkbookBuffer({
      sheetName: 'Certificates',
      columns,
      rows: rows.map((row) => ({
        id: row.id,
        withdrawalId: row.withdrawalId,
        title: row.title,
        originalFilename: row.originalFilename,
        mimeType: row.mimeType,
        sizeBytes: row.sizeBytes,
        checksum: row.checksum,
        issuedAt: row.issuedAt?.toISOString() ?? '',
        notes: row.notes,
      })),
    });
    return { filename: `fpm-certificates-${stamp}.xlsx`, buffer };
  }

  // dashboard-summary
  const [wdRows, accountCount] = await Promise.all([
    db.select().from(withdrawals).where(eq(withdrawals.workspaceId, workspaceId)),
    db
      .select({ id: tradingAccounts.id })
      .from(tradingAccounts)
      .where(and(eq(tradingAccounts.workspaceId, workspaceId), isNull(tradingAccounts.archivedAt))),
  ]);
  const records = wdRows.map((row) => ({
    amount: row.amount,
    currency: row.currency,
    status: row.status,
    requestedAt: row.requestedAt,
    receivedAt: row.receivedAt,
  }));
  const columns: ExportColumn[] = [
    { key: 'metric', header: 'Metric', width: 36 },
    { key: 'value', header: 'Value', width: 48 },
    { key: 'notes', header: 'Notes', width: 48 },
  ];
  const buffer = await buildWorkbookBuffer({
    sheetName: 'Dashboard Summary',
    columns,
    rows: [
      {
        metric: 'Recognized lifetime (PAID + receivedAt)',
        value: moneyMapLines(sumRecognizedByCurrency(records)) || '—',
        notes: 'Per currency; no FX mix',
      },
      {
        metric: 'Pending amount',
        value: moneyMapLines(sumPendingByCurrency(records)) || '—',
        notes: 'Status PENDING',
      },
      {
        metric: 'Recognized payout count',
        value: String(countRecognizedPayouts(records)),
        notes: '',
      },
      {
        metric: 'Non-archived trading accounts',
        value: String(accountCount.length),
        notes: '',
      },
      {
        metric: 'Funded capital',
        value: 'Deferred',
        notes: 'OQ-001',
      },
    ],
  });
  return { filename: `fpm-dashboard-summary-${stamp}.xlsx`, buffer };
}
