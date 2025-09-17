import { createAuthClient } from 'better-auth/react';

import { getEnv } from './env';
import { logger } from './logger';

let authClient: ReturnType<typeof createAuthClient>;

try {
  const env = getEnv();
  authClient = createAuthClient({
    baseURL: env.NEXT_PUBLIC_APP_URL,
  });
  logger.info('Auth client initialized successfully');
} catch (error) {
  logger.error('Failed to initialize auth client', {}, error as Error);
  throw new Error('Auth client initialization failed');
}

export { authClient };
