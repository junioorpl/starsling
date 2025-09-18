import { headers } from 'next/headers';

import { GitHubSignInButton } from '@/components/auth/GitHubSignInButton';
import { DashboardHome } from '@/components/dashboard/DashboardHome';
import { Container } from '@/components/layout/Container';
import { Hero } from '@/components/layout/Hero';
import { PageLayout } from '@/components/layout/PageLayout';
import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { getOrCreateDefaultOrganization } from '@/lib/organization';

const Home = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Get user's organization for displaying data
  let organizationId: string | null = null;
  if (session?.user) {
    try {
      const organization = await getOrCreateDefaultOrganization(
        session.user.id
      );
      organizationId = organization.id;
    } catch (error) {
      logger.error(
        'Failed to get user organization',
        { userId: session.user.id },
        error as Error
      );
    }
  }

  // If user is logged in, show dashboard
  if (session && organizationId) {
    return (
      <DashboardHome
        organizationId={organizationId}
        userName={session.user.name || 'User'}
        userEmail={session.user.email}
      />
    );
  }

  // If user is not logged in, show landing page
  return (
    <PageLayout background="gradient" fullHeight>
      <Container className="py-16">
        <Hero
          title="Welcome to StarSling"
          description="The DevOps automation platform that helps you manage deployments, debug issues, and resolve incidents autonomously."
        >
          <div className="space-y-4">
            <p className="text-lg text-gray-700">
              Get started by signing in with your GitHub account
            </p>
            <GitHubSignInButton />
          </div>
        </Hero>
      </Container>
    </PageLayout>
  );
};

export default Home;
