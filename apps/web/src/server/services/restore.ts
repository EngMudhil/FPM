import { createHash, randomBytes } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { and, eq, sql } from 'drizzle-orm';
import JSZip from 'jszip';
import {
  brokerAccounts,
  brokerDeposits,
  brokers,
  brokerWithdrawals,
  certificates,
  createId,
  equitySnapshots,
  firms,
  restoreJobs,
  scaleEvents,
  tradingAccounts,
  withdrawals,
  withTransaction,
  type Database,
} from '@fpm/db';
import { getServerEnv } from '../env';
import { AppError } from '../errors';
import { createWorkspaceBackup } from './backup';
import { writeAuditLog } from './audit';

const MAX_ZIP_BYTES = 50 * 1024 * 1024;
const ENTITY_FILES = [
  'json/firms.json',
  'json/accounts.json',
  'json/withdrawals.json',
  'json/scale_events.json',
  'json/certificates.json',
  'json/brokers.json',
  'json/broker_accounts.json',
  'json/broker_deposits.json',
  'json/broker_withdrawals.json',
  'json/equity_snapshots.json',
] as const;

export function assertSafeZipPath(entryName: string): string {
  const normalized = entryName.replace(/\\/g, '/');
  if (!normalized || normalized.startsWith('/') || normalized.includes(':/')) {
    throw new AppError('VALIDATION', 'Absolute ZIP paths are not allowed', 400);
  }
  if (normalized.split('/').some((part) => part === '..')) {
    throw new AppError('VALIDATION', 'ZIP Slip path rejected', 400);
  }
  if (normalized.includes('\0')) {
    throw new AppError('VALIDATION', 'Invalid ZIP path', 400);
  }
  return normalized;
}

function sha256(buf: Buffer | string): string {
  return createHash('sha256').update(buf).digest('hex');
}

function asDate(value: unknown): Date | null {
  if (value == null) return null;
  if (value instanceof Date) return value;
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) throw new Error(`Invalid date ${String(value)}`);
  return d;
}

function reviveRow(row: Record<string, unknown>, dateKeys: string[]): Record<string, unknown> {
  const out: Record<string, unknown> = { ...row };
  for (const key of dateKeys) {
    if (key in out) out[key] = asDate(out[key]);
  }
  return out;
}

async function countWorkspace(db: Database, workspaceId: string) {
  const [firmsC, accountsC, wdC, scaleC, certC, brokersC, baC, depC, bwdC, snapC] =
    await Promise.all([
      db
        .select({ c: sql<number>`count(*)::int` })
        .from(firms)
        .where(eq(firms.workspaceId, workspaceId)),
      db
        .select({ c: sql<number>`count(*)::int` })
        .from(tradingAccounts)
        .where(eq(tradingAccounts.workspaceId, workspaceId)),
      db
        .select({ c: sql<number>`count(*)::int` })
        .from(withdrawals)
        .where(eq(withdrawals.workspaceId, workspaceId)),
      db
        .select({ c: sql<number>`count(*)::int` })
        .from(scaleEvents)
        .where(eq(scaleEvents.workspaceId, workspaceId)),
      db
        .select({ c: sql<number>`count(*)::int` })
        .from(certificates)
        .where(eq(certificates.workspaceId, workspaceId)),
      db
        .select({ c: sql<number>`count(*)::int` })
        .from(brokers)
        .where(eq(brokers.workspaceId, workspaceId)),
      db
        .select({ c: sql<number>`count(*)::int` })
        .from(brokerAccounts)
        .where(eq(brokerAccounts.workspaceId, workspaceId)),
      db
        .select({ c: sql<number>`count(*)::int` })
        .from(brokerDeposits)
        .where(eq(brokerDeposits.workspaceId, workspaceId)),
      db
        .select({ c: sql<number>`count(*)::int` })
        .from(brokerWithdrawals)
        .where(eq(brokerWithdrawals.workspaceId, workspaceId)),
      db
        .select({ c: sql<number>`count(*)::int` })
        .from(equitySnapshots)
        .where(eq(equitySnapshots.workspaceId, workspaceId)),
    ]);
  return {
    Firm: firmsC[0]?.c ?? 0,
    TradingAccount: accountsC[0]?.c ?? 0,
    Withdrawal: wdC[0]?.c ?? 0,
    ScaleEvent: scaleC[0]?.c ?? 0,
    Certificate: certC[0]?.c ?? 0,
    Broker: brokersC[0]?.c ?? 0,
    BrokerAccount: baC[0]?.c ?? 0,
    BrokerDeposit: depC[0]?.c ?? 0,
    BrokerWithdrawal: bwdC[0]?.c ?? 0,
    EquitySnapshot: snapC[0]?.c ?? 0,
  };
}

