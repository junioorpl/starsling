// GitHub API Types
export interface GitHubUser {
  id: number;
  login: string;
  name?: string;
  email?: string;
  avatar_url: string;
  html_url: string;
  type: 'User' | 'Organization';
}

export interface GitHubOrganization {
  id: number;
  login: string;
  description?: string;
  avatar_url: string;
  html_url: string;
  type: 'Organization';
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description?: string;
  html_url: string;
  private: boolean;
  owner: GitHubUser;
}

export interface GitHubInstallation {
  id: number;
  account?: GitHubUser | GitHubOrganization;
  permissions: Record<string, string>;
  events: string[];
  created_at: string;
  updated_at: string;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body?: string;
  state: 'open' | 'closed';
  html_url: string;
  user: GitHubUser;
  created_at: string;
  updated_at: string;
  closed_at?: string;
}

// BetterAuth Session Types
export interface BetterAuthSession {
  user: {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    accounts?: {
      github?: {
        accessToken: string;
        refreshToken?: string;
        expiresAt?: Date;
      };
    };
  };
  session: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string | null;
    userAgent?: string | null;
  };
}

// Webhook Payload Types
export interface GitHubWebhookInstallationPayload {
  action: 'created' | 'deleted';
  installation: GitHubInstallation;
}

export interface GitHubWebhookInstallationRepositoriesPayload {
  action: 'added' | 'removed';
  installation: GitHubInstallation;
  repositories_added?: GitHubRepository[];
  repositories_removed?: GitHubRepository[];
  repository_selection: 'all' | 'selected';
}

export interface GitHubWebhookPingPayload {
  zen: string;
  hook_id: number;
  hook: {
    type: string;
    id: number;
    name: string;
    active: boolean;
    events: string[];
    config: Record<string, unknown>;
    updated_at: string;
    created_at: string;
    url: string;
    test_url?: string;
    ping_url: string;
    deliveries_url: string;
    last_response: {
      code: number | null;
      status: string | null;
      message: string | null;
    };
  };
  repository?: GitHubRepository;
  organization?: GitHubOrganization;
  sender?: GitHubUser;
}

export interface GitHubWebhookIssuePayload {
  action: 'opened' | 'closed' | 'reopened';
  issue: GitHubIssue;
  repository: GitHubRepository;
  installation?: {
    id: number;
  };
}

// Error Types
export class GitHubAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: unknown
  ) {
    super(message);
    this.name = 'GitHubAPIError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class DatabaseError extends Error {
  constructor(
    message: string,
    public operation?: string
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

// Environment Variables Type
export interface EnvironmentConfig {
  GITHUB_APP_ID: string;
  GITHUB_APP_PRIVATE_KEY: string;
  GITHUB_APP_CLIENT_ID: string;
  GITHUB_APP_CLIENT_SECRET: string;
  GITHUB_APP_SLUG: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  GITHUB_WEBHOOK_SECRET: string;
  DATABASE_URL: string;
  ENCRYPTION_KEY: string;
  INNGEST_EVENT_KEY: string;
  INNGEST_SIGNING_KEY: string;
  INNGEST_ENV: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  NEXT_PUBLIC_APP_URL: string;
}
