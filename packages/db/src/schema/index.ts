import { index, numeric, pgEnum, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

export const workspaceRoleEnum = pgEnum('workspace_role', ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']);

export const loginEventTypeEnum = pgEnum('login_event_type', ['SUCCESS', 'FAILURE', 'LOCKOUT']);

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

/** Re-export numeric helper type usage for future money columns (precision 20, scale 8). */
export const moneyNumeric = numeric;

export type User = typeof users.$inferSelect;
export type Workspace = typeof workspaces.$inferSelect;
export type WorkspaceMember = typeof workspaceMembers.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Firm = typeof firms.$inferSelect;
export type WorkspaceRole = (typeof workspaceRoleEnum.enumValues)[number];
