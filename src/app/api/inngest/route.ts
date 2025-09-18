import { serve } from 'inngest/next';

import { inngest } from '@/lib/inngest';
import { inngestFunctions } from '@/lib/inngest-functions';
import { logger } from '@/lib/logger';

// Configure serve based on environment
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// For local development, we need to disable authentication
// For production, we need the signing key for Inngest Cloud
const serveConfig: {
  client: typeof inngest;
  functions: typeof inngestFunctions;
  streaming: 'force';
  branch: string;
  signingKey?: string;
} = {
  client: inngest,
  functions: inngestFunctions,
  // Add streaming support for better performance on Vercel
  streaming: 'force' as const,
  // Set branch name from INNGEST_ENV environment variable
  branch: process.env.INNGEST_ENV || 'main',
};

// Only add signing key in production for Inngest Cloud authentication
// For local development, we don't want any signing key
if (isProduction && process.env.INNGEST_SIGNING_KEY) {
  serveConfig.signingKey = process.env.INNGEST_SIGNING_KEY;
}

// For local development, we don't add any authentication
// This should allow the local Inngest dev server to handle authentication

// Log configuration for debugging
if (isDevelopment) {
  logger.info(
    'Inngest serve configured for local development (no authentication)',
    {
      inngestEnv: process.env.INNGEST_ENV,
      branch: serveConfig.branch,
    }
  );
} else if (isProduction) {
  logger.info(
    'Inngest serve configured for production with Inngest Cloud authentication'
  );
}

export const { GET, POST, PUT } = serve(serveConfig);
