'use server';

import { loginInputSchema } from '../validation';
import { AppError, toPublicError } from '../errors';
import { loginWithPassword, logoutCurrentSession, requireAuthenticatedUser } from '../auth/session';
import { requirePrimaryWorkspace } from '../authz/workspace';

export async function loginAction(formData: FormData) {
  try {
    const parsed = loginInputSchema.safeParse({
      email: formData.get('email'),
      password: formData.get('password'),
    });
    if (!parsed.success) {
      throw new AppError('VALIDATION', 'Invalid login input', 400, parsed.error.flatten());
    }
    const user = await loginWithPassword(parsed.data.email, parsed.data.password);
    return { ok: true as const, user };
  } catch (error) {
    return { ok: false as const, error: toPublicError(error) };
  }
}

export async function logoutAction() {
  await logoutCurrentSession();
  return { ok: true as const };
}

export async function getSessionAction() {
  try {
    const user = await requireAuthenticatedUser();
    const { workspace, role } = await requirePrimaryWorkspace();
    return {
      ok: true as const,
      user,
      workspace: {
        id: workspace.id,
        name: workspace.name,
        timezone: workspace.timezone,
        defaultCurrency: workspace.defaultCurrency,
      },
      role,
    };
  } catch (error) {
    return { ok: false as const, error: toPublicError(error) };
  }
}
