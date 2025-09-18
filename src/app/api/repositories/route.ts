import { eq } from 'drizzle-orm';
import { NextResponse, type NextRequest } from 'next/server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { organizations, repositories } from '@/lib/db/schema';
import { logger } from '@/lib/logger';
import { getUserOrganizationRole } from '@/lib/organization';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    // Verify user has access to this organization
    const userRole = await getUserOrganizationRole(
      session.user.id,
      organizationId
    );
    if (!userRole) {
      return NextResponse.json(
        { error: 'Access denied to this organization' },
        { status: 403 }
      );
    }

    // Get repositories for the organization
    const repositoriesData = await db
      .select({
        id: repositories.id,
        githubId: repositories.githubId,
        name: repositories.name,
        fullName: repositories.fullName,
        description: repositories.description,
        private: repositories.private,
        url: repositories.url,
        language: repositories.language,
        topics: repositories.topics,
        metadata: repositories.metadata,
        createdAt: repositories.createdAt,
        updatedAt: repositories.updatedAt,
        organization: {
          id: organizations.id,
          name: organizations.name,
          slug: organizations.slug,
        },
      })
      .from(repositories)
      .innerJoin(
        organizations,
        eq(repositories.organizationId, organizations.id)
      )
      .where(eq(repositories.organizationId, organizationId))
      .orderBy(repositories.name);

    logger.info('Fetched repositories', {
      userId: session.user.id,
      organizationId,
      count: repositoriesData.length,
    });

    return NextResponse.json({
      repositories: repositoriesData,
    });
  } catch (error) {
    logger.error('Failed to fetch repositories', {}, error as Error);
    return NextResponse.json(
      { error: 'Failed to fetch repositories' },
      { status: 500 }
    );
  }
}
