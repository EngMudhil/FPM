import bcrypt from 'bcryptjs';
import { and, eq } from 'drizzle-orm';
import { createDb } from './client';
import { createId } from './id';
import {
  brokerAccounts,
  brokerDeposits,
  brokerWithdrawals,
  brokers,
  equitySnapshots,
  firms,
  scaleEvents,
  tradingAccounts,
  users,
  withdrawals,
  workspaceMembers,
  workspaces,
} from './schema/index';

const DEV_OWNER_EMAIL = 'owner@fpm.local';
const DEV_OWNER_PASSWORD = 'FpmDevOwner1!';
const DEV_ADMIN_EMAIL = 'admin@fpm.local';
const DEV_ADMIN_PASSWORD = 'FpmDevAdmin1!';

function daysAgo(days: number): Date {
  const d = new Date();
  d.setUTCHours(12, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - days);
  return d;
}

function monthStartDaysAgo(days: number): Date {
  return daysAgo(days);
}

export async function seedDevelopment(databaseUrl: string): Promise<void> {
  const db = createDb(databaseUrl);
  const passwordOwner = await bcrypt.hash(DEV_OWNER_PASSWORD, 12);
  const passwordAdmin = await bcrypt.hash(DEV_ADMIN_PASSWORD, 12);

  let workspaceId: string;
  let ownerUserId: string;

  const existingOwner = await db
    .select()
    .from(users)
    .where(eq(users.email, DEV_OWNER_EMAIL))
    .limit(1);

  if (existingOwner[0]) {
    ownerUserId = existingOwner[0].id;
    const membership = await db
      .select()
      .from(workspaceMembers)
      .where(eq(workspaceMembers.userId, ownerUserId))
      .limit(1);
    if (!membership[0]) {
      throw new Error('Owner exists without workspace membership');
    }
    workspaceId = membership[0].workspaceId;
    console.log('Owner already present — reusing workspace');
  } else {
    ownerUserId = createId();
    workspaceId = createId();
    await db.transaction(async (tx) => {
      await tx.insert(users).values({
        id: ownerUserId,
        email: DEV_OWNER_EMAIL,
        name: 'FPM Dev Owner',
        passwordHash: passwordOwner,
      });
      await tx.insert(workspaces).values({
        id: workspaceId,
        name: 'Personal Workspace',
        timezone: 'UTC',
        defaultCurrency: 'USD',
      });
      await tx.insert(workspaceMembers).values({
        id: createId(),
        workspaceId,
        userId: ownerUserId,
        role: 'OWNER',
      });
    });
    console.log('Seeded development OWNER');
  }

  const existingAdmin = await db
    .select()
    .from(users)
    .where(eq(users.email, DEV_ADMIN_EMAIL))
    .limit(1);

  if (!existingAdmin[0]) {
    const adminUserId = createId();
    await db.transaction(async (tx) => {
      await tx.insert(users).values({
        id: adminUserId,
        email: DEV_ADMIN_EMAIL,
        name: 'FPM Dev Admin',
        passwordHash: passwordAdmin,
      });
      await tx.insert(workspaceMembers).values({
        id: createId(),
        workspaceId,
        userId: adminUserId,
        role: 'ADMIN',
      });
    });
    console.log('Seeded development ADMIN');
  } else {
    console.log('Admin already present — skipped user create');
  }

  const existingDemoFirm = await db
    .select()
    .from(firms)
    .where(and(eq(firms.workspaceId, workspaceId), eq(firms.name, 'Demo Prop Firm')))
    .limit(1);

  if (existingDemoFirm[0]) {
    console.log('Demo portfolio already present — skipped domain seed');
  } else {
    const firmA = createId();
    const firmB = createId();
    const accountA = createId();
    const accountB = createId();
    const accountC = createId();
    const brokerId = createId();
    const brokerAccountId = createId();

    await db.transaction(async (tx) => {
      await tx.insert(firms).values([
        {
          id: firmA,
          workspaceId,
          name: 'Demo Prop Firm',
          website: 'https://example.com/demo-prop',
          notes: 'Seeded demo firm',
        },
        {
          id: firmB,
          workspaceId,
          name: 'Apex Demo Firm',
          website: 'https://example.com/apex-demo',
          notes: 'Second seeded firm',
        },
      ]);

      await tx.insert(tradingAccounts).values([
        {
          id: accountA,
          workspaceId,
          firmId: firmA,
          accountNumber: 'FT-10001',
          label: '100k Challenge',
          phase: 'ACTIVE',
          initialSize: '100000',
          currentSize: '150000',
          currency: 'USD',
          platform: 'MT5',
          startDate: '2025-01-15',
          notes: 'Scaled once',
        },
        {
          id: accountB,
          workspaceId,
          firmId: firmA,
          accountNumber: 'FT-10002',
          label: '50k Active',
          phase: 'ACTIVE',
          initialSize: '50000',
          currentSize: '50000',
          currency: 'USD',
          platform: 'MT5',
          startDate: '2025-06-01',
        },
        {
          id: accountC,
          workspaceId,
          firmId: firmB,
          accountNumber: 'AP-20001',
          label: 'EUR Swing',
          phase: 'PAUSED',
          initialSize: '25000',
          currentSize: '25000',
          currency: 'EUR',
          platform: 'cTrader',
          startDate: '2025-03-10',
        },
      ]);

      await tx.insert(scaleEvents).values({
        id: createId(),
        workspaceId,
        tradingAccountId: accountA,
        fromSize: '100000',
        toSize: '150000',
        scaledAt: daysAgo(60),
        notes: 'Demo scale-up',
      });

      await tx.insert(withdrawals).values([
        {
          id: createId(),
          workspaceId,
          tradingAccountId: accountA,
          amount: '4200',
          currency: 'USD',
          status: 'PAID',
          requestedAt: daysAgo(45),
          receivedAt: daysAgo(40),
          notes: 'First payout',
        },
        {
          id: createId(),
          workspaceId,
          tradingAccountId: accountA,
          amount: '3800',
          currency: 'USD',
          status: 'PAID',
          requestedAt: daysAgo(20),
          receivedAt: daysAgo(15),
          notes: 'Second payout',
        },
        {
          id: createId(),
          workspaceId,
          tradingAccountId: accountB,
          amount: '1500',
          currency: 'USD',
          status: 'PENDING',
          requestedAt: daysAgo(3),
          receivedAt: null,
          notes: 'Awaiting firm',
        },
        {
          id: createId(),
          workspaceId,
          tradingAccountId: accountC,
          amount: '900',
          currency: 'EUR',
          status: 'PAID',
          requestedAt: daysAgo(30),
          receivedAt: monthStartDaysAgo(25),
          notes: 'EUR payout',
        },
      ]);

      await tx.insert(brokers).values({
        id: brokerId,
        workspaceId,
        name: 'Demo Broker',
        website: 'https://example.com/broker',
        notes: 'Real-account demo',
      });

      await tx.insert(brokerAccounts).values({
        id: brokerAccountId,
        workspaceId,
        brokerId,
        accountName: 'Live USD',
        accountNumber: 'BR-9001',
        startingCapital: '10000',
        currency: 'USD',
        startDate: '2025-02-01',
      });

      await tx.insert(brokerDeposits).values({
        id: createId(),
        workspaceId,
        brokerAccountId,
        depositDate: daysAgo(90),
        amount: '10000',
        currency: 'USD',
        notes: 'Initial deposit',
      });

      await tx.insert(brokerWithdrawals).values({
        id: createId(),
        workspaceId,
        brokerAccountId,
        withdrawalDate: daysAgo(10),
        amount: '500',
        currency: 'USD',
        notes: 'Partial cash-out',
      });

      await tx.insert(equitySnapshots).values([
        {
          id: createId(),
          workspaceId,
          brokerAccountId,
          snapshotDate: daysAgo(30),
          equity: '11200',
          currency: 'USD',
        },
        {
          id: createId(),
          workspaceId,
          brokerAccountId,
          snapshotDate: daysAgo(7),
          equity: '12150',
          currency: 'USD',
          notes: 'Latest',
        },
      ]);
    });

    console.log('Seeded demo portfolio (firms, accounts, withdrawals, broker)');
  }

  console.log('');
  console.log('Development credentials (never use in production):');
  console.log(`  OWNER  ${DEV_OWNER_EMAIL} / ${DEV_OWNER_PASSWORD}`);
  console.log(`  ADMIN  ${DEV_ADMIN_EMAIL} / ${DEV_ADMIN_PASSWORD}`);
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
