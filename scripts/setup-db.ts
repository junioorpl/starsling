import { db } from '../src/lib/db';
import { integrationInstallations } from '../src/lib/db/schema';

async function setupDatabase() {
  try {
    // eslint-disable-next-line no-console
    console.log('Setting up database...');

    // Test database connection
    await db.select().from(integrationInstallations).limit(1);

    // eslint-disable-next-line no-console
    console.log('✅ Database connection successful');
    // eslint-disable-next-line no-console
    console.log('✅ Database setup complete');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();
