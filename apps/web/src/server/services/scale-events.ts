import { and, count, desc, eq, type SQL } from 'drizzle-orm';
import {
  createId,
  firms,
  scaleEvents,
  tradingAccounts,
  withTransaction,
  type Database,
  type ScaleEvent,
} from '@fpm/db';
import { assertScaleSizes, resolveCurrentSizeFromScaleEvents } from '@fpm/financial';
import { AppError } from '../errors';
import { accountDisplayName } from './accounts';

export type ScaleEventInput = {
  tradingAccountId: string;
  fromSize: string;
  toSize: string;
  scaledAt: Date;
  notes?: string | null;
};

export type ScaleEventWithAccount = ScaleEvent & {
  accountLabel: string;
  firmName: string;
  accountNumber: string | null;
  currency: string;
};

type DbOrTx = Parameters<Parameters<typeof withTransaction>[1]>[0] | Database;

function mapJoined(row: {
  scaleEvent: ScaleEvent;
  firmName: string;
  accountLabel: string | null;
  accountNumber: string | null;
  currency: string;
}): ScaleEventWithAccount {
  return {
    ...row.scaleEvent,
    firmName: row.firmName,
    accountNumber: row.accountNumber,
    currency: row.currency,
    accountLabel: accountDisplayName({
      label: row.accountLabel,
      accountNumber: row.accountNumber,
      firmName: row.firmName,
    }),
  };
}

async function resyncAccountCurrentSize(
  tx: DbOrTx,
  workspaceId: string,
  tradingAccountId: string,
): Promise<void> {
  const accountRows = await tx
    .select()
    .from(tradingAccounts)
    .where(
      and(eq(tradingAccounts.id, tradingAccountId), eq(tradingAccounts.workspaceId, workspaceId)),
    )
    .limit(1);
  const account = accountRows[0];
  if (!account) throw new AppError('NOT_FOUND', 'Trading account not found', 404);

  const events = await tx
    .select({
      id: scaleEvents.id,
      toSize: scaleEvents.toSize,
      scaledAt: scaleEvents.scaledAt,
    })
    .from(scaleEvents)
    .where(
      and(
        eq(scaleEvents.tradingAccountId, tradingAccountId),
        eq(scaleEvents.workspaceId, workspaceId),
      ),
    );

  const currentSize = resolveCurrentSizeFromScaleEvents(events, account.initialSize);
  await tx
    .update(tradingAccounts)
    .set({ currentSize, updatedAt: new Date() })
    .where(
      and(eq(tradingAccounts.id, tradingAccountId), eq(tradingAccounts.workspaceId, workspaceId)),
    );
}

