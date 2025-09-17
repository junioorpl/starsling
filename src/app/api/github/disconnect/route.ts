import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { integrationInstallations } from '@/lib/db/schema';
import { inngest } from '@/lib/inngest';
import { logger } from '@/lib/logger';
import { getOrCreateDefaultOrganization } from '@/lib/organization';

export async function POST(_request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      logger.warn(
        'Unauthenticated access attempt to GitHub disconnect endpoint'
      );
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get or create a default organization for the user
    const organization = await getOrCreateDefaultOrganization(session.user.id);
    const organizationId = organization.id;

    // Find the integration
    const integration = await db
      .select()
      .from(integrationInstallations)
      .where(eq(integrationInstallations.organizationId, organizationId))
      .limit(1);

    if (integration.length === 0) {
      logger.warn('Integration not found for disconnect', {
        userId: session.user.id,
        organizationId,
      });
      return NextResponse.json(
        { error: 'Integration not found' },
        { status: 404 }
      );
    }

    const installationId = integration[0].metadata?.installationId;

    // Delete the integration from database
    await db
      .delete(integrationInstallations)
      .where(eq(integrationInstallations.organizationId, organizationId));

    // Trigger uninstall event
    if (installationId) {
      await inngest.send({
        name: 'github/app.uninstalled',
        data: {
          installationId,
          organizationId,
        },
      });

      logger.info('Sent uninstall event to Inngest', {
        installationId,
        organizationId,
        userId: session.user.id,
      });
    }

    logger.info('Successfully disconnected GitHub integration', {
      organizationId,
      userId: session.user.id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error disconnecting GitHub integration', {}, error as Error);
    return NextResponse.json(
      { error: 'Failed to disconnect integration' },
      { status: 500 }
    );
  }
}
