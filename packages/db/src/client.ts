import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index';

export type Database = ReturnType<typeof createDb>;

export function createDb(connectionString: string) {
  const client = postgres(connectionString, {
    max: 10,
    prepare: false,
  });
  const db = drizzle(client, { schema });
  return Object.assign(db, {
    $client: client,
  });
}

export async function withTransaction<T>(
  db: Database,
  fn: (tx: Parameters<Parameters<Database['transaction']>[0]>[0]) => Promise<T>,
): Promise<T> {
  return db.transaction(fn);
}

export async function closeDb(db: Database): Promise<void> {
  await db.$client.end({ timeout: 5 });
}
