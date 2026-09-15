import { createDb, type Database } from '@fpm/db';
import { getServerEnv } from './env';

const globalForDb = globalThis as unknown as { __fpmDb?: Database };

export function getDb(): Database {
  if (!globalForDb.__fpmDb) {
    const env = getServerEnv();
    globalForDb.__fpmDb = createDb(env.DATABASE_URL);
  }
  return globalForDb.__fpmDb;
}
