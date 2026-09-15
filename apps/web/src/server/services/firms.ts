import { and, asc, count, desc, eq, ilike, isNull, type SQL } from 'drizzle-orm';
import { createId, firms, tradingAccounts, type Database, type Firm } from '@fpm/db';
import { AppError } from '../errors';

export type FirmListQuery = {
  workspaceId: string;
  search?: string;
  page?: number;
  pageSize?: number;
  includeArchived?: boolean;
  sort?: 'createdAt' | 'name';
  sortDir?: 'asc' | 'desc';
};

export type FirmInput = {
  name: string;
  website?: string | null;
  notes?: string | null;
};

function normalizeWebsite(website?: string | null): string | null {
  if (!website) return null;
  const trimmed = website.trim();
  return trimmed.length === 0 ? null : trimmed;
}

export async function listFirms(db: Database, query: FirmListQuery) {
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 20;
  const offset = (page - 1) * pageSize;

  const filters: SQL[] = [eq(firms.workspaceId, query.workspaceId)];
  if (!query.includeArchived) {
    filters.push(isNull(firms.archivedAt));
  }
  if (query.search?.trim()) {
    filters.push(ilike(firms.name, `%${query.search.trim()}%`));
  }

  const where = and(...filters);
  const sortCol = query.sort === 'name' ? firms.name : firms.createdAt;
  const order = query.sortDir === 'asc' ? asc(sortCol) : desc(sortCol);

  const [rows, totalRows] = await Promise.all([
    db.select().from(firms).where(where).orderBy(order).limit(pageSize).offset(offset),
    db.select({ value: count() }).from(firms).where(where),
  ]);

  return {
    items: rows,
    total: totalRows[0]?.value ?? 0,
    page,
    pageSize,
  };
}

export async function getFirmById(
  db: Database,
  workspaceId: string,
  firmId: string,
): Promise<Firm> {
  const rows = await db
    .select()
    .from(firms)
    .where(and(eq(firms.id, firmId), eq(firms.workspaceId, workspaceId)))
    .limit(1);
  const firm = rows[0];
  if (!firm) {
    throw new AppError('NOT_FOUND', 'Firm not found', 404);
  }
  return firm;
}

export async function createFirm(
  db: Database,
  workspaceId: string,
  input: FirmInput,
): Promise<Firm> {
  const id = createId();
  await db.insert(firms).values({
    id,
    workspaceId,
    name: input.name.trim(),
    website: normalizeWebsite(input.website),
    notes: input.notes?.trim() || null,
  });
  return getFirmById(db, workspaceId, id);
}

export async function updateFirm(
  db: Database,
  workspaceId: string,
  firmId: string,
  input: FirmInput,
): Promise<Firm> {
  await getFirmById(db, workspaceId, firmId);
  await db
    .update(firms)
    .set({
      name: input.name.trim(),
      website: normalizeWebsite(input.website),
      notes: input.notes?.trim() || null,
      updatedAt: new Date(),
    })
    .where(and(eq(firms.id, firmId), eq(firms.workspaceId, workspaceId)));
  return getFirmById(db, workspaceId, firmId);
}

export async function archiveFirm(
  db: Database,
  workspaceId: string,
  firmId: string,
): Promise<Firm> {
  const firm = await getFirmById(db, workspaceId, firmId);
  if (firm.archivedAt) {
    return firm;
  }
  await db
    .update(firms)
    .set({ archivedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(firms.id, firmId), eq(firms.workspaceId, workspaceId)));
  return getFirmById(db, workspaceId, firmId);
}

/** Hard delete blocked when funded accounts exist (protect history). Prefer archive. */
export async function deleteFirm(db: Database, workspaceId: string, firmId: string): Promise<void> {
  await getFirmById(db, workspaceId, firmId);
  const children = await db
    .select({ value: count() })
    .from(tradingAccounts)
    .where(and(eq(tradingAccounts.firmId, firmId), eq(tradingAccounts.workspaceId, workspaceId)));
  if ((children[0]?.value ?? 0) > 0) {
    throw new AppError(
      'CONFLICT',
      'Cannot delete firm while funded accounts exist. Archive the firm instead.',
      409,
    );
  }
  await db.delete(firms).where(and(eq(firms.id, firmId), eq(firms.workspaceId, workspaceId)));
}
