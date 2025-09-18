import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { integrationInstallations } from '@/lib/db/schema';
import { encrypt } from '@/lib/encryption';
import { getInstallationAccessToken, listInstallations } from '@/lib/github';
import { logger } from '@/lib/logger';
import { getOrCreateDefaultOrganization } from '@/lib/organization';

export async function POST(_request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      logger.warn('Unauthenticated access attempt to GitHub sync endpoint');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get or create a default organization for the user
    const organization = await getOrCreateDefaultOrganization(session.user.id);
    const organizationId = organization.id;

    // Check if there's already an integration for this organization
    const existingIntegration = await db
      .select()
      .from(integrationInstallations)
      .where(eq(integrationInstallations.organizationId, organizationId))
      .limit(1);

    if (existingIntegration.length > 0) {
      logger.warn('Integration already exists for organization', {
        organizationId,
        userId: session.user.id,
      });
      return NextResponse.json(
        { error: 'Integration already exists' },
        { status: 400 }
      );
    }

    // List all GitHub App installations
    const installations = await listInstallations();

    if (installations.length === 0) {
      logger.info('No GitHub App installations found', {
        organizationId,
        userId: session.user.id,
      });
      return NextResponse.json(
        { error: 'No GitHub App installations found' },
        { status: 404 }
      );
    }

    // For now, sync the first installation found
    // In the future, we could show a list and let the user choose
    const installation = installations[0];

    // Get installation access token
    const accessToken = await getInstallationAccessToken(installation.id);

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

    // Create the integration record
    await db.insert(integrationInstallations).values({
      organizationId,
      provider: 'github',
      accessToken: encryptedAccessToken,
      refreshToken: null, // GitHub App tokens don't have refresh tokens
      metadata,
    });

    logger.info('Synced GitHub App installation', {
      organizationId,
      installationId: installation.id,
      userId: session.user.id,
    });

    return NextResponse.json({
      success: true,
      installation: {
        id: installation.id,
        accountLogin: installation.account?.login,
        accountType: installation.account?.type,
      },
    });
  } catch (error) {
    logger.error('GitHub sync endpoint error', {}, error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
