import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  integrationInstallations,
  issues,
  repositories,
} from '@/lib/db/schema';
import { logger } from '@/lib/logger';
import { getOrCreateDefaultOrganization } from '@/lib/organization';
import { and, count, eq, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization
    const organization = await getOrCreateDefaultOrganization(session.user.id);
    const organizationId = organization.id;

    // Get repository count
    const [repoCountResult] = await db
      .select({ count: count() })
      .from(repositories)
      .where(eq(repositories.organizationId, organizationId));

    const repositoryCount = repoCountResult?.count || 0;

    // Get issues statistics
    const [openIssuesResult] = await db
      .select({ count: count() })
      .from(issues)
      .where(
        and(eq(issues.organizationId, organizationId), eq(issues.state, 'open'))
      );

    const [closedIssuesResult] = await db
      .select({ count: count() })
      .from(issues)
      .where(
        and(
          eq(issues.organizationId, organizationId),
          eq(issues.state, 'closed')
        )
      );

    const openIssuesCount = openIssuesResult?.count || 0;
    const closedIssuesCount = closedIssuesResult?.count || 0;
    const totalIssuesCount = openIssuesCount + closedIssuesCount;

    // Get integration status
    const [integrationResult] = await db
      .select({ count: count() })
      .from(integrationInstallations)
      .where(eq(integrationInstallations.organizationId, organizationId));

    const hasIntegrations = (integrationResult?.count || 0) > 0;

    // Get recent issues (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [recentIssuesResult] = await db
      .select({ count: count() })
      .from(issues)
      .where(
        and(
          eq(issues.organizationId, organizationId),
          sql`${issues.createdAt} >= ${sevenDaysAgo.toISOString()}`
        )
      );

    const recentIssuesCount = recentIssuesResult?.count || 0;

    // Calculate issue resolution rate
    const resolutionRate =
      totalIssuesCount > 0
        ? Math.round((closedIssuesCount / totalIssuesCount) * 100)
        : 0;

    const stats = {
      repositories: {
        total: repositoryCount,
        hasData: repositoryCount > 0,
      },
      issues: {
        total: totalIssuesCount,
        open: openIssuesCount,
        closed: closedIssuesCount,
        recent: recentIssuesCount,
        resolutionRate,
        hasData: totalIssuesCount > 0,
      },
      integrations: {
        connected: hasIntegrations,
        count: integrationResult?.count || 0,
      },
      organization: {
        id: organizationId,
        name: organization.name,
        slug: organization.slug,
      },
    };

    logger.info('Fetched dashboard stats', {
      userId: session.user.id,
      organizationId,
      stats,
    });

    return NextResponse.json({ stats });
  } catch (error) {
    logger.error('Failed to fetch dashboard stats', {}, error as Error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
