import { and, asc, count, desc, eq, ilike, isNull, or, type SQL } from 'drizzle-orm';
import {
  createId,
  firms,
  tradingAccounts,
  type AccountPhase,
  type Database,
  type TradingAccount,
} from '@fpm/db';
import { currencyCodeSchema } from '@fpm/money';
import { AppError } from '../errors';

export type AccountListQuery = {
  workspaceId: string;
  search?: string;
  firmId?: string;
  phase?: AccountPhase;
  page?: number;
  pageSize?: number;
  includeArchived?: boolean;
};

export type AccountInput = {
  firmId: string;
  accountNumber?: string | null;
  label?: string | null;
  phase: AccountPhase;
  initialSize: string;
  currentSize?: string;
  currency: string;
  platform?: string | null;
  startDate?: string | null;
  notes?: string | null;
};

export type AccountWithFirm = TradingAccount & { firmName: string };

function emptyToNull(value?: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

export function accountDisplayName(account: {
  label?: string | null;
  accountNumber?: string | null;
  firmName?: string;
}): string {
  if (account.label?.trim()) return account.label.trim();
  if (account.accountNumber?.trim() && account.firmName) {
    return `${account.firmName} · ${account.accountNumber.trim()}`;
  }
  if (account.accountNumber?.trim()) return account.accountNumber.trim();
  if (account.firmName) return `${account.firmName} account`;
  return 'Funded account';
}

export async function listAccounts(db: Database, query: AccountListQuery) {
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 20;
  const offset = (page - 1) * pageSize;
  const filters: SQL[] = [eq(tradingAccounts.workspaceId, query.workspaceId)];
  if (!query.includeArchived) filters.push(isNull(tradingAccounts.archivedAt));
  if (query.firmId) filters.push(eq(tradingAccounts.firmId, query.firmId));
  if (query.phase) filters.push(eq(tradingAccounts.phase, query.phase));
  if (query.search?.trim()) {
    const term = `%${query.search.trim()}%`;
    filters.push(
      or(
        ilike(tradingAccounts.accountNumber, term),
        ilike(tradingAccounts.label, term),
        ilike(firms.name, term),
      )!,
    );
  }

  const where = and(...filters);
  const [rows, totalRows] = await Promise.all([
    db
      .select({
        account: tradingAccounts,
        firmName: firms.name,
      })
      .from(tradingAccounts)
      .innerJoin(firms, eq(tradingAccounts.firmId, firms.id))
      .where(where)
      .orderBy(desc(tradingAccounts.createdAt))
      .limit(pageSize)
      .offset(offset),
    db
      .select({ value: count() })
      .from(tradingAccounts)
      .innerJoin(firms, eq(tradingAccounts.firmId, firms.id))
      .where(where),
  ]);

  return {
    items: rows.map((row) => ({ ...row.account, firmName: row.firmName })),
    total: totalRows[0]?.value ?? 0,
    page,
    pageSize,
  };
}

export async function getAccountById(
  db: Database,
  workspaceId: string,
  accountId: string,
): Promise<AccountWithFirm> {
  const rows = await db
    .select({ account: tradingAccounts, firmName: firms.name })
    .from(tradingAccounts)
    .innerJoin(firms, eq(tradingAccounts.firmId, firms.id))
    .where(and(eq(tradingAccounts.id, accountId), eq(tradingAccounts.workspaceId, workspaceId)))
    .limit(1);
  const row = rows[0];
  if (!row) throw new AppError('NOT_FOUND', 'Account not found', 404);
  return { ...row.account, firmName: row.firmName };
}

export async function createAccount(
  db: Database,
  workspaceId: string,
  input: AccountInput,
): Promise<AccountWithFirm> {
  const firmRows = await db
    .select()
    .from(firms)
    .where(and(eq(firms.id, input.firmId), eq(firms.workspaceId, workspaceId)))
    .limit(1);
  if (!firmRows[0]) throw new AppError('VALIDATION', 'Firm not found in workspace', 400);

  const currency = currencyCodeSchema.parse(input.currency);
  const initialSize = input.initialSize.trim();
  const currentSize = (input.currentSize ?? input.initialSize).trim();
  const id = createId();

  await db.insert(tradingAccounts).values({
    id,
    workspaceId,
    firmId: input.firmId,
    accountNumber: emptyToNull(input.accountNumber),
    label: emptyToNull(input.label),
    phase: input.phase,
    initialSize,
    currentSize,
    currency,
    platform: emptyToNull(input.platform),
    startDate: emptyToNull(input.startDate),
    notes: emptyToNull(input.notes),
  });

  return getAccountById(db, workspaceId, id);
}

export async function updateAccount(
  db: Database,
  workspaceId: string,
  accountId: string,
  input: AccountInput,
): Promise<AccountWithFirm> {
  await getAccountById(db, workspaceId, accountId);
  const firmRows = await db
    .select()
    .from(firms)
    .where(and(eq(firms.id, input.firmId), eq(firms.workspaceId, workspaceId)))
    .limit(1);
  if (!firmRows[0]) throw new AppError('VALIDATION', 'Firm not found in workspace', 400);

  const currency = currencyCodeSchema.parse(input.currency);
  await db
    .update(tradingAccounts)
    .set({
      firmId: input.firmId,
      accountNumber: emptyToNull(input.accountNumber),
      label: emptyToNull(input.label),
      phase: input.phase,
      initialSize: input.initialSize.trim(),
      currentSize: (input.currentSize ?? input.initialSize).trim(),
      currency,
      platform: emptyToNull(input.platform),
      startDate: emptyToNull(input.startDate),
      notes: emptyToNull(input.notes),
      updatedAt: new Date(),
    })
    .where(and(eq(tradingAccounts.id, accountId), eq(tradingAccounts.workspaceId, workspaceId)));

  return getAccountById(db, workspaceId, accountId);
}

export async function archiveAccount(db: Database, workspaceId: string, accountId: string) {
  const account = await getAccountById(db, workspaceId, accountId);
  if (account.archivedAt) return account;
  await db
    .update(tradingAccounts)
    .set({ archivedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(tradingAccounts.id, accountId), eq(tradingAccounts.workspaceId, workspaceId)));
  return getAccountById(db, workspaceId, accountId);
}

export async function listFirmOptions(db: Database, workspaceId: string) {
  return db
    .select({ id: firms.id, name: firms.name })
    .from(firms)
    .where(and(eq(firms.workspaceId, workspaceId), isNull(firms.archivedAt)))
    .orderBy(asc(firms.name));
}
