import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { and, desc, eq } from 'drizzle-orm';
import JSZip from 'jszip';
import {
  backupRecords,
  brokerAccounts,
  brokerDeposits,
  brokers,
  brokerWithdrawals,
  certificates,
  createId,
  equitySnapshots,
  firms,
  scaleEvents,
  tradingAccounts,
  withdrawals,
  workspaces,
  type Database,
} from '@fpm/db';
import { getServerEnv } from '../env';
import { AppError } from '../errors';
import { buildModuleExport, EXPORT_MODULES } from '../export/modules';
import { writeAuditLog } from './audit';

const FORMAT_VERSION = '1';
const APP_VERSION = '0.0.0';

type ManifestEntry = {
  path: string;
  bytes: number;
  sha256: string;
  contentType: string;
  entity?: string;
  recordCount?: number;
};

function sha256(buf: Buffer | string): string {
  return createHash('sha256').update(buf).digest('hex');
}

function jsonBuffer(data: unknown): Buffer {
  return Buffer.from(JSON.stringify(data, null, 2), 'utf8');
}

async function addEntry(
  zip: JSZip,
  entries: ManifestEntry[],
  filePath: string,
  content: Buffer,
  contentType: string,
  entity?: string,
  recordCount?: number,
) {
  zip.file(filePath, content);
  entries.push({
    path: filePath,
    bytes: content.byteLength,
    sha256: sha256(content),
    contentType,
    entity,
    recordCount,
  });
}

export async function listBackupRecords(db: Database, workspaceId: string) {
  return db
    .select()
    .from(backupRecords)
    .where(eq(backupRecords.workspaceId, workspaceId))
    .orderBy(desc(backupRecords.createdAt))
    .limit(50);
}

