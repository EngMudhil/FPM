import {
  index,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const workspaceRoleEnum = pgEnum('workspace_role', ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']);

export const loginEventTypeEnum = pgEnum('login_event_type', ['SUCCESS', 'FAILURE', 'LOCKOUT']);

export const accountPhaseEnum = pgEnum('account_phase', ['ACTIVE', 'PAUSED', 'CLOSED']);

export const withdrawalStatusEnum = pgEnum('withdrawal_status', [
  'PENDING',
  'PAID',
  'FAILED',
  'REVERSED',
]);

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const users = pgTable(
  'users',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull(),
    name: text('name'),
    passwordHash: text('password_hash').notNull(),
    ...timestamps,
  },
  (table) => [uniqueIndex('users_email_unique').on(table.email)],
);

export const sessions = pgTable(
  'sessions',
  {
    id: text('id').primaryKey(),
    sessionToken: text('session_token').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('sessions_token_unique').on(table.sessionToken),
    index('sessions_user_id_idx').on(table.userId),
    index('sessions_expires_at_idx').on(table.expiresAt),
  ],
);

export const workspaces = pgTable('workspaces', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  timezone: text('timezone').notNull().default('UTC'),
  defaultCurrency: text('default_currency').notNull().default('USD'),
  ...timestamps,
});

export const workspaceMembers = pgTable(
  'workspace_members',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: workspaceRoleEnum('role').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('workspace_members_workspace_user_unique').on(table.workspaceId, table.userId),
    index('workspace_members_user_id_idx').on(table.userId),
    index('workspace_members_role_idx').on(table.role),
  ],
);

export const loginEvents = pgTable(
  'login_events',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
    workspaceId: text('workspace_id').references(() => workspaces.id, {
      onDelete: 'set null',
    }),
    type: loginEventTypeEnum('type').notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    index('login_events_created_at_idx').on(table.createdAt),
    index('login_events_type_idx').on(table.type),
    index('login_events_user_id_idx').on(table.userId),
  ],
);

/**
 * Prop firms. Soft-archive via archivedAt; never cascade-destroy financial history.
 * Future trading_accounts will FK here with Restrict/SetNull policy (not Cascade).
 */
export const firms = pgTable(
  'firms',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'restrict' }),
    name: text('name').notNull(),
    website: text('website'),
    notes: text('notes'),
    archivedAt: timestamp('archived_at', { withTimezone: true, mode: 'date' }),
    ...timestamps,
  },
  (table) => [
    index('firms_workspace_id_idx').on(table.workspaceId),
    index('firms_workspace_name_idx').on(table.workspaceId, table.name),
    index('firms_archived_at_idx').on(table.archivedAt),
  ],
);

/**
 * Funded / challenge trading accounts. currentSize is authoritative size cache;
 * Scale Events (FPM-010) must keep it in sync transactionally.
 */
export const tradingAccounts = pgTable(
  'trading_accounts',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'restrict' }),
    firmId: text('firm_id')
      .notNull()
      .references(() => firms.id, { onDelete: 'restrict' }),
    accountNumber: text('account_number'),
    label: text('label'),
    phase: accountPhaseEnum('phase').notNull().default('ACTIVE'),
    initialSize: numeric('initial_size', { precision: 20, scale: 8 }).notNull(),
    currentSize: numeric('current_size', { precision: 20, scale: 8 }).notNull(),
    currency: text('currency').notNull(),
    platform: text('platform'),
    startDate: text('start_date'),
    notes: text('notes'),
    archivedAt: timestamp('archived_at', { withTimezone: true, mode: 'date' }),
    ...timestamps,
  },
  (table) => [
    index('trading_accounts_workspace_id_idx').on(table.workspaceId),
    index('trading_accounts_firm_id_idx').on(table.firmId),
    index('trading_accounts_phase_idx').on(table.phase),
    index('trading_accounts_archived_at_idx').on(table.archivedAt),
  ],
);

