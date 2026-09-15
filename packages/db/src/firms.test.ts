import {
  createId,
  createDb,
  closeDb,
  firms,
  runMigrations,
  withTransaction,
  workspaces,
  workspaceMembers,
  users,
} from './index';
import bcrypt from 'bcryptjs';
import { and, eq } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const databaseUrl = process.env.DATABASE_URL;

describe.runIf(Boolean(databaseUrl))('firms foundation', () => {
  const db = createDb(databaseUrl!);
  let workspaceId = '';

  beforeAll(async () => {
    await runMigrations(databaseUrl!);
    const userId = createId();
    workspaceId = createId();
    const passwordHash = await bcrypt.hash('Password123!', 12);
    await withTransaction(db, async (tx) => {
      await tx.insert(users).values({
        id: userId,
        email: `firms-${userId}@example.com`,
        passwordHash,
      });
      await tx.insert(workspaces).values({
        id: workspaceId,
        name: 'Firms Test WS',
      });
      await tx.insert(workspaceMembers).values({
        id: createId(),
        workspaceId,
        userId,
        role: 'OWNER',
      });
    });
  });

  afterAll(async () => {
    await closeDb(db);
  });

  it('creates a firm scoped to a workspace', async () => {
    const id = createId();
    await db.insert(firms).values({
      id,
      workspaceId,
      name: 'FTMO',
      website: 'https://ftmo.com',
    });
    const rows = await db
      .select()
      .from(firms)
      .where(and(eq(firms.id, id), eq(firms.workspaceId, workspaceId)));
    expect(rows).toHaveLength(1);
    expect(rows[0]?.name).toBe('FTMO');
  });

  it('archives without deleting the row', async () => {
    const id = createId();
    await db.insert(firms).values({ id, workspaceId, name: 'Archive Me' });
    await db.update(firms).set({ archivedAt: new Date() }).where(eq(firms.id, id));
    const rows = await db.select().from(firms).where(eq(firms.id, id));
    expect(rows[0]?.archivedAt).toBeTruthy();
  });
});
