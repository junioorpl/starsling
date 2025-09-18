import { logger } from './logger';
import { type EnvironmentConfig } from './types';

function validateEnvironmentVariable(
  key: keyof EnvironmentConfig
): string | undefined {
  const value = process.env[key];

  if (!value) {
    logger.warn(`Missing environment variable: ${key}`);
    return undefined;
  }

  return value;
}

function validateEnvironment(): EnvironmentConfig {
  const config: Partial<EnvironmentConfig> = {
    GITHUB_APP_ID: validateEnvironmentVariable('GITHUB_APP_ID'),
    GITHUB_APP_PRIVATE_KEY: validateEnvironmentVariable(
      'GITHUB_APP_PRIVATE_KEY'
    ),
    GITHUB_APP_CLIENT_ID: validateEnvironmentVariable('GITHUB_APP_CLIENT_ID'),
    GITHUB_APP_CLIENT_SECRET: validateEnvironmentVariable(
      'GITHUB_APP_CLIENT_SECRET'
    ),
    GITHUB_APP_SLUG: validateEnvironmentVariable('GITHUB_APP_SLUG'),
    GITHUB_CLIENT_ID: validateEnvironmentVariable('GITHUB_CLIENT_ID'),
    GITHUB_CLIENT_SECRET: validateEnvironmentVariable('GITHUB_CLIENT_SECRET'),
    GITHUB_WEBHOOK_SECRET: validateEnvironmentVariable('GITHUB_WEBHOOK_SECRET'),
    DATABASE_URL: validateEnvironmentVariable('DATABASE_URL'),
    ENCRYPTION_KEY: validateEnvironmentVariable('ENCRYPTION_KEY'),
    INNGEST_EVENT_KEY: validateEnvironmentVariable('INNGEST_EVENT_KEY'),
    INNGEST_SIGNING_KEY: validateEnvironmentVariable('INNGEST_SIGNING_KEY'),
    INNGEST_ENV: process.env.INNGEST_ENV || 'main',
    BETTER_AUTH_SECRET: validateEnvironmentVariable('BETTER_AUTH_SECRET'),
    BETTER_AUTH_URL: validateEnvironmentVariable('BETTER_AUTH_URL'),
    NEXT_PUBLIC_APP_URL: validateEnvironmentVariable('NEXT_PUBLIC_APP_URL'),
  };

  // Count missing required variables
  const missingVars = Object.entries(config).filter(
    ([_, value]) => value === undefined
  );

  // Log validation results only once per process
  if (!process.env.__STARSLING_ENV_VALIDATED) {
    if (missingVars.length > 0) {
      logger.warn(
        `Missing ${missingVars.length} environment variables: ${missingVars.map(([key]) => key).join(', ')}`
      );
      logger.warn(
        'Application may not function correctly with missing environment variables'
      );
    } else {
      logger.info('All environment variables validated successfully');
    }
    process.env.__STARSLING_ENV_VALIDATED = 'true';
  }

  // Return config with fallback values for missing variables
  return {
    GITHUB_APP_ID: config.GITHUB_APP_ID || '',
    GITHUB_APP_PRIVATE_KEY: config.GITHUB_APP_PRIVATE_KEY || '',
    GITHUB_APP_CLIENT_ID: config.GITHUB_APP_CLIENT_ID || '',
    GITHUB_APP_CLIENT_SECRET: config.GITHUB_APP_CLIENT_SECRET || '',
    GITHUB_APP_SLUG: config.GITHUB_APP_SLUG || '',
    GITHUB_CLIENT_ID: config.GITHUB_CLIENT_ID || '',
    GITHUB_CLIENT_SECRET: config.GITHUB_CLIENT_SECRET || '',
    GITHUB_WEBHOOK_SECRET: config.GITHUB_WEBHOOK_SECRET || '',
    DATABASE_URL: config.DATABASE_URL || '',
    ENCRYPTION_KEY: config.ENCRYPTION_KEY || '',
    INNGEST_EVENT_KEY: config.INNGEST_EVENT_KEY || '',
    INNGEST_SIGNING_KEY: config.INNGEST_SIGNING_KEY || '',
    INNGEST_ENV: config.INNGEST_ENV || 'main',
    BETTER_AUTH_SECRET: config.BETTER_AUTH_SECRET || '',
    BETTER_AUTH_URL: config.BETTER_AUTH_URL || '',
    NEXT_PUBLIC_APP_URL: config.NEXT_PUBLIC_APP_URL || '',
  };
}

// Use a more robust caching mechanism that works across different contexts
declare global {
  var __starsling_env_cache: EnvironmentConfig | undefined;
}

function getCachedEnv(): EnvironmentConfig | null {
  try {
    // Try to get from global cache first
    if (typeof globalThis !== 'undefined' && globalThis.__starsling_env_cache) {
      return globalThis.__starsling_env_cache;
    }

    // Fallback to module-level cache
    return null;
  } catch {
    return null;
  }
}

function setCachedEnv(env: EnvironmentConfig): void {
  try {
    if (typeof globalThis !== 'undefined') {
      globalThis.__starsling_env_cache = env;
    }
  } catch {
    // Ignore errors in caching
  }
}

export function getEnv(): EnvironmentConfig {
  // Check cache first
  const cached = getCachedEnv();
  if (cached) {
    return cached;
  }

  // Validate and cache
  const validatedEnv = validateEnvironment();
  setCachedEnv(validatedEnv);

  return validatedEnv;
}

// Export the validated environment (backward compatibility)
export const env = getEnv();
