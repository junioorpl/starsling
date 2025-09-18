import { Inngest } from 'inngest';

import { logger } from './logger';

// Configure Inngest based on environment following official patterns
const isDevelopment = process.env.NODE_ENV === 'development';
const _isProduction = process.env.NODE_ENV === 'production';

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

// For local development, use minimal configuration without authentication
// For production, use Inngest Cloud with authentication
if (isDevelopment) {
  // In development, use minimal configuration (no authentication needed)
  // The local Inngest dev server handles authentication
  // Don't add any keys for local development
} else {
  // In production, use Inngest Cloud with authentication
  if (process.env.INNGEST_EVENT_KEY) {
    config.eventKey = process.env.INNGEST_EVENT_KEY;
  }
  if (process.env.INNGEST_SIGNING_KEY) {
    config.signingKey = process.env.INNGEST_SIGNING_KEY;
  }
}

// Initialize Inngest client
let inngest: Inngest;

try {
  inngest = new Inngest(config);

  logger.info('Inngest client initialized successfully', {
    environment: process.env.NODE_ENV || 'development',
    hasEventKey: !!process.env.INNGEST_EVENT_KEY,
    hasSigningKey: !!process.env.INNGEST_SIGNING_KEY,
    mode: isDevelopment ? 'local' : 'cloud',
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
};
