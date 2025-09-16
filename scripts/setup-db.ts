import { db } from '../src/lib/db';
import { integrationInstallations } from '../src/lib/db/schema';

async function setupDatabase() {
  try {
    console.log('Setting up database...');

    // Test database connection
    await db.select().from(integrationInstallations).limit(1);

    console.log('✅ Database connection successful');
    console.log('✅ Database setup complete');
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();