export async function listScaleEvents(
  db: Database,
  workspaceId: string,
  opts?: { tradingAccountId?: string; firmId?: string; page?: number; pageSize?: number },
) {
  const page = opts?.page ?? 1;
  const pageSize = opts?.pageSize ?? 50;
  const filters: SQL[] = [eq(scaleEvents.workspaceId, workspaceId)];
  if (opts?.tradingAccountId) {
    filters.push(eq(scaleEvents.tradingAccountId, opts.tradingAccountId));
  }
  if (opts?.firmId) {
    filters.push(eq(tradingAccounts.firmId, opts.firmId));
  }
  const where = and(...filters);

  const [rows, totalRows] = await Promise.all([
    db
      .select({
        scaleEvent: scaleEvents,
        firmName: firms.name,
        accountLabel: tradingAccounts.label,
        accountNumber: tradingAccounts.accountNumber,
        currency: tradingAccounts.currency,
      })
      .from(scaleEvents)
      .innerJoin(tradingAccounts, eq(scaleEvents.tradingAccountId, tradingAccounts.id))
      .innerJoin(firms, eq(tradingAccounts.firmId, firms.id))
      .where(where)
      .orderBy(desc(scaleEvents.scaledAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db
      .select({ value: count() })
      .from(scaleEvents)
      .innerJoin(tradingAccounts, eq(scaleEvents.tradingAccountId, tradingAccounts.id))
      .where(where),
  ]);

  return {
    items: rows.map(mapJoined),
    total: totalRows[0]?.value ?? 0,
    page,
    pageSize,
  };
}

export async function getScaleEventById(
  db: Database,
  workspaceId: string,
  scaleEventId: string,
): Promise<ScaleEventWithAccount> {
  const rows = await db
    .select({
      scaleEvent: scaleEvents,
      firmName: firms.name,
      accountLabel: tradingAccounts.label,
      accountNumber: tradingAccounts.accountNumber,
      currency: tradingAccounts.currency,
    })
    .from(scaleEvents)
    .innerJoin(tradingAccounts, eq(scaleEvents.tradingAccountId, tradingAccounts.id))
    .innerJoin(firms, eq(tradingAccounts.firmId, firms.id))
    .where(and(eq(scaleEvents.id, scaleEventId), eq(scaleEvents.workspaceId, workspaceId)))
    .limit(1);
  const row = rows[0];
  if (!row) throw new AppError('NOT_FOUND', 'Scale event not found', 404);
  return mapJoined(row);
}

export async function createScaleEvent(
  db: Database,
  workspaceId: string,
  input: ScaleEventInput,
): Promise<ScaleEventWithAccount> {
  const account = await db
    .select()
    .from(tradingAccounts)
    .where(
      and(
        eq(tradingAccounts.id, input.tradingAccountId),
        eq(tradingAccounts.workspaceId, workspaceId),
      ),
    )
    .limit(1);
  if (!account[0]) throw new AppError('VALIDATION', 'Trading account not found', 400);

  try {
    assertScaleSizes({
      fromSize: input.fromSize,
      toSize: input.toSize,
      currency: account[0].currency,
    });
  } catch (error) {
    throw new AppError(
      'BUSINESS_RULE',
      error instanceof Error ? error.message : 'Invalid scale sizes',
      400,
    );
  }

  const id = createId();
  await withTransaction(db, async (tx) => {
    await tx.insert(scaleEvents).values({
      id,
      workspaceId,
      tradingAccountId: input.tradingAccountId,
      fromSize: input.fromSize.trim(),
      toSize: input.toSize.trim(),
      scaledAt: input.scaledAt,
      notes: input.notes?.trim() || null,
    });
    await resyncAccountCurrentSize(tx, workspaceId, input.tradingAccountId);
  });

  return getScaleEventById(db, workspaceId, id);
}

export async function updateScaleEvent(
  db: Database,
  workspaceId: string,
  scaleEventId: string,
  input: {
    fromSize: string;
    toSize: string;
    scaledAt: Date;
    notes?: string | null;
  },
): Promise<ScaleEventWithAccount> {
  const current = await getScaleEventById(db, workspaceId, scaleEventId);

  try {
    assertScaleSizes({
      fromSize: input.fromSize,
      toSize: input.toSize,
      currency: current.currency,
    });
  } catch (error) {
    throw new AppError(
      'BUSINESS_RULE',
      error instanceof Error ? error.message : 'Invalid scale sizes',
      400,
    );
  }

  await withTransaction(db, async (tx) => {
    await tx
      .update(scaleEvents)
      .set({
        fromSize: input.fromSize.trim(),
        toSize: input.toSize.trim(),
        scaledAt: input.scaledAt,
        notes: input.notes === undefined ? current.notes : input.notes?.trim() || null,
        updatedAt: new Date(),
      })
      .where(and(eq(scaleEvents.id, scaleEventId), eq(scaleEvents.workspaceId, workspaceId)));
    await resyncAccountCurrentSize(tx, workspaceId, current.tradingAccountId);
  });

  return getScaleEventById(db, workspaceId, scaleEventId);
}

export async function deleteScaleEvent(
  db: Database,
  workspaceId: string,
  scaleEventId: string,
): Promise<void> {
  const current = await getScaleEventById(db, workspaceId, scaleEventId);
  await withTransaction(db, async (tx) => {
    await tx
      .delete(scaleEvents)
      .where(and(eq(scaleEvents.id, scaleEventId), eq(scaleEvents.workspaceId, workspaceId)));
    await resyncAccountCurrentSize(tx, workspaceId, current.tradingAccountId);
  });
}
