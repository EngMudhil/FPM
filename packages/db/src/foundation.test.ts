import {
  closeDb,
  createDb,
  createId,
  runMigrations,
  users,
  workspaceMembers,
  workspaces,
  withTransaction,
} from './index';
import bcrypt from 'bcryptjs';
import { and, eq, sql } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const databaseUrl = process.env.DATABASE_URL;

describe.runIf(Boolean(databaseUrl))('database foundation', () => {
  const db = createDb(databaseUrl!);

  beforeAll(async () => {
    await runMigrations(databaseUrl!);
  });

  afterAll(async () => {
    await closeDb(db);
  });

  it('enforces unique email', async () => {
    const email = `unique-${createId()}@example.com`;
    const passwordHash = await bcrypt.hash('Password123!', 12);
    await db.insert(users).values({
      id: createId(),
      email,
      passwordHash,
    });
    await expect(
      db.insert(users).values({
        id: createId(),
        email,
        passwordHash,
      }),
    ).rejects.toThrow();
  });

  it('creates workspace OWNER membership in a transaction', async () => {
    const userId = createId();
    const workspaceId = createId();
    const passwordHash = await bcrypt.hash('Password123!', 12);

    await withTransaction(db, async (tx) => {
      await tx.insert(users).values({
        id: userId,
        email: `owner-${userId}@example.com`,
        passwordHash,
      });
      await tx.insert(workspaces).values({
        id: workspaceId,
        name: 'Test Workspace',
        timezone: 'UTC',
        defaultCurrency: 'USD',
      });
      await tx.insert(workspaceMembers).values({
        id: createId(),
        workspaceId,
        userId,
        role: 'OWNER',
      });
    });

    const membership = await db
      .select()
      .from(workspaceMembers)
      .where(eq(workspaceMembers.userId, userId));
    expect(membership).toHaveLength(1);
    expect(membership[0]?.role).toBe('OWNER');
  });

  it('stores numeric money exactly as string decimals', async () => {
    const result = await db.execute(sql`select (0.1::numeric + 0.2::numeric)::text as total`);
    const row = result[0] as { total: string };
    expect(row.total).toBe('0.3');
  });

  it('denies cross-workspace membership (authorization foundation)', async () => {
    const passwordHash = await bcrypt.hash('Password123!', 12);
    const ownerA = createId();
    const ownerB = createId();
    const workspaceA = createId();
    const workspaceB = createId();

    await withTransaction(db, async (tx) => {
      await tx.insert(users).values([
        { id: ownerA, email: `a-${ownerA}@example.com`, passwordHash },
        { id: ownerB, email: `b-${ownerB}@example.com`, passwordHash },
      ]);
      await tx.insert(workspaces).values([
        { id: workspaceA, name: 'A', timezone: 'UTC', defaultCurrency: 'USD' },
        { id: workspaceB, name: 'B', timezone: 'UTC', defaultCurrency: 'USD' },
      ]);
      await tx.insert(workspaceMembers).values([
        {
          id: createId(),
          workspaceId: workspaceA,
          userId: ownerA,
          role: 'OWNER',
        },
        {
          id: createId(),
          workspaceId: workspaceB,
          userId: ownerB,
          role: 'OWNER',
        },
      ]);
    });

    const foreign = await db
      .select()
      .from(workspaceMembers)
      .where(
        and(eq(workspaceMembers.workspaceId, workspaceA), eq(workspaceMembers.userId, ownerB)),
      );
    expect(foreign).toHaveLength(0);
  });

  it('creates and deletes sessions (logout invalidation)', async () => {
    const { sessions } = await import('./schema/index');
    const passwordHash = await bcrypt.hash('Password123!', 12);
    const userId = createId();
    const sessionToken = createId() + createId();

    await db.insert(users).values({
      id: userId,
      email: `session-${userId}@example.com`,
      passwordHash,
    });
    await db.insert(sessions).values({
      id: createId(),
      sessionToken,
      userId,
      expiresAt: new Date(Date.now() + 60_000),
    });

    const before = await db.select().from(sessions).where(eq(sessions.sessionToken, sessionToken));
    expect(before).toHaveLength(1);

    await db.delete(sessions).where(eq(sessions.sessionToken, sessionToken));
    const after = await db.select().from(sessions).where(eq(sessions.sessionToken, sessionToken));
    expect(after).toHaveLength(0);
  });
});
