import { createId, workspaceMembers, workspaces, type WorkspaceRole } from '@fpm/db';
import { and, eq } from 'drizzle-orm';
import { cache } from 'react';
import { getDb } from '../db';
import { AppError } from '../errors';
import { requireAuthenticatedUser } from '../auth/session';

const roleRank: Record<WorkspaceRole, number> = {
  VIEWER: 1,
  MEMBER: 2,
  ADMIN: 3,
  OWNER: 4,
};

export async function requireWorkspaceAccess(workspaceId: string) {
  const user = await requireAuthenticatedUser();
  const db = getDb();
  const rows = await db
    .select({
      membership: workspaceMembers,
      workspace: workspaces,
    })
    .from(workspaceMembers)
    .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
    .where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, user.id)))
    .limit(1);

  const row = rows[0];
  if (!row) {
    throw new AppError('FORBIDDEN', 'Workspace access denied', 403);
  }

  return {
    user,
    workspace: row.workspace,
    role: row.membership.role,
    membershipId: row.membership.id,
  };
}

export async function requireWorkspaceRole(workspaceId: string, minimumRole: WorkspaceRole) {
  const access = await requireWorkspaceAccess(workspaceId);
  if (roleRank[access.role] < roleRank[minimumRole]) {
    throw new AppError('FORBIDDEN', 'Insufficient workspace role', 403);
  }
  return access;
}

/** Resolves the caller's primary owned/member workspace (single-operator default). Deduped per RSC request. */
export const requirePrimaryWorkspace = cache(async () => {
  const user = await requireAuthenticatedUser();
  const db = getDb();
  const rows = await db
    .select({
      membership: workspaceMembers,
      workspace: workspaces,
    })
    .from(workspaceMembers)
    .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
    .where(eq(workspaceMembers.userId, user.id))
    .limit(1);

  const row = rows[0];
  if (!row) {
    throw new AppError('FORBIDDEN', 'No workspace membership', 403);
  }
  return {
    user,
    workspace: row.workspace,
    role: row.membership.role,
  };
});

export async function createOwnedWorkspace(input: {
  userId: string;
  name: string;
  timezone?: string;
  defaultCurrency?: string;
}) {
  const db = getDb();
  const workspaceId = createId();
  const membershipId = createId();
  await db.transaction(async (tx) => {
    await tx.insert(workspaces).values({
      id: workspaceId,
      name: input.name,
      timezone: input.timezone ?? 'UTC',
      defaultCurrency: input.defaultCurrency ?? 'USD',
    });
    await tx.insert(workspaceMembers).values({
      id: membershipId,
      workspaceId,
      userId: input.userId,
      role: 'OWNER',
    });
  });
  return workspaceId;
}
