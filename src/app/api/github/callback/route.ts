import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { integrationInstallations } from '@/lib/db/schema';
import { encrypt } from '@/lib/encryption';
import { createGitHubApp, getInstallationAccessToken } from '@/lib/github';
import { inngest } from '@/lib/inngest';
import { logger } from '@/lib/logger';
import { getOrCreateDefaultOrganization } from '@/lib/organization';
import { ValidationError, type GitHubInstallation } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      logger.warn('Unauthenticated access attempt to GitHub callback endpoint');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const searchParams = request.nextUrl.searchParams;
    const installation_id = searchParams.get('installation_id');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      logger.warn('GitHub installation error', {
        error,
        userId: session.user.id,
      });
      return NextResponse.redirect(
        new URL('/integrations?error=access_denied', request.url)
      );
    }

    if (!installation_id || !state) {
      logger.warn('Missing required parameters in GitHub callback', {
        hasInstallationId: !!installation_id,
        hasState: !!state,
        userId: session.user.id,
      });
      return NextResponse.redirect(
        new URL('/integrations?error=invalid_request', request.url)
      );
    }

    // Validate installation ID
    const installationId = parseInt(installation_id);
    if (!Number.isInteger(installationId) || installationId <= 0) {
      logger.warn('Invalid installation ID format', {
        installation_id,
        userId: session.user.id,
      });
      return NextResponse.redirect(
        new URL('/integrations?error=invalid_request', request.url)
      );
    }

    // Decode and validate state
    let stateData: {
      organizationId: string;
      userId: string;
      timestamp: number;
    };
    try {
      const decodedState = Buffer.from(state, 'base64').toString();
      stateData = JSON.parse(decodedState);

      // Validate state data
      if (!stateData.organizationId || !stateData.userId) {
        throw new ValidationError('Invalid state data');
      }

      // Check if state is not too old (5 minutes)
      const stateAge = Date.now() - stateData.timestamp;
      if (stateAge > 5 * 60 * 1000) {
        throw new ValidationError('State has expired');
      }

      // Verify user matches state
      if (stateData.userId !== session.user.id) {
        throw new ValidationError('User mismatch in state');
      }
    } catch (error) {
      logger.warn('Failed to decode or validate state', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: session.user.id,
      });
      return NextResponse.redirect(
        new URL('/integrations?error=invalid_request', request.url)
      );
    }

    // Get or create a default organization for the user
    const organization = await getOrCreateDefaultOrganization(session.user.id);
    const organizationId = organization.id;

    // Get installation information
    const githubApp = createGitHubApp();
    const installationResponse = await githubApp.rest.apps.getInstallation({
      installation_id: installationId,
    });

    const installation = installationResponse.data as GitHubInstallation;

    // Get installation access token
    const accessToken = await getInstallationAccessToken(installationId);

    // Encrypt the access token
    const encryptedAccessToken = await encrypt(accessToken);

    // Prepare installation metadata
    const metadata = {
      installationId: installation.id,
      accountId: installation.account?.id,
      accountType: installation.account?.type || 'Organization',
      accountLogin: installation.account?.login || '',
      permissions: installation.permissions,
      events: installation.events,
    };

    // Check if installation already exists
    const existingInstallation = await db
      .select()
      .from(integrationInstallations)
      .where(eq(integrationInstallations.organizationId, organizationId))
      .limit(1);

    if (existingInstallation.length > 0) {
      // Update existing installation
      await db
        .update(integrationInstallations)
        .set({
          accessToken: encryptedAccessToken,
          refreshToken: null, // GitHub App tokens don't have refresh tokens
          metadata,
          updatedAt: new Date(),
        })
        .where(eq(integrationInstallations.organizationId, organizationId));

      logger.info('Updated existing GitHub installation', {
        organizationId,
        installationId,
        userId: session.user.id,
      });
    } else {
      // Create new installation
      await db.insert(integrationInstallations).values({
        organizationId,
        provider: 'github',
        accessToken: encryptedAccessToken,
        refreshToken: null, // GitHub App tokens don't have refresh tokens
        metadata,
      });

      logger.info('Created new GitHub installation', {
        organizationId,
        installationId,
        userId: session.user.id,
      });
    }

    // Trigger Inngest event
    await inngest.send({
      name: 'github/app.installed',
      data: {
        installationId: installation.id,
        accountId: installation.account?.id || 0,
        accountType: installation.account?.type || 'Organization',
        accountLogin: installation.account?.login || '',
        organizationId,
      },
    });

    logger.info('Successfully processed GitHub installation callback', {
      organizationId,
      installationId,
      userId: session.user.id,
    });

    return NextResponse.redirect(
      new URL('/integrations?success=connected', request.url)
    );
  } catch (error) {
    logger.error('GitHub App installation callback error', {}, error as Error);
    return NextResponse.redirect(
      new URL('/integrations?error=callback_failed', request.url)
    );
  }
}
