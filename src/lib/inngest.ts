import { Inngest } from 'inngest';

import { logger } from './logger';

// Configure Inngest based on environment following official patterns

// Base configuration
const config: {
  id: string;
  eventKey?: string;
  signingKey?: string;
  isDev?: boolean;
  branch?: string;
} = {
  id: 'starsling',
};

// Set branch name from INNGEST_ENV environment variable
config.branch = process.env.INNGEST_ENV || 'main';

// Add authentication keys for both development and production
// These keys are required for proper communication with Inngest
if (process.env.INNGEST_EVENT_KEY) {
  config.eventKey = process.env.INNGEST_EVENT_KEY;
}
if (process.env.INNGEST_SIGNING_KEY) {
  config.signingKey = process.env.INNGEST_SIGNING_KEY;
}

// Initialize Inngest client
let inngest: Inngest;

try {
  inngest = new Inngest(config);

  logger.info('Inngest client initialized successfully', {
    environment: process.env.NODE_ENV || 'development',
    hasEventKey: !!process.env.INNGEST_EVENT_KEY,
    hasSigningKey: !!process.env.INNGEST_SIGNING_KEY,
    branch: config.branch,
  });
} catch (error) {
  logger.error('Failed to initialize Inngest client', {}, error as Error);
  throw new Error('Inngest initialization failed');
}

export { inngest };

// Event types
export type Events = {
  'github/app.installed': {
    data: {
      installationId: number;
      accountId: number;
      accountType: string;
      accountLogin: string;
      organizationId: string;
    };
  };
  'github/app.uninstalled': {
    data: {
      installationId: number;
      organizationId: string;
    };
  };
  'github/installation.repositories': {
    data: {
      action: string;
      installationId: number;
      organizationId: string;
      repositoriesAdded: Array<Record<string, unknown>>;
      repositoriesRemoved: Array<Record<string, unknown>>;
      repositorySelection: string;
    };
  };
  'github/issues.opened': {
    data: {
      installationId: number;
      issue: Record<string, unknown>;
      repository: Record<string, unknown>;
    };
  };
  'github/issues.closed': {
    data: {
      installationId: number;
      issue: Record<string, unknown>;
      repository: Record<string, unknown>;
    };
  };
  'github/issues.edited': {
    data: {
      installationId: number;
      issue: Record<string, unknown>;
      repository: Record<string, unknown>;
    };
  };
  'github/issues.reopened': {
    data: {
      installationId: number;
      issue: Record<string, unknown>;
      repository: Record<string, unknown>;
    };
  };
};
