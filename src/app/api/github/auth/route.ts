import { headers } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { getOrCreateDefaultOrganization } from '@/lib/organization';

import { getEnv } from '../../../../lib/env';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      logger.warn('Unauthenticated access attempt to GitHub auth endpoint');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Get or create a default organization for the user
    const organization = await getOrCreateDefaultOrganization(session.user.id);
    const organizationId = organization.id;

    // Generate state parameter for GitHub App installation flow
    const stateData = {
      organizationId,
      userId: session.user.id,
      timestamp: Date.now(),
    };

    const state = Buffer.from(JSON.stringify(stateData)).toString('base64');

    // Redirect to GitHub App installation page
    const env = getEnv();
    const githubAppInstallUrl = new URL(
      `https://github.com/apps/${env.GITHUB_APP_SLUG}/installations/new`
    );
    githubAppInstallUrl.searchParams.set('state', state);

    logger.info('Redirecting to GitHub App installation', {
      userId: session.user.id,
      organizationId,
    });

    return NextResponse.redirect(githubAppInstallUrl.toString());
  } catch (error) {
    logger.error('GitHub auth endpoint error', {}, error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
