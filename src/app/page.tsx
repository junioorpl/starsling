import { headers } from 'next/headers';

import { GitHubSignInButton } from '@/components/auth/GitHubSignInButton';
import { UserWelcome } from '@/components/auth/UserWelcome';
import { IssuesList } from '@/components/issues';
import { Container } from '@/components/layout/Container';
import { Hero } from '@/components/layout/Hero';
import { PageLayout } from '@/components/layout/PageLayout';
import { auth } from '@/lib/auth';

const Home = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <PageLayout background="gradient">
      <Container className="py-16">
        <Hero
          title="Welcome to StarSling"
          description="The DevOps automation platform that helps you manage deployments, debug issues, and resolve incidents autonomously."
        >
          {session ? (
            <UserWelcome
              userName={session.user.name}
              userEmail={session.user.email}
            />
          ) : (
            <div className="space-y-4">
              <p className="text-lg text-gray-700">
                Get started by signing in with your GitHub account
              </p>
              <GitHubSignInButton />
            </div>
          )}
        </Hero>
      </Container>

      {session && (
        <Container className="py-8">
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Recent Issues
              </h2>
              <p className="text-gray-600 mb-6">
                Stay updated with the latest issues from your synced
                repositories
              </p>
              <IssuesList state="open" limit={5} />
            </div>
          </div>
        </Container>
      )}
    </PageLayout>
  );
};

export default Home;
