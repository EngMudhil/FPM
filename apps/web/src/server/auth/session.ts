import { createId, loginEvents, sessions, users } from '@fpm/db';
import { and, eq, gt } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { cache } from 'react';
import { getDb } from '../db';
import { getServerEnv } from '../env';
import { AppError } from '../errors';
import { hashPassword, verifyPassword } from './password';

export const SESSION_COOKIE = 'fpm_session';

function sessionExpiryDate(): Date {
  const { SESSION_MAX_AGE_SECONDS } = getServerEnv();
  return new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
}

export async function createSession(userId: string): Promise<string> {
  const db = getDb();
  const sessionToken = createId() + createId();
  await db.insert(sessions).values({
    id: createId(),
    sessionToken,
    userId,
    expiresAt: sessionExpiryDate(),
  });
  return sessionToken;
}

export async function setSessionCookie(sessionToken: string): Promise<void> {
  const env = getServerEnv();
  const jar = await cookies();
  jar.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: sessionExpiryDate(),
  });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function getSessionTokenFromCookies(): Promise<string | undefined> {
  const jar = await cookies();
  return jar.get(SESSION_COOKIE)?.value;
}

/** Deduped per RSC request so layout + page actions share one session lookup. */
export const getAuthenticatedUser = cache(async () => {
  const token = await getSessionTokenFromCookies();
  if (!token) {
    return null;
  }
  const db = getDb();
  const rows = await db
    .select({
      user: users,
      session: sessions,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.sessionToken, token), gt(sessions.expiresAt, new Date())))
    .limit(1);

  const row = rows[0];
  if (!row) {
    return null;
  }
  return {
    id: row.user.id,
    email: row.user.email,
    name: row.user.name,
    sessionId: row.session.id,
  };
});

export async function requireAuthenticatedUser() {
  const user = await getAuthenticatedUser();
  if (!user) {
    throw new AppError('UNAUTHENTICATED', 'Authentication required', 401);
  }
  return user;
}

export async function loginWithPassword(
  email: string,
  password: string,
  meta?: {
    ipAddress?: string;
    userAgent?: string;
  },
) {
  const db = getDb();
  const normalized = email.trim().toLowerCase();
  const found = await db.select().from(users).where(eq(users.email, normalized)).limit(1);
  const user = found[0];

  const ok = user ? await verifyPassword(password, user.passwordHash) : false;
  if (!user || !ok) {
    await db.insert(loginEvents).values({
      id: createId(),
      userId: user?.id,
      type: 'FAILURE',
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });
    throw new AppError('UNAUTHENTICATED', 'Invalid email or password', 401);
  }

  const sessionToken = await createSession(user.id);
  await setSessionCookie(sessionToken);
  await db.insert(loginEvents).values({
    id: createId(),
    userId: user.id,
    type: 'SUCCESS',
    ipAddress: meta?.ipAddress,
    userAgent: meta?.userAgent,
  });

  return { id: user.id, email: user.email, name: user.name };
}

export async function logoutCurrentSession(): Promise<void> {
  const token = await getSessionTokenFromCookies();
  if (token) {
    const db = getDb();
    await db.delete(sessions).where(eq(sessions.sessionToken, token));
  }
  await clearSessionCookie();
}

export { hashPassword, verifyPassword };