export async function createRestoreJobFromUpload(
  db: Database,
  input: { workspaceId: string; userId: string; zipBuffer: Buffer },
) {
  if (input.zipBuffer.byteLength > MAX_ZIP_BYTES) {
    throw new AppError('VALIDATION', 'ZIP exceeds 50MB limit', 400);
  }

  const zip = await JSZip.loadAsync(input.zipBuffer);
  const names = Object.keys(zip.files);
  if (names.length === 0) throw new AppError('VALIDATION', 'Empty archive', 400);
  const seen = new Set<string>();
  for (const name of names) {
    const safe = assertSafeZipPath(name);
    if (seen.has(safe)) throw new AppError('VALIDATION', `Duplicate ZIP path ${safe}`, 400);
    seen.add(safe);
  }

  const metadataFile = zip.file('metadata.json');
  const manifestFile = zip.file('manifest.json');
  if (!metadataFile || !manifestFile) {
    throw new AppError('VALIDATION', 'Backup ZIP missing metadata.json or manifest.json', 400);
  }
  const metadataRaw = await metadataFile.async('nodebuffer');
  const manifestRaw = await manifestFile.async('nodebuffer');
  const metadata = JSON.parse(metadataRaw.toString('utf8')) as {
    formatVersion?: string;
    manifestChecksum?: string;
  };
  if (metadata.formatVersion !== '1') {
    throw new AppError('VALIDATION', 'Unsupported backup format version', 400);
  }
  const manifestChecksum = sha256(manifestRaw);
  if (metadata.manifestChecksum && metadata.manifestChecksum !== manifestChecksum) {
    throw new AppError('VALIDATION', 'Manifest checksum mismatch', 400);
  }

  const incomingCounts: Record<string, number> = {};
  for (const filePath of ENTITY_FILES) {
    const file = zip.file(filePath);
    if (!file) {
      incomingCounts[filePath] = 0;
      continue;
    }
    const parsed = JSON.parse((await file.async('nodebuffer')).toString('utf8')) as unknown[];
    if (!Array.isArray(parsed)) {
      throw new AppError('VALIDATION', `${filePath} must be a JSON array`, 400);
    }
    incomingCounts[filePath] = parsed.length;
  }

  const currentCounts = await countWorkspace(db, input.workspaceId);
  const preview = {
    currentCounts,
    incomingFileCounts: incomingCounts,
    note: 'Preview uses entity counts. Apply replaces workspace business data in one transaction (ADR-013). Users/sessions preserved.',
  };
  const exactDiff = {
    Firm: { current: currentCounts.Firm, incoming: incomingCounts['json/firms.json'] ?? 0 },
    TradingAccount: {
      current: currentCounts.TradingAccount,
      incoming: incomingCounts['json/accounts.json'] ?? 0,
    },
    Withdrawal: {
      current: currentCounts.Withdrawal,
      incoming: incomingCounts['json/withdrawals.json'] ?? 0,
    },
  };

  const env = getServerEnv();
  const restoreRoot = path.resolve(path.dirname(env.CERTIFICATE_STORAGE_PATH), 'restores');
  await mkdir(restoreRoot, { recursive: true });
  const id = createId();
  const objectKey = path.join(restoreRoot, `${input.workspaceId}-${id}.zip`);
  await writeFile(objectKey, input.zipBuffer);
  const token = randomBytes(24).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await db.insert(restoreJobs).values({
    id,
    workspaceId: input.workspaceId,
    createdByUserId: input.userId,
    uploadedObjectKey: objectKey,
    status: 'PREVIEW_READY',
    formatVersion: metadata.formatVersion,
    manifestChecksum,
    preview,
    exactDiff,
    confirmationToken: token,
    expiresAt,
  });

  return { id, preview, exactDiff, confirmationToken: token, expiresAt };
}

