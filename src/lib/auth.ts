import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

import { db } from './db';
import { account, session, user, verification } from './db/schema';
import { getEnv } from './env';
import { logger } from './logger';

let auth: ReturnType<typeof betterAuth>;

try {
  const env = getEnv();
  auth = betterAuth({
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema: {
        user,
        session,
        account,
        verification,
      },
    }),
    emailAndPassword: {
      enabled: false,
    },
    socialProviders: {
      github: {
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
    },
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
  });

  logger.info('BetterAuth initialized successfully');
} catch (error) {
  logger.error('Failed to initialize BetterAuth', {}, error as Error);
  throw new Error('Authentication initialization failed');
}

export { auth };
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
