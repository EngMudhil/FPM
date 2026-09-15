import { NextResponse } from 'next/server';
import { getCertificateById } from '@/server/services/certificates';
import { readCertificateObject } from '@/server/storage/certificates';
import { requirePrimaryWorkspace, requireWorkspaceRole } from '@/server/authz/workspace';
import { getDb } from '@/server/db';
import { idSchema } from '@/server/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await context.params;
    const id = idSchema.parse(rawId);
    const access = await requirePrimaryWorkspace();
    await requireWorkspaceRole(access.workspace.id, 'VIEWER');
    const certificate = await getCertificateById(getDb(), access.workspace.id, id);
    const bytes = await readCertificateObject(certificate.objectKey);
    return new NextResponse(new Uint8Array(bytes), {
      status: 200,
      headers: {
        'Content-Type': certificate.mimeType,
        'Content-Length': String(bytes.byteLength),
        'Content-Disposition': `inline; filename="${certificate.originalFilename.replace(/"/g, '')}"`,
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