export async function createWorkspaceBackup(
  db: Database,
  input: { workspaceId: string; userId: string },
): Promise<{ id: string; filename: string; objectKey: string }> {
  const workspaceRows = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, input.workspaceId))
    .limit(1);
  const workspace = workspaceRows[0];
  if (!workspace) throw new AppError('NOT_FOUND', 'Workspace not found', 404);

  const id = createId();
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `fpm-backup-${stamp}.zip`;
  const env = getServerEnv();
  const backupRoot = path.resolve(path.dirname(env.CERTIFICATE_STORAGE_PATH), 'backups');
  await mkdir(backupRoot, { recursive: true });
  const objectKey = path.join(backupRoot, `${input.workspaceId}-${id}.zip`);

  await db.insert(backupRecords).values({
    id,
    workspaceId: input.workspaceId,
    createdByUserId: input.userId,
    filename,
    sizeBytes: '0',
    status: 'RUNNING',
    objectKey,
    formatVersion: FORMAT_VERSION,
  });

  try {
    const zip = new JSZip();
    const entries: ManifestEntry[] = [];

    const [
      firmRows,
      accountRows,
      withdrawalRows,
      scaleRows,
      certRows,
      brokerRows,
      brokerAccountRows,
      depositRows,
      brokerWdRows,
      snapshotRows,
    ] = await Promise.all([
      db.select().from(firms).where(eq(firms.workspaceId, input.workspaceId)),
      db.select().from(tradingAccounts).where(eq(tradingAccounts.workspaceId, input.workspaceId)),
      db.select().from(withdrawals).where(eq(withdrawals.workspaceId, input.workspaceId)),
      db.select().from(scaleEvents).where(eq(scaleEvents.workspaceId, input.workspaceId)),
      db.select().from(certificates).where(eq(certificates.workspaceId, input.workspaceId)),
      db.select().from(brokers).where(eq(brokers.workspaceId, input.workspaceId)),
      db.select().from(brokerAccounts).where(eq(brokerAccounts.workspaceId, input.workspaceId)),
      db.select().from(brokerDeposits).where(eq(brokerDeposits.workspaceId, input.workspaceId)),
      db
        .select()
        .from(brokerWithdrawals)
        .where(eq(brokerWithdrawals.workspaceId, input.workspaceId)),
      db.select().from(equitySnapshots).where(eq(equitySnapshots.workspaceId, input.workspaceId)),
    ]);

    const jsonFiles: Array<[string, unknown, string, number]> = [
      ['json/firms.json', firmRows, 'Firm', firmRows.length],
      ['json/accounts.json', accountRows, 'TradingAccount', accountRows.length],
      ['json/withdrawals.json', withdrawalRows, 'Withdrawal', withdrawalRows.length],
      ['json/scale_events.json', scaleRows, 'ScaleEvent', scaleRows.length],
      ['json/certificates.json', certRows, 'Certificate', certRows.length],
      ['json/brokers.json', brokerRows, 'Broker', brokerRows.length],
      ['json/broker_accounts.json', brokerAccountRows, 'BrokerAccount', brokerAccountRows.length],
      ['json/broker_deposits.json', depositRows, 'BrokerDeposit', depositRows.length],
      ['json/broker_withdrawals.json', brokerWdRows, 'BrokerWithdrawal', brokerWdRows.length],
      ['json/equity_snapshots.json', snapshotRows, 'EquitySnapshot', snapshotRows.length],
    ];

    for (const [filePath, data, entity, count] of jsonFiles) {
      await addEntry(zip, entries, filePath, jsonBuffer(data), 'application/json', entity, count);
    }

    for (const exportModule of EXPORT_MODULES) {
      const exported = await buildModuleExport(db, input.workspaceId, exportModule);
      await addEntry(
        zip,
        entries,
        `excel/${exported.filename}`,
        exported.buffer,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        exportModule,
      );
    }

    const certRoot = path.resolve(env.CERTIFICATE_STORAGE_PATH);
    for (const cert of certRows) {
      try {
        const fileBuf = await readFile(path.join(certRoot, cert.objectKey));
        await addEntry(
          zip,
          entries,
          `uploads/certificates/${cert.objectKey}`,
          fileBuf,
          cert.mimeType,
          'CertificateObject',
        );
      } catch {
        // Object may be missing; continue and record in notes later
      }
    }

    const sqlNote = Buffer.from(
      `-- FPM workspace data dump placeholder (format ${FORMAT_VERSION})\n` +
        `-- Full pg_dump is deferred to production ops (FPM-018).\n` +
        `-- Authoritative restore source for MVP: json/* entities + uploads.\n` +
        `-- workspaceId=${input.workspaceId}\n` +
        `-- Never execute SQL from uploaded backups (Spec §12).\n`,
      'utf8',
    );
    await addEntry(
      zip,
      entries,
      'database/database_backup.sql',
      sqlNote,
      'application/sql',
      'DatabaseDump',
    );

    const uncompressed = entries.reduce((sum, e) => sum + e.bytes, 0);
    const counts = Object.fromEntries(jsonFiles.map(([, , entity, count]) => [entity, count]));

    const manifest = {
      checksumAlgorithm: 'SHA-256',
      files: entries,
    };
    const manifestBuf = jsonBuffer(manifest);
    const manifestChecksum = sha256(manifestBuf);
    // manifest itself listed after metadata; include as entry after write
    zip.file('manifest.json', manifestBuf);

    const metadata = {
      product: 'Funded Portfolio Manager',
      formatVersion: FORMAT_VERSION,
      applicationVersion: APP_VERSION,
      schemaVersion: '0008_backup_records',
      createdAtUtc: new Date().toISOString(),
      workspace: {
        id: workspace.id,
        name: workspace.name,
        timezone: workspace.timezone,
        defaultCurrency: workspace.defaultCurrency,
      },
      recordCounts: counts,
      fileCount: entries.length + 2, // + manifest + metadata
      totalUncompressedBytes: uncompressed + manifestBuf.byteLength,
      checksumAlgorithm: 'SHA-256',
      manifestChecksum,
      excludes: ['password hashes', 'session tokens', 'secrets', 'credentials'],
    };
    const metadataBuf = jsonBuffer(metadata);
    zip.file('metadata.json', metadataBuf);

    const zipBuffer = Buffer.from(
      await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }),
    );
    await writeFile(objectKey, zipBuffer);
    const zipChecksum = sha256(zipBuffer);

    await db
      .update(backupRecords)
      .set({
        status: 'COMPLETED',
        sizeBytes: String(zipBuffer.byteLength),
        checksum: zipChecksum,
        completedAt: new Date(),
        notes: 'Spec ZIP v1; SQL dump placeholder; no secrets included',
      })
      .where(and(eq(backupRecords.id, id), eq(backupRecords.workspaceId, input.workspaceId)));

    await writeAuditLog(db, {
      workspaceId: input.workspaceId,
      actorUserId: input.userId,
      action: 'CREATE',
      module: 'backup',
      recordType: 'BackupRecord',
      recordId: id,
      metadata: { filename, bytes: zipBuffer.byteLength },
    });

    return { id, filename, objectKey };
  } catch (error) {
    await db
      .update(backupRecords)
      .set({
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Backup failed',
        completedAt: new Date(),
      })
      .where(eq(backupRecords.id, id));
    throw error;
  }
}

export async function readBackupFile(
  db: Database,
  workspaceId: string,
  backupId: string,
): Promise<{ filename: string; buffer: Buffer }> {
  const rows = await db
    .select()
    .from(backupRecords)
    .where(and(eq(backupRecords.id, backupId), eq(backupRecords.workspaceId, workspaceId)))
    .limit(1);
  const row = rows[0];
  if (!row || row.status !== 'COMPLETED' || !row.objectKey) {
    throw new AppError('NOT_FOUND', 'Backup not available', 404);
  }
  const buffer = await readFile(row.objectKey);
  return { filename: row.filename, buffer };
}
