'use server';

import { revalidatePath } from 'next/cache';
import { getDb } from '../db';
import { AppError, toPublicError } from '../errors';
import { requirePrimaryWorkspace, requirePrimaryWorkspaceRole } from '../authz/workspace';
import { writeAuditLog } from '../services/audit';
import {
  changeUserPassword,
  getWorkspaceById,
  inviteWorkspaceMember,
  listRecentLoginEvents,
  listWorkspaceMembers,
  removeWorkspaceMember,
  updateMemberRole,
  updateUserProfile,
  updateWorkspaceSettings,
} from '../services/workspace';
import {
  memberInviteSchema,
  memberIdSchema,
  memberRoleUpdateSchema,
  passwordChangeSchema,
  profileUpdateSchema,
  workspaceUpdateSchema,
} from '../validation/workspace';

async function requireSettingsWorkspace(minimumRole: 'VIEWER' | 'ADMIN' | 'OWNER' = 'VIEWER') {
  return requirePrimaryWorkspaceRole(minimumRole);
}

export async function getWorkspaceSettingsAction() {
  try {
    const access = await requireSettingsWorkspace('VIEWER');
    const workspace = await getWorkspaceById(getDb(), access.workspace.id);
    return { ok: true as const, workspace, role: access.role };
  } catch (error) {
    return { ok: false as const, error: toPublicError(error) };
  }
}

export async function updateWorkspaceSettingsAction(formData: FormData) {
  try {
    const access = await requireSettingsWorkspace('ADMIN');
    const parsed = workspaceUpdateSchema.safeParse({
      name: formData.get('name'),
      timezone: formData.get('timezone'),
      defaultCurrency: formData.get('defaultCurrency'),
    });
    if (!parsed.success) {
      throw new AppError('VALIDATION', 'Invalid workspace settings', 400, parsed.error.flatten());
    }
    const before = await getWorkspaceById(getDb(), access.workspace.id);
    const workspace = await updateWorkspaceSettings(getDb(), access.workspace.id, parsed.data);
    await writeAuditLog(getDb(), {
      workspaceId: access.workspace.id,
      actorUserId: access.user.id,
      action: 'UPDATE',
      module: 'workspace',
      recordType: 'Workspace',
      recordId: workspace.id,
      oldValue: {
        name: before.name,
        timezone: before.timezone,
        defaultCurrency: before.defaultCurrency,
      },
      newValue: parsed.data,
    });
    revalidatePath('/settings/workspace');
    revalidatePath('/dashboard');
    return { ok: true as const, workspace };
  } catch (error) {
    return { ok: false as const, error: toPublicError(error) };
  }
}

export async function listMembersAction() {
  try {
    const access = await requireSettingsWorkspace('VIEWER');
    const members = await listWorkspaceMembers(getDb(), access.workspace.id);
    return { ok: true as const, members, role: access.role, currentUserId: access.user.id };
  } catch (error) {
    return { ok: false as const, error: toPublicError(error) };
  }
}

export async function inviteMemberAction(formData: FormData) {
  try {
    const access = await requireSettingsWorkspace('OWNER');
    const parsed = memberInviteSchema.safeParse({
      email: formData.get('email'),
      name: formData.get('name') || undefined,
      password: formData.get('password'),
      role: formData.get('role') || 'MEMBER',
    });
    if (!parsed.success) {
      throw new AppError('VALIDATION', 'Invalid invite input', 400, parsed.error.flatten());
    }
    const invited = await inviteWorkspaceMember(getDb(), access.workspace.id, parsed.data);
    await writeAuditLog(getDb(), {
      workspaceId: access.workspace.id,
      actorUserId: access.user.id,
      action: 'CREATE',
      module: 'members',
      recordType: 'WorkspaceMember',
      recordId: invited.membershipId,
      newValue: { email: invited.email, role: invited.role },
    });
    revalidatePath('/settings/members');
    return { ok: true as const, invited };
  } catch (error) {
    return { ok: false as const, error: toPublicError(error) };
  }
}

