import {
  boolean,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

// BetterAuth required tables
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Custom application tables
export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  ownerId: text('owner_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const organizationMembers = pgTable('organization_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 20 }).notNull().default('member'), // owner, admin, member
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const integrationInstallations = pgTable('integration_installations', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  provider: varchar('provider', { length: 50 }).notNull().default('github'),
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token'),
  metadata: jsonb('metadata').$type<{
    installationId?: number;
    accountId?: number;
    accountType?: string;
    accountLogin?: string;
    permissions?: Record<string, string>;
    events?: string[];
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const repositories = pgTable('repositories', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  githubId: text('github_id').notNull().unique(),
  name: text('name').notNull(),
  fullName: text('full_name').notNull(),
  description: text('description'),
  private: boolean('private').notNull().default(false),
  url: text('url').notNull(),
  cloneUrl: text('clone_url'),
  defaultBranch: text('default_branch').notNull().default('main'),
  language: text('language'),
  topics: jsonb('topics').$type<string[]>(),
  metadata: jsonb('metadata').$type<{
    size?: number;
    stargazersCount?: number;
    watchersCount?: number;
    forksCount?: number;
    openIssuesCount?: number;
    hasIssues?: boolean;
    hasProjects?: boolean;
    hasWiki?: boolean;
    hasPages?: boolean;
    archived?: boolean;
    disabled?: boolean;
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const issues = pgTable('issues', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  repositoryId: uuid('repository_id')
    .notNull()
    .references(() => repositories.id, { onDelete: 'cascade' }),
  githubId: text('github_id').notNull().unique(),
  number: text('number').notNull(),
  title: text('title').notNull(),
  body: text('body'),
  state: varchar('state', { length: 20 }).notNull().default('open'), // open, closed
  locked: boolean('locked').notNull().default(false),
  author: text('author').notNull(),
  authorAssociation: varchar('author_association', { length: 50 }),
  assignees: jsonb('assignees').$type<string[]>(),
  labels: jsonb('labels').$type<string[]>(),
  milestone: text('milestone'),
  commentsCount: text('comments_count').notNull().default('0'),
  reactionsCount: text('reactions_count').notNull().default('0'),
  url: text('url').notNull(),
  htmlUrl: text('html_url').notNull(),
  apiUrl: text('api_url').notNull(),
  metadata: jsonb('metadata').$type<{
    pullRequest?: {
      url: string;
      htmlUrl: string;
      diffUrl: string;
      patchUrl: string;
    };
    closedAt?: string;
    createdAt: string;
    updatedAt: string;
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
