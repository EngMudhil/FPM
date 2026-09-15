import { NextResponse } from 'next/server';
import { createDb, closeDb } from '@fpm/db';
import { sql } from 'drizzle-orm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return NextResponse.json({ status: 'error', database: 'unconfigured' }, { status: 503 });
  }

  const db = createDb(databaseUrl);
  try {
    await db.execute(sql`select 1`);
    return NextResponse.json({ status: 'ok', database: 'up' });
  } catch {
    return NextResponse.json({ status: 'error', database: 'down' }, { status: 503 });
  } finally {
    await closeDb(db);
  }
}
