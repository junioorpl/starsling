import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { getEnv } from '../env';
import { logger } from '../logger';

import * as schema from './schema';

let pool: Pool;
let db: ReturnType<typeof drizzle>;

try {
  const env = getEnv();
  pool = new Pool({
    connectionString: env.DATABASE_URL,
  });

  db = drizzle(pool, { schema });
  logger.info('Database connection initialized successfully');
} catch (error) {
  logger.error('Failed to initialize database connection', {}, error as Error);
  throw new Error('Database initialization failed');
}

export { db };
