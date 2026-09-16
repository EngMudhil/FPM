'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getDb } from '../db';
import { AppError, toPublicError } from '../errors';
import { requirePrimaryWorkspaceRole } from '../authz/workspace';
import {
  createCertificate,
  deleteCertificate,
  getCertificateById,
  listCertificates,
  updateCertificateMetadata,
} from '../services/certificates';
import { listWithdrawals } from '../services/withdrawals';
import { idSchema } from '../validation';
import { z } from 'zod';

async function requireCertWorkspace() {
  return requirePrimaryWorkspaceRole('MEMBER');
}

const metaSchema = z.object({
  title: z.string().trim().max(200).optional(),
  issuedAt: z.string().optional(),
  notes: z.string().trim().max(5000).optional(),
});

export async function listCertificatesAction() {
  try {
    const access = await requireCertWorkspace();
    const items = await listCertificates(getDb(), access.workspace.id);
    return { ok: true as const, items };
  } catch (error) {
    return { ok: false as const, error: toPublicError(error) };
  }
}

export async function getCertificateAction(certificateId: string) {
  try {
    const access = await requireCertWorkspace();
    const id = idSchema.parse(certificateId);
    const certificate = await getCertificateById(getDb(), access.workspace.id, id);
    return { ok: true as const, certificate };
  } catch (error) {
    return { ok: false as const, error: toPublicError(error) };
  }
}

export async function listWithdrawalOptionsForCertificateAction() {
  try {
    const access = await requireCertWorkspace();
    const list = await listWithdrawals(getDb(), access.workspace.id, { pageSize: 200 });
    return {
      ok: true as const,
      options: list.items.map((w) => ({
        id: w.id,
        label: `${w.amount} ${w.currency} · ${w.status} · ${w.accountLabel}`,
      })),
    };
  } catch (error) {
    return { ok: false as const, error: toPublicError(error) };
  }
}

export async function createCertificateAction(formData: FormData) {
  try {
    const access = await requireCertWorkspace();
    const withdrawalId = idSchema.parse(String(formData.get('withdrawalId') || ''));
    const file = formData.get('file');
    if (!(file instanceof File)) {
      throw new AppError('VALIDATION', 'Certificate image is required', 400);
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const meta = metaSchema.parse({
      title: formData.get('title') || undefined,
      issuedAt: formData.get('issuedAt') || undefined,
      notes: formData.get('notes') || undefined,
    });
    let issuedAt: Date | null = null;
    if (meta.issuedAt) {
      const value = meta.issuedAt.includes('T') ? meta.issuedAt : `${meta.issuedAt}T12:00:00.000Z`;
      issuedAt = new Date(value);
      if (Number.isNaN(issuedAt.getTime())) {
        throw new AppError('VALIDATION', 'Invalid issued date', 400);
      }
    }

    const certificate = await createCertificate(getDb(), access.workspace.id, {
      withdrawalId,
      title: meta.title,
      issuedAt,
      notes: meta.notes,
      file: {
        buffer,
        originalFilename: file.name || 'certificate',
        declaredMime: file.type || null,
      },
    });
    revalidatePath('/certificates');
    redirect(`/certificates/${certificate.id}`);
  } catch (error) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
    return { ok: false as const, error: toPublicError(error) };
  }
}

export async function updateCertificateAction(certificateId: string, formData: FormData) {
  try {
    const access = await requireCertWorkspace();
    const id = idSchema.parse(certificateId);
    const meta = metaSchema.parse({
      title: formData.get('title') || undefined,
      issuedAt: formData.get('issuedAt') || undefined,
      notes: formData.get('notes') || undefined,
    });
    let issuedAt: Date | null | undefined = undefined;
    if (meta.issuedAt !== undefined) {
      if (!meta.issuedAt) issuedAt = null;
      else {
        const value = meta.issuedAt.includes('T')
          ? meta.issuedAt
          : `${meta.issuedAt}T12:00:00.000Z`;
        issuedAt = new Date(value);
      }
    }
    await updateCertificateMetadata(getDb(), access.workspace.id, id, {
      title: meta.title,
      issuedAt,
      notes: meta.notes,
    });
    revalidatePath('/certificates');
    revalidatePath(`/certificates/${id}`);
    redirect(`/certificates/${id}`);
  } catch (error) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
    return { ok: false as const, error: toPublicError(error) };
  }
}

export async function deleteCertificateAction(certificateId: string) {
  try {
    const access = await requireCertWorkspace();
    const id = idSchema.parse(certificateId);
    await deleteCertificate(getDb(), access.workspace.id, id);
    revalidatePath('/certificates');
    redirect('/certificates');
  } catch (error) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
    return { ok: false as const, error: toPublicError(error) };
  }
}