export async function listRestoreJobs(db: Database, workspaceId: string) {
  return db.select().from(restoreJobs).where(eq(restoreJobs.workspaceId, workspaceId));
}

export async function confirmAndRunRestore(
  db: Database,
  input: {
    workspaceId: string;
    userId: string;
    jobId: string;
    typedConfirm: string;
    confirmationToken: string;
  },
) {
  if (input.typedConfirm !== 'RESTORE') {
    throw new AppError('VALIDATION', 'Type RESTORE to confirm', 400);
  }

  const rows = await db
    .select()
    .from(restoreJobs)
    .where(and(eq(restoreJobs.id, input.jobId), eq(restoreJobs.workspaceId, input.workspaceId)))
    .limit(1);
  const job = rows[0];
  if (!job) throw new AppError('NOT_FOUND', 'Restore job not found', 404);
  if (job.status !== 'PREVIEW_READY' && job.status !== 'CONFIRMING') {
    throw new AppError('CONFLICT', `Restore job status is ${job.status}`, 409);
  }
  if (!job.expiresAt || job.expiresAt.getTime() < Date.now()) {
    await db
      .update(restoreJobs)
      .set({ status: 'EXPIRED', updatedAt: new Date() })
      .where(eq(restoreJobs.id, job.id));
    throw new AppError('CONFLICT', 'Restore job expired', 409);
  }
  if (!job.confirmationToken || job.confirmationToken !== input.confirmationToken) {
    throw new AppError('FORBIDDEN', 'Invalid confirmation token', 403);
  }
  if (!job.uploadedObjectKey) throw new AppError('NOT_FOUND', 'Uploaded ZIP missing', 404);

  const safety = await createWorkspaceBackup(db, {
    workspaceId: input.workspaceId,
    userId: input.userId,
  });

  await db
    .update(restoreJobs)
    .set({
      status: 'RUNNING',
      startedAt: new Date(),
      confirmationToken: null,
      backupRecordId: safety.id,
      updatedAt: new Date(),
    })
    .where(eq(restoreJobs.id, job.id));

  try {
    const zipBuffer = await readFile(job.uploadedObjectKey);
    const zip = await JSZip.loadAsync(zipBuffer);
    const readJson = async (filePath: string): Promise<Record<string, unknown>[]> => {
      const file = zip.file(filePath);
      if (!file) return [];
      const parsed = JSON.parse((await file.async('nodebuffer')).toString('utf8')) as unknown;
      if (!Array.isArray(parsed)) throw new Error(`${filePath} invalid`);
      return parsed as Record<string, unknown>[];
    };

    const firmRows = (await readJson('json/firms.json')).map((r) =>
      reviveRow(r, ['archivedAt', 'createdAt', 'updatedAt']),
    );
    const accountRows = (await readJson('json/accounts.json')).map((r) =>
      reviveRow(r, ['archivedAt', 'createdAt', 'updatedAt']),
    );
    const withdrawalRows = (await readJson('json/withdrawals.json')).map((r) =>
      reviveRow(r, ['requestedAt', 'receivedAt', 'createdAt', 'updatedAt']),
    );
    const scaleRows = (await readJson('json/scale_events.json')).map((r) =>
      reviveRow(r, ['scaledAt', 'createdAt', 'updatedAt']),
    );
    const certRows = (await readJson('json/certificates.json')).map((r) =>
      reviveRow(r, ['issuedAt', 'createdAt', 'updatedAt']),
    );
    const brokerRows = (await readJson('json/brokers.json')).map((r) =>
      reviveRow(r, ['createdAt', 'updatedAt']),
    );
    const brokerAccountRows = (await readJson('json/broker_accounts.json')).map((r) =>
      reviveRow(r, ['createdAt', 'updatedAt']),
    );
    const depositRows = (await readJson('json/broker_deposits.json')).map((r) =>
      reviveRow(r, ['depositDate', 'createdAt']),
    );
    const brokerWdRows = (await readJson('json/broker_withdrawals.json')).map((r) =>
      reviveRow(r, ['withdrawalDate', 'createdAt']),
    );
    const snapshotRows = (await readJson('json/equity_snapshots.json')).map((r) =>
      reviveRow(r, ['snapshotDate', 'createdAt']),
    );

    const total =
      firmRows.length +
      accountRows.length +
      withdrawalRows.length +
      scaleRows.length +
      certRows.length +
      brokerRows.length +
      brokerAccountRows.length;
    if (total === 0) {
      throw new AppError('VALIDATION', 'Refusing unexpectedly empty restore payload', 400);
    }

    await withTransaction(db, async (tx) => {
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${input.workspaceId}))`);

      await tx.delete(certificates).where(eq(certificates.workspaceId, input.workspaceId));
      await tx.delete(scaleEvents).where(eq(scaleEvents.workspaceId, input.workspaceId));
      await tx.delete(withdrawals).where(eq(withdrawals.workspaceId, input.workspaceId));
      await tx.delete(tradingAccounts).where(eq(tradingAccounts.workspaceId, input.workspaceId));
      await tx.delete(firms).where(eq(firms.workspaceId, input.workspaceId));
      await tx.delete(equitySnapshots).where(eq(equitySnapshots.workspaceId, input.workspaceId));
      await tx.delete(brokerDeposits).where(eq(brokerDeposits.workspaceId, input.workspaceId));
      await tx
        .delete(brokerWithdrawals)
        .where(eq(brokerWithdrawals.workspaceId, input.workspaceId));
      await tx.delete(brokerAccounts).where(eq(brokerAccounts.workspaceId, input.workspaceId));
      await tx.delete(brokers).where(eq(brokers.workspaceId, input.workspaceId));

      if (firmRows.length) await tx.insert(firms).values(firmRows as never);
      if (accountRows.length) await tx.insert(tradingAccounts).values(accountRows as never);
      if (withdrawalRows.length) await tx.insert(withdrawals).values(withdrawalRows as never);
      if (scaleRows.length) await tx.insert(scaleEvents).values(scaleRows as never);
      if (certRows.length) await tx.insert(certificates).values(certRows as never);
      if (brokerRows.length) await tx.insert(brokers).values(brokerRows as never);
      if (brokerAccountRows.length) {
        await tx.insert(brokerAccounts).values(brokerAccountRows as never);
      }
      if (depositRows.length) await tx.insert(brokerDeposits).values(depositRows as never);
      if (brokerWdRows.length) await tx.insert(brokerWithdrawals).values(brokerWdRows as never);
      if (snapshotRows.length) await tx.insert(equitySnapshots).values(snapshotRows as never);
    });

    const env = getServerEnv();
    const certRoot = path.resolve(env.CERTIFICATE_STORAGE_PATH);
    await mkdir(certRoot, { recursive: true });
    for (const [name, entry] of Object.entries(zip.files)) {
      const safe = assertSafeZipPath(name);
      if (!safe.startsWith('uploads/certificates/') || entry.dir) continue;
      const rel = safe.slice('uploads/certificates/'.length);
      const target = path.join(certRoot, rel);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, await entry.async('nodebuffer'));
    }

    await db
      .update(restoreJobs)
      .set({ status: 'COMPLETED', completedAt: new Date(), updatedAt: new Date() })
      .where(eq(restoreJobs.id, job.id));

    await writeAuditLog(db, {
      workspaceId: input.workspaceId,
      actorUserId: input.userId,
      action: 'RESTORE',
      module: 'restore',
      recordType: 'RestoreJob',
      recordId: job.id,
      metadata: { safetyBackupId: safety.id },
    });

    return { ok: true as const, safetyBackupId: safety.id };
  } catch (error) {
    await db
      .update(restoreJobs)
      .set({
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Restore failed',
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(restoreJobs.id, job.id));
    throw error;
  }
}