export const withdrawals = pgTable(
  'withdrawals',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'restrict' }),
    tradingAccountId: text('trading_account_id')
      .notNull()
      .references(() => tradingAccounts.id, { onDelete: 'restrict' }),
    amount: numeric('amount', { precision: 20, scale: 8 }).notNull(),
    currency: text('currency').notNull(),
    status: withdrawalStatusEnum('status').notNull().default('PENDING'),
    requestedAt: timestamp('requested_at', { withTimezone: true, mode: 'date' }).notNull(),
    receivedAt: timestamp('received_at', { withTimezone: true, mode: 'date' }),
    notes: text('notes'),
    ...timestamps,
  },
  (table) => [
    index('withdrawals_workspace_id_idx').on(table.workspaceId),
    index('withdrawals_trading_account_id_idx').on(table.tradingAccountId),
    index('withdrawals_status_idx').on(table.status),
    index('withdrawals_received_at_idx').on(table.receivedAt),
    index('withdrawals_requested_at_idx').on(table.requestedAt),
  ],
);

export const certificates = pgTable(
  'certificates',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'restrict' }),
    withdrawalId: text('withdrawal_id')
      .notNull()
      .references(() => withdrawals.id, { onDelete: 'restrict' }),
    title: text('title'),
    issuedAt: timestamp('issued_at', { withTimezone: true, mode: 'date' }),
    objectKey: text('object_key').notNull(),
    originalFilename: text('original_filename').notNull(),
    mimeType: text('mime_type').notNull(),
    sizeBytes: text('size_bytes').notNull(),
    checksum: text('checksum').notNull(),
    notes: text('notes'),
    ...timestamps,
  },
  (table) => [
    index('certificates_workspace_id_idx').on(table.workspaceId),
    index('certificates_withdrawal_id_idx').on(table.withdrawalId),
  ],
);

/**
 * Scale events. On create/update/delete, trading_accounts.currentSize is
 * resynced in the same transaction (ADR-011 / Spec §8 + HB-014).
 */
export const scaleEvents = pgTable(
  'scale_events',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'restrict' }),
    tradingAccountId: text('trading_account_id')
      .notNull()
      .references(() => tradingAccounts.id, { onDelete: 'restrict' }),
    fromSize: numeric('from_size', { precision: 20, scale: 8 }).notNull(),
    toSize: numeric('to_size', { precision: 20, scale: 8 }).notNull(),
    scaledAt: timestamp('scaled_at', { withTimezone: true, mode: 'date' }).notNull(),
    notes: text('notes'),
    ...timestamps,
  },
  (table) => [
    index('scale_events_workspace_id_idx').on(table.workspaceId),
    index('scale_events_trading_account_id_idx').on(table.tradingAccountId),
    index('scale_events_workspace_scaled_at_idx').on(table.workspaceId, table.scaledAt),
  ],
);

export const brokers = pgTable(
  'brokers',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'restrict' }),
    name: text('name').notNull(),
    website: text('website'),
    notes: text('notes'),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('brokers_workspace_name_unique').on(table.workspaceId, table.name),
    index('brokers_workspace_id_idx').on(table.workspaceId),
  ],
);

export const brokerAccounts = pgTable(
  'broker_accounts',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'restrict' }),
    brokerId: text('broker_id')
      .notNull()
      .references(() => brokers.id, { onDelete: 'restrict' }),
    accountName: text('account_name').notNull(),
    accountNumber: text('account_number'),
    startingCapital: numeric('starting_capital', { precision: 20, scale: 8 }).notNull(),
    currency: text('currency').notNull(),
    startDate: text('start_date'),
    notes: text('notes'),
    ...timestamps,
  },
  (table) => [
    index('broker_accounts_workspace_id_idx').on(table.workspaceId),
    index('broker_accounts_broker_id_idx').on(table.brokerId),
  ],
);

