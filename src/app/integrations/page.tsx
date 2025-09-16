import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { integrationInstallations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { createGitHubApp } from '@/lib/github';
import GitHubIntegrationCard from '@/components/GitHubIntegrationCard';
import { PageLayout } from '@/components/layout/PageLayout';
import { Container } from '@/components/layout/Container';
import { PageHeader } from '@/components/layout/PageHeader';
import { AuthGuard } from '@/components/layout/AuthGuard';

const IntegrationsPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return <AuthGuard requireAuth={true}>{null}</AuthGuard>;
  }

  // For this demo, we'll use the user ID as organization ID
  // In a real app, you'd have proper organization management
  const organizationId = session.user.id;

  // Get existing GitHub integration
  const existingIntegration = await db
    .select()
    .from(integrationInstallations)
    .where(eq(integrationInstallations.organizationId, organizationId))
    .limit(1);

  let integrationStatus = null;
  if (existingIntegration.length > 0) {
    const integration = existingIntegration[0];
    try {
      // Verify the integration is still valid by checking with GitHub
      const githubApp = createGitHubApp();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const installationId = (integration.metadata as any)?.installationId;

      if (installationId) {
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
        };
      }
    } catch (error) {
      console.error('Error verifying GitHub integration:', error);
      integrationStatus = {
        connected: false,
        error: 'Failed to verify integration',
      };
    }
  }

  return (
    <PageLayout background="gray">
      <Container className="py-8">
        <PageHeader
          title="Integrations"
          description="Connect your tools and services to automate your DevOps workflows."
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <GitHubIntegrationCard
            status={integrationStatus}
            organizationId={organizationId}
          />
        </div>
      </Container>
    </PageLayout>
  );
};

export default IntegrationsPage;
