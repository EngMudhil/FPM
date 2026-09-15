import { NextResponse } from 'next/server';
import { getDb } from '@/server/db';
import { toPublicError } from '@/server/errors';
import { requirePrimaryWorkspace, requireWorkspaceRole } from '@/server/authz/workspace';
import { readBackupFile } from '@/server/services/backup';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const access = await requirePrimaryWorkspace();
    await requireWorkspaceRole(access.workspace.id, 'ADMIN');
    const { filename, buffer } = await readBackupFile(getDb(), access.workspace.id, id);
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    const publicError = toPublicError(error);
    return NextResponse.json({ ok: false, error: publicError }, { status: publicError.status });
  }
}
