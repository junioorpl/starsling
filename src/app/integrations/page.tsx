import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';

import GitHubIntegrationCard from '@/components/GitHubIntegrationCard';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { Container } from '@/components/layout/Container';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageLayout } from '@/components/layout/PageLayout';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { integrationInstallations } from '@/lib/db/schema';
import { createGitHubApp, listInstallations } from '@/lib/github';
import { logger } from '@/lib/logger';
import { getOrCreateDefaultOrganization } from '@/lib/organization';

const IntegrationsPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return <AuthGuard requireAuth={true}>{null}</AuthGuard>;
  }

  // Get or create a default organization for the user
  const organization = await getOrCreateDefaultOrganization(session.user.id);
  const organizationId = organization.id;

  // Get existing GitHub App integration
  const existingIntegration = await db
    .select()
    .from(integrationInstallations)
    .where(eq(integrationInstallations.organizationId, organizationId))
    .limit(1);

  let integrationStatus = null;
  let availableInstallations = null;

  if (existingIntegration.length > 0) {
    const integration = existingIntegration[0];
    try {
      // Verify the integration is still valid by checking with GitHub
      const githubApp = createGitHubApp();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const installationId = (integration.metadata as any)?.installationId;

      if (installationId) {
        // Validate installation ID format
        if (!Number.isInteger(installationId) || installationId <= 0) {
          logger.warn('Invalid installation ID format', {
            organizationId,
            installationId,
          });
          integrationStatus = {
            connected: false,
            error: 'Invalid installation ID',
          };
        } else {
          const installation = await githubApp.rest.apps.getInstallation({
            installation_id: installationId,
          });

          integrationStatus = {
            connected: true,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            accountLogin: (installation.data.account as any)?.login,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            accountType: (installation.data.account as any)?.type,
            permissions: installation.data.permissions,
            events: installation.data.events,
            installationId,
          };
        }
      } else {
        integrationStatus = {
          connected: false,
          error: 'No installation ID found',
        };
      }
    } catch (error) {
      logger.error(
        'Error verifying GitHub integration',
        {
          organizationId,
          installationId: integration.metadata?.installationId,
        },
        error as Error
      );

      // Check if it's a 404 error (installation not found)
      const isNotFoundError =
        error instanceof Error &&
        (error.message.includes('Not Found') || error.message.includes('404'));

      if (isNotFoundError) {
        // If installation doesn't exist, mark as disconnected and clean up
        integrationStatus = {
          connected: false,
          error: 'Installation not found - please reconnect',
        };

        // Clean up invalid integration data
        try {
          await db
            .delete(integrationInstallations)
            .where(eq(integrationInstallations.organizationId, organizationId));

          logger.info('Cleaned up invalid GitHub integration', {
            organizationId,
            installationId: integration.metadata?.installationId,
          });
        } catch (cleanupError) {
          logger.error(
            'Failed to clean up invalid integration',
            {
              organizationId,
              installationId: integration.metadata?.installationId,
            },
            cleanupError as Error
          );
        }
      } else {
        integrationStatus = {
          connected: false,
          error: 'Failed to verify integration',
        };
      }
    }
  } else {
    // No integration in database, check if there are available installations
    try {
      const installations = await listInstallations();
      if (installations.length > 0) {
        availableInstallations = installations;
        integrationStatus = {
          connected: false,
          error: 'Installation found but not synced',
          canSync: true,
        };
      }
    } catch (error) {
      logger.error(
        'Error checking for available installations',
        {
          organizationId,
        },
        error as Error
      );
      // Don't set integrationStatus here, let it remain null for disconnected state
    }
  }

  return (
    <PageLayout background="gray">
      <Container className="py-8">
        <PageHeader
          title="Integrations"
          description="Connect your tools and services to automate your DevOps workflows."
        />

        <div className="space-y-6">
          {/* GitHub App Integration */}
          <GitHubIntegrationCard
            status={integrationStatus}
            organizationId={organizationId}
            availableInstallations={availableInstallations}
          />
        </div>
      </Container>
    </PageLayout>
  );
};

export default IntegrationsPage;
