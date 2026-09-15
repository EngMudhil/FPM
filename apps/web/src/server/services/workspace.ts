import { and, count, desc, eq } from 'drizzle-orm';
import {
  createId,
  loginEvents,
  users,
  workspaceMembers,
  workspaces,
  type Database,
  type WorkspaceRole,
} from '@fpm/db';
import { AppError } from '../errors';
import { hashPassword, verifyPassword } from '../auth/password';

/** Pure guard used by role/remove mutations (ADR-015). */
export function assertLastOwnerSafe(input: {
  currentRole: WorkspaceRole;
  nextRole?: WorkspaceRole | null;
  ownerCount: number;
}): void {
  const demotingOwner =
    input.currentRole === 'OWNER' && (input.nextRole == null || input.nextRole !== 'OWNER');
  if (demotingOwner && input.ownerCount <= 1) {
    throw new AppError('VALIDATION', 'Cannot remove or demote the last OWNER', 400);
  }
}

export async function getWorkspaceById(db: Database, workspaceId: string) {
  const rows = await db.select().from(workspaces).where(eq(workspaces.id, workspaceId)).limit(1);
  const row = rows[0];
  if (!row) throw new AppError('NOT_FOUND', 'Workspace not found', 404);
  return row;
}

export async function updateWorkspaceSettings(
  db: Database,
  workspaceId: string,
  input: { name: string; timezone: string; defaultCurrency: string },
) {
  await getWorkspaceById(db, workspaceId);
  await db
    .update(workspaces)
    .set({
      name: input.name,
      timezone: input.timezone,
      defaultCurrency: input.defaultCurrency,
      updatedAt: new Date(),
    })
    .where(eq(workspaces.id, workspaceId));
  return getWorkspaceById(db, workspaceId);
}

export async function listWorkspaceMembers(db: Database, workspaceId: string) {
  const rows = await db
    .select({
      membershipId: workspaceMembers.id,
      role: workspaceMembers.role,
      createdAt: workspaceMembers.createdAt,
      userId: users.id,
      email: users.email,
      name: users.name,
    })
    .from(workspaceMembers)
    .innerJoin(users, eq(workspaceMembers.userId, users.id))
    .where(eq(workspaceMembers.workspaceId, workspaceId))
    .orderBy(desc(workspaceMembers.createdAt));

  return rows;
}

async function countOwners(db: Database, workspaceId: string): Promise<number> {
  const rows = await db
    .select({ value: count() })
    .from(workspaceMembers)
    .where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.role, 'OWNER')));
  return rows[0]?.value ?? 0;
}

export async function inviteWorkspaceMember(
  db: Database,
  workspaceId: string,
  input: { email: string; name?: string; password: string; role: WorkspaceRole },
) {
  const email = input.email.trim().toLowerCase();
  const existingUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
  let userId = existingUsers[0]?.id;

  if (userId) {
    const existingMembership = await db
      .select()
      .from(workspaceMembers)
      .where(
        and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, userId)),
      )
      .limit(1);
    if (existingMembership[0]) {
      throw new AppError('CONFLICT', 'User is already a workspace member', 409);
    }
  } else {
    userId = createId();
    await db.insert(users).values({
      id: userId,
      email,
      name: input.name ?? null,
      passwordHash: await hashPassword(input.password),
    });
  }

  const membershipId = createId();
  await db.insert(workspaceMembers).values({
    id: membershipId,
    workspaceId,
    userId,
    role: input.role,
  });

  return {
    membershipId,
    userId,
    email,
    role: input.role,
  };
}

export async function updateMemberRole(
  db: Database,
  workspaceId: string,
  membershipId: string,
  nextRole: WorkspaceRole,
) {
  const rows = await db
    .select()
    .from(workspaceMembers)
    .where(
      and(eq(workspaceMembers.id, membershipId), eq(workspaceMembers.workspaceId, workspaceId)),
    )
    .limit(1);
  const membership = rows[0];
  if (!membership) throw new AppError('NOT_FOUND', 'Membership not found', 404);

  const owners = await countOwners(db, workspaceId);
  assertLastOwnerSafe({
    currentRole: membership.role,
    nextRole,
    ownerCount: owners,
  });

  await db
    .update(workspaceMembers)
    .set({ role: nextRole })
    .where(eq(workspaceMembers.id, membershipId));

  return { membershipId, role: nextRole, userId: membership.userId };
}

export async function removeWorkspaceMember(
  db: Database,
  workspaceId: string,
  membershipId: string,
) {
  const rows = await db
    .select()
    .from(workspaceMembers)
    .where(
      and(eq(workspaceMembers.id, membershipId), eq(workspaceMembers.workspaceId, workspaceId)),
    )
    .limit(1);
  const membership = rows[0];
  if (!membership) throw new AppError('NOT_FOUND', 'Membership not found', 404);

  const owners = await countOwners(db, workspaceId);
  assertLastOwnerSafe({
    currentRole: membership.role,
    nextRole: null,
    ownerCount: owners,
  });

  await db.delete(workspaceMembers).where(eq(workspaceMembers.id, membershipId));
  return { membershipId, userId: membership.userId };
}

export async function updateUserProfile(
  db: Database,
  userId: string,
  input: { name: string | null },
) {
  await db
    .update(users)
    .set({ name: input.name, updatedAt: new Date() })
    .where(eq(users.id, userId));
  const rows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return rows[0]!;
}

export async function changeUserPassword(
  db: Database,
  userId: string,
  input: { currentPassword: string; newPassword: string },
) {
  const rows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const user = rows[0];
  if (!user) throw new AppError('NOT_FOUND', 'User not found', 404);
  const ok = await verifyPassword(input.currentPassword, user.passwordHash);
  if (!ok) throw new AppError('VALIDATION', 'Current password is incorrect', 400);
  await db
    .update(users)
    .set({ passwordHash: await hashPassword(input.newPassword), updatedAt: new Date() })
    .where(eq(users.id, userId));
}

export async function listRecentLoginEvents(db: Database, userId: string, limit = 20) {
  return db
    .select({
      id: loginEvents.id,
      type: loginEvents.type,
      ipAddress: loginEvents.ipAddress,
      userAgent: loginEvents.userAgent,
      createdAt: loginEvents.createdAt,
    })
    .from(loginEvents)
    .where(eq(loginEvents.userId, userId))
    .orderBy(desc(loginEvents.createdAt))
    .limit(limit);
}