export const brokerDeposits = pgTable(
  'broker_deposits',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'restrict' }),
    brokerAccountId: text('broker_account_id')
      .notNull()
      .references(() => brokerAccounts.id, { onDelete: 'cascade' }),
    depositDate: timestamp('deposit_date', { withTimezone: true, mode: 'date' }).notNull(),
    amount: numeric('amount', { precision: 20, scale: 8 }).notNull(),
    currency: text('currency').notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    index('broker_deposits_workspace_id_idx').on(table.workspaceId),
    index('broker_deposits_broker_account_id_idx').on(table.brokerAccountId),
    index('broker_deposits_workspace_deposit_date_idx').on(table.workspaceId, table.depositDate),
  ],
);

export const brokerWithdrawals = pgTable(
  'broker_withdrawals',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'restrict' }),
    brokerAccountId: text('broker_account_id')
      .notNull()
      .references(() => brokerAccounts.id, { onDelete: 'cascade' }),
    withdrawalDate: timestamp('withdrawal_date', { withTimezone: true, mode: 'date' }).notNull(),
    amount: numeric('amount', { precision: 20, scale: 8 }).notNull(),
    currency: text('currency').notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    index('broker_withdrawals_workspace_id_idx').on(table.workspaceId),
    index('broker_withdrawals_broker_account_id_idx').on(table.brokerAccountId),
    index('broker_withdrawals_workspace_withdrawal_date_idx').on(
      table.workspaceId,
      table.withdrawalDate,
    ),
  ],
);

/** OQ-015 / ADR-012: duplicate (account, snapshotDate) is rejected (unique). */
export const equitySnapshots = pgTable(
  'equity_snapshots',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'restrict' }),
    brokerAccountId: text('broker_account_id')
      .notNull()
      .references(() => brokerAccounts.id, { onDelete: 'cascade' }),
    snapshotDate: timestamp('snapshot_date', { withTimezone: true, mode: 'date' }).notNull(),
    equity: numeric('equity', { precision: 20, scale: 8 }).notNull(),
    currency: text('currency').notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('equity_snapshots_account_date_unique').on(
      table.brokerAccountId,
      table.snapshotDate,
    ),
    index('equity_snapshots_workspace_id_idx').on(table.workspaceId),
    index('equity_snapshots_workspace_snapshot_date_idx').on(table.workspaceId, table.snapshotDate),
  ],
);

/** Append-only audit trail. Never update or delete rows in application code. */
export const auditLogs = pgTable(
  'audit_logs',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'restrict' }),
    actorUserId: text('actor_user_id').references(() => users.id, { onDelete: 'set null' }),
    action: text('action').notNull(),
    module: text('module').notNull(),
    recordType: text('record_type'),
    recordId: text('record_id'),
    oldValue: jsonb('old_value'),
    newValue: jsonb('new_value'),
    metadata: jsonb('metadata'),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    index('audit_logs_workspace_created_at_idx').on(table.workspaceId, table.createdAt),
    index('audit_logs_actor_user_id_idx').on(table.actorUserId),
    index('audit_logs_workspace_action_module_idx').on(
      table.workspaceId,
      table.action,
      table.module,
    ),
  ],
);

/** Re-export numeric helper type usage for future money columns (precision 20, scale 8). */
export const moneyNumeric = numeric;

export type User = typeof users.$inferSelect;
export type Workspace = typeof workspaces.$inferSelect;
export type WorkspaceMember = typeof workspaceMembers.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Firm = typeof firms.$inferSelect;
export type TradingAccount = typeof tradingAccounts.$inferSelect;
export type Withdrawal = typeof withdrawals.$inferSelect;
export type Certificate = typeof certificates.$inferSelect;
export type ScaleEvent = typeof scaleEvents.$inferSelect;
export type Broker = typeof brokers.$inferSelect;
export type BrokerAccount = typeof brokerAccounts.$inferSelect;
export type BrokerDeposit = typeof brokerDeposits.$inferSelect;
export type BrokerWithdrawal = typeof brokerWithdrawals.$inferSelect;
export type EquitySnapshot = typeof equitySnapshots.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type AccountPhase = (typeof accountPhaseEnum.enumValues)[number];
export type WithdrawalStatus = (typeof withdrawalStatusEnum.enumValues)[number];
export type WorkspaceRole = (typeof workspaceRoleEnum.enumValues)[number];
