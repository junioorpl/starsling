import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { integrationInstallations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { createGitHubApp, getGitHubUserProfile, getGitHubUserOrganizations } from '@/lib/github';
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

  // Get BetterAuth GitHub integration status
  let betterAuthGitHubStatus = null;
  try {
    const githubProfile = await getGitHubUserProfile(session);
    const githubOrgs = await getGitHubUserOrganizations(session);
    
    betterAuthGitHubStatus = {
      connected: true,
      accountLogin: githubProfile.login,
      accountType: githubProfile.type,
      organizations: githubOrgs.map(org => ({
        id: org.id,
        login: org.login,
        type: org.type,
      })),
    };
  } catch (error) {
    console.error('Error getting BetterAuth GitHub status:', error);
    betterAuthGitHubStatus = {
      connected: false,
      error: 'Failed to get GitHub profile',
    };
  }

  // Get existing GitHub App integration
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

        <div className="space-y-6">
          {/* BetterAuth GitHub Integration Status */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-900 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">BetterAuth GitHub</h3>
                  <p className="text-sm text-gray-500">User authentication via BetterAuth</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">Connected</span>
              </div>
            </div>
            
            {betterAuthGitHubStatus?.connected ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-800 mb-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">BetterAuth GitHub Connected</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Authenticated as {betterAuthGitHubStatus.accountLogin} ({betterAuthGitHubStatus.accountType})
                  </p>
                </div>

                {betterAuthGitHubStatus.organizations && betterAuthGitHubStatus.organizations.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-900">Your Organizations:</h4>
                    <div className="flex flex-wrap gap-2">
                      {betterAuthGitHubStatus.organizations.map((org) => (
                        <span
                          key={org.id}
                          className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                        >
                          {org.login} ({org.type})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-800 mb-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">BetterAuth GitHub Error</span>
                </div>
                <p className="text-sm text-red-700">{betterAuthGitHubStatus?.error}</p>
              </div>
            )}
          </div>

          {/* GitHub App Integration */}
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