export async function updateMemberRoleAction(formData: FormData) {
  try {
    const access = await requireSettingsWorkspace('OWNER');
    const parsed = memberRoleUpdateSchema.safeParse({
      membershipId: formData.get('membershipId'),
      role: formData.get('role'),
    });
    if (!parsed.success) {
      throw new AppError('VALIDATION', 'Invalid role update', 400, parsed.error.flatten());
    }
    const updated = await updateMemberRole(
      getDb(),
      access.workspace.id,
      parsed.data.membershipId,
      parsed.data.role,
    );
    await writeAuditLog(getDb(), {
      workspaceId: access.workspace.id,
      actorUserId: access.user.id,
      action: 'UPDATE',
      module: 'members',
      recordType: 'WorkspaceMember',
      recordId: updated.membershipId,
      newValue: { role: updated.role },
    });
    revalidatePath('/settings/members');
    return { ok: true as const, updated };
  } catch (error) {
    return { ok: false as const, error: toPublicError(error) };
  }
}

export async function removeMemberAction(formData: FormData) {
  try {
    const access = await requireSettingsWorkspace('OWNER');
    const membershipId = memberIdSchema.parse(formData.get('membershipId'));
    const removed = await removeWorkspaceMember(getDb(), access.workspace.id, membershipId);
    await writeAuditLog(getDb(), {
      workspaceId: access.workspace.id,
      actorUserId: access.user.id,
      action: 'DELETE',
      module: 'members',
      recordType: 'WorkspaceMember',
      recordId: removed.membershipId,
      oldValue: { userId: removed.userId },
    });
    revalidatePath('/settings/members');
    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, error: toPublicError(error) };
  }
}

export async function getSecuritySettingsAction() {
  try {
    const access = await requirePrimaryWorkspace();
    const events = await listRecentLoginEvents(getDb(), access.user.id);
    return {
      ok: true as const,
      user: {
        id: access.user.id,
        email: access.user.email,
        name: access.user.name,
      },
      loginEvents: events,
    };
  } catch (error) {
    return { ok: false as const, error: toPublicError(error) };
  }
}

export async function updateProfileAction(formData: FormData) {
  try {
    const access = await requirePrimaryWorkspace();
    const parsed = profileUpdateSchema.safeParse({
      name: formData.get('name') || undefined,
    });
    if (!parsed.success) {
      throw new AppError('VALIDATION', 'Invalid profile', 400, parsed.error.flatten());
    }
    const user = await updateUserProfile(getDb(), access.user.id, parsed.data);
    await writeAuditLog(getDb(), {
      workspaceId: access.workspace.id,
      actorUserId: access.user.id,
      action: 'UPDATE',
      module: 'security',
      recordType: 'User',
      recordId: user.id,
      newValue: { name: user.name },
    });
    revalidatePath('/settings/security');
    return { ok: true as const, user: { id: user.id, email: user.email, name: user.name } };
  } catch (error) {
    return { ok: false as const, error: toPublicError(error) };
  }
}

export async function changePasswordAction(formData: FormData) {
  try {
    const access = await requirePrimaryWorkspace();
    const parsed = passwordChangeSchema.safeParse({
      currentPassword: formData.get('currentPassword'),
      newPassword: formData.get('newPassword'),
      confirmPassword: formData.get('confirmPassword'),
    });
    if (!parsed.success) {
      throw new AppError('VALIDATION', 'Invalid password change', 400, parsed.error.flatten());
    }
    await changeUserPassword(getDb(), access.user.id, parsed.data);
    await writeAuditLog(getDb(), {
      workspaceId: access.workspace.id,
      actorUserId: access.user.id,
      action: 'UPDATE',
      module: 'security',
      recordType: 'User',
      recordId: access.user.id,
      newValue: { passwordChanged: true },
    });
    revalidatePath('/settings/security');
    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, error: toPublicError(error) };
  }
}
