import { and, count, desc, eq } from 'drizzle-orm';
import { certificates, createId, withdrawals, type Certificate, type Database } from '@fpm/db';
import { AppError } from '../errors';
import {
  assertAllowedCertificateUpload,
  buildCertificateObjectKey,
  deleteCertificateObject,
  storeCertificateObject,
} from '../storage/certificates';

export type CertificateInput = {
  withdrawalId: string;
  title?: string | null;
  issuedAt?: Date | null;
  notes?: string | null;
  file: {
    buffer: Buffer;
    originalFilename: string;
    declaredMime?: string | null;
  };
};

export async function listCertificates(db: Database, workspaceId: string) {
  const rows = await db
    .select()
    .from(certificates)
    .where(eq(certificates.workspaceId, workspaceId))
    .orderBy(desc(certificates.createdAt));
  return rows;
}

export async function getCertificateById(
  db: Database,
  workspaceId: string,
  certificateId: string,
): Promise<Certificate> {
  const rows = await db
    .select()
    .from(certificates)
    .where(and(eq(certificates.id, certificateId), eq(certificates.workspaceId, workspaceId)))
    .limit(1);
  const row = rows[0];
  if (!row) throw new AppError('NOT_FOUND', 'Certificate not found', 404);
  return row;
}

export async function createCertificate(
  db: Database,
  workspaceId: string,
  input: CertificateInput,
): Promise<Certificate> {
  const withdrawalRows = await db
    .select()
    .from(withdrawals)
    .where(and(eq(withdrawals.id, input.withdrawalId), eq(withdrawals.workspaceId, workspaceId)))
    .limit(1);
  if (!withdrawalRows[0]) {
    throw new AppError('VALIDATION', 'Withdrawal not found in workspace', 400);
  }

  const detected = assertAllowedCertificateUpload(input.file.buffer, input.file.declaredMime);
  const objectKey = buildCertificateObjectKey(workspaceId, detected.extension);
  const stored = await storeCertificateObject(objectKey, input.file.buffer);

  const id = createId();
  try {
    await db.insert(certificates).values({
      id,
      workspaceId,
      withdrawalId: input.withdrawalId,
      title: input.title?.trim() || null,
      issuedAt: input.issuedAt ?? null,
      objectKey,
      originalFilename: input.file.originalFilename.slice(0, 255),
      mimeType: detected.mimeType,
      sizeBytes: String(stored.sizeBytes),
      checksum: stored.checksum,
      notes: input.notes?.trim() || null,
    });
  } catch (error) {
    await deleteCertificateObject(objectKey);
    throw error;
  }

  return getCertificateById(db, workspaceId, id);
}

export async function updateCertificateMetadata(
  db: Database,
  workspaceId: string,
  certificateId: string,
  input: { title?: string | null; issuedAt?: Date | null; notes?: string | null },
): Promise<Certificate> {
  await getCertificateById(db, workspaceId, certificateId);
  const patch: {
    title?: string | null;
    issuedAt?: Date | null;
    notes?: string | null;
    updatedAt: Date;
  } = { updatedAt: new Date() };
  if (input.title !== undefined) patch.title = input.title?.trim() || null;
  if (input.issuedAt !== undefined) patch.issuedAt = input.issuedAt;
  if (input.notes !== undefined) patch.notes = input.notes?.trim() || null;
  await db
    .update(certificates)
    .set(patch)
    .where(and(eq(certificates.id, certificateId), eq(certificates.workspaceId, workspaceId)));
  return getCertificateById(db, workspaceId, certificateId);
}

/** Deletes DB row and storage object (fixes HB-018 orphan defect). */
export async function deleteCertificate(
  db: Database,
  workspaceId: string,
  certificateId: string,
): Promise<void> {
  const cert = await getCertificateById(db, workspaceId, certificateId);
  await db
    .delete(certificates)
    .where(and(eq(certificates.id, certificateId), eq(certificates.workspaceId, workspaceId)));
  await deleteCertificateObject(cert.objectKey);
}

export async function countCertificatesForWithdrawal(
  db: Database,
  workspaceId: string,
  withdrawalId: string,
) {
  const rows = await db
    .select({ value: count() })
    .from(certificates)
    .where(
      and(eq(certificates.workspaceId, workspaceId), eq(certificates.withdrawalId, withdrawalId)),
    );
  return rows[0]?.value ?? 0;
}
