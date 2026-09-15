import { createHash, randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { getServerEnv } from '../env';
import { AppError } from '../errors';

export const CERTIFICATE_MAX_BYTES = 10 * 1024 * 1024;

export type DetectedImage = {
  mimeType: 'image/png' | 'image/jpeg' | 'image/webp';
  extension: 'png' | 'jpg' | 'webp';
};

/** Magic-byte detection — do not trust client MIME alone. */
export function detectImageMagic(buffer: Buffer): DetectedImage | null {
  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return { mimeType: 'image/png', extension: 'png' };
  }
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { mimeType: 'image/jpeg', extension: 'jpg' };
  }
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return { mimeType: 'image/webp', extension: 'webp' };
  }
  return null;
}

export function assertAllowedCertificateUpload(
  buffer: Buffer,
  declaredMime?: string | null,
): DetectedImage {
  if (buffer.byteLength === 0) {
    throw new AppError('VALIDATION', 'Empty file', 400);
  }
  if (buffer.byteLength > CERTIFICATE_MAX_BYTES) {
    throw new AppError('VALIDATION', 'Certificate must be 10 MB or smaller', 400);
  }
  const detected = detectImageMagic(buffer);
  if (!detected) {
    throw new AppError('VALIDATION', 'Only PNG, JPEG, or WebP images are allowed', 400);
  }
  if (
    declaredMime &&
    declaredMime !== detected.mimeType &&
    !(declaredMime === 'image/jpg' && detected.mimeType === 'image/jpeg')
  ) {
    throw new AppError('VALIDATION', 'Declared MIME type does not match file contents', 400);
  }
  return detected;
}

function storageRoot(): string {
  const env = getServerEnv();
  return path.resolve(process.cwd(), env.CERTIFICATE_STORAGE_PATH);
}

export function buildCertificateObjectKey(workspaceId: string, extension: string): string {
  return path.posix.join(workspaceId, `${randomUUID()}.${extension}`);
}

export async function storeCertificateObject(
  objectKey: string,
  buffer: Buffer,
): Promise<{ checksum: string; sizeBytes: number }> {
  // Prevent path traversal outside workspace key shape.
  if (objectKey.includes('..') || path.isAbsolute(objectKey)) {
    throw new AppError('VALIDATION', 'Invalid object key', 400);
  }
  const absolute = path.resolve(storageRoot(), objectKey);
  const relative = path.relative(storageRoot(), absolute);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new AppError('VALIDATION', 'Invalid object path', 400);
  }
  await mkdir(path.dirname(absolute), { recursive: true });
  await writeFile(absolute, buffer);
  const checksum = createHash('sha256').update(buffer).digest('hex');
  return { checksum, sizeBytes: buffer.byteLength };
}

export async function readCertificateObject(objectKey: string): Promise<Buffer> {
  if (objectKey.includes('..') || path.isAbsolute(objectKey)) {
    throw new AppError('VALIDATION', 'Invalid object key', 400);
  }
  const absolute = path.resolve(storageRoot(), objectKey);
  const relative = path.relative(storageRoot(), absolute);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new AppError('VALIDATION', 'Invalid object path', 400);
  }
  try {
    return await readFile(absolute);
  } catch {
    throw new AppError('NOT_FOUND', 'Certificate object missing', 404);
  }
}

export async function deleteCertificateObject(objectKey: string): Promise<void> {
  if (objectKey.includes('..') || path.isAbsolute(objectKey)) {
    return;
  }
  const absolute = path.resolve(storageRoot(), objectKey);
  const relative = path.relative(storageRoot(), absolute);
  if (relative.startsWith('..') || path.isAbsolute(relative)) return;
  try {
    await unlink(absolute);
  } catch {
    // Object already gone — OK for cleanup idempotency
  }
}
