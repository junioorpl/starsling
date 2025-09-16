import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { integrationInstallations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createGitHubApp } from "@/lib/github";
import GitHubIntegrationCard from "@/components/GitHubIntegrationCard";
import Link from "next/link";

export default async function IntegrationsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Authentication Required
          </h1>
          <p className="text-gray-600 mb-4">
            Please sign in to view your integrations.
          </p>
          <Link
            href="/api/auth/sign-in/github"
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            Sign in with GitHub
          </Link>
        </div>
      </div>
    );
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
      console.error("Error verifying GitHub integration:", error);
      integrationStatus = {
        connected: false,
        error: "Failed to verify integration",
      };
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Integrations
          </h1>
          <p className="text-gray-600">
            Connect your tools and services to automate your DevOps workflows.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <GitHubIntegrationCard
            status={integrationStatus}
            organizationId={organizationId}
          />
        </div>
      </div>
    </div>
  );
}
