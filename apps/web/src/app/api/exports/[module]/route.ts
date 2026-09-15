import { NextResponse } from 'next/server';
import { getDb } from '@/server/db';
import { AppError, toPublicError } from '@/server/errors';
import { requirePrimaryWorkspace, requireWorkspaceRole } from '@/server/authz/workspace';
import { buildModuleExport, isExportModule } from '@/server/export/modules';

export async function GET(_request: Request, context: { params: Promise<{ module: string }> }) {
  try {
    const { module: moduleParam } = await context.params;
    if (!isExportModule(moduleParam)) {
      throw new AppError('NOT_FOUND', 'Unknown export module', 404);
    }
    const access = await requirePrimaryWorkspace();
    await requireWorkspaceRole(access.workspace.id, 'MEMBER');
    const { filename, buffer } = await buildModuleExport(getDb(), access.workspace.id, moduleParam);
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    const publicError = toPublicError(error);
    return NextResponse.json({ ok: false, error: publicError }, { status: publicError.status });
  }
}
