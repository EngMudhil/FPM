import { and, count, desc, eq, type SQL } from 'drizzle-orm';
import { auditLogs, createId, type Database } from '@fpm/db';

export type AuditWriteInput = {
  workspaceId: string;
  actorUserId?: string | null;
  action: string;
  module: string;
  recordType?: string | null;
  recordId?: string | null;
  oldValue?: unknown;
  newValue?: unknown;
  metadata?: unknown;
  ipAddress?: string | null;
  userAgent?: string | null;
};

/** Append-only insert. Callers must never update/delete audit rows. */
export async function writeAuditLog(db: Database, input: AuditWriteInput): Promise<string> {
  const id = createId();
  await db.insert(auditLogs).values({
    id,
    workspaceId: input.workspaceId,
    actorUserId: input.actorUserId ?? null,
    action: input.action,
    module: input.module,
    recordType: input.recordType ?? null,
    recordId: input.recordId ?? null,
    oldValue: (input.oldValue as Record<string, unknown> | null) ?? null,
    newValue: (input.newValue as Record<string, unknown> | null) ?? null,
    metadata: (input.metadata as Record<string, unknown> | null) ?? null,
    ipAddress: input.ipAddress ?? null,
    userAgent: input.userAgent ?? null,
  });
  return id;
}

export async function listAuditLogs(
  db: Database,
  workspaceId: string,
  opts?: { module?: string; action?: string; page?: number; pageSize?: number },
) {
  const page = opts?.page ?? 1;
  const pageSize = opts?.pageSize ?? 50;
  const filters: SQL[] = [eq(auditLogs.workspaceId, workspaceId)];
  if (opts?.module) filters.push(eq(auditLogs.module, opts.module));
  if (opts?.action) filters.push(eq(auditLogs.action, opts.action));
  const where = and(...filters);

  const [rows, totalRows] = await Promise.all([
    db
      .select()
      .from(auditLogs)
      .where(where)
      .orderBy(desc(auditLogs.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ value: count() }).from(auditLogs).where(where),
  ]);

  return {
    items: rows,
    total: totalRows[0]?.value ?? 0,
    page,
    pageSize,
  };
}
