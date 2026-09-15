import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { createDb } from './client';
import { createId } from './id';
import { users, workspaceMembers, workspaces } from './schema/index';

const DEV_EMAIL = 'owner@fpm.local';
const DEV_PASSWORD = 'FpmDevOwner1!';

export async function seedDevelopment(databaseUrl: string): Promise<void> {
  const db = createDb(databaseUrl);

  const existing = await db.select().from(users).where(eq(users.email, DEV_EMAIL)).limit(1);
  if (existing[0]) {
    console.log('Seed skipped: development owner already exists');
    return;
  }

  const userId = createId();
  const workspaceId = createId();
  const membershipId = createId();
  const passwordHash = await bcrypt.hash(DEV_PASSWORD, 12);

  await db.transaction(async (tx) => {
    await tx.insert(users).values({
      id: userId,
      email: DEV_EMAIL,
      name: 'FPM Dev Owner',
      passwordHash,
    });
    await tx.insert(workspaces).values({
      id: workspaceId,
      name: 'Personal Workspace',
      timezone: 'UTC',
      defaultCurrency: 'USD',
    });
    await tx.insert(workspaceMembers).values({
      id: membershipId,
      workspaceId,
      userId,
      role: 'OWNER',
    });
  });

  console.log('Seeded development OWNER');
  console.log(`  email: ${DEV_EMAIL}`);
  console.log(`  password: ${DEV_PASSWORD}`);
  console.log('  (development only — never use in production)');
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is required');
    process.exit(1);
  }
  await seedDevelopment(url);
}

const isDirect =
  process.argv[1] && (process.argv[1].endsWith('seed.ts') || process.argv[1].endsWith('seed.js'));

if (isDirect) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
