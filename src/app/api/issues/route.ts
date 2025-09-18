import { desc, eq, sql } from 'drizzle-orm';
import { NextResponse, type NextRequest } from 'next/server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { issues, organizations, repositories } from '@/lib/db/schema';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const state = searchParams.get('state') || 'all';
    const repositoryId = searchParams.get('repositoryId');
    const organizationId = searchParams.get('organizationId');

    const offset = (page - 1) * limit;

    // Build query conditions
    let whereConditions = sql`1=1`;

    // Filter by organization if specified
    if (organizationId) {
      whereConditions = sql`${whereConditions} AND ${issues.organizationId} = ${organizationId}`;
    }

    // Filter by repository if specified
    if (repositoryId) {
      whereConditions = sql`${whereConditions} AND ${issues.repositoryId} = ${repositoryId}`;
    }

    // Filter by state
    if (state !== 'all') {
      whereConditions = sql`${whereConditions} AND ${issues.state} = ${state}`;
    }

    // Get issues with repository and organization info
    const issuesData = await db
      .select({
        id: issues.id,
        githubId: issues.githubId,
        number: issues.number,
        title: issues.title,
        body: issues.body,
        state: issues.state,
        locked: issues.locked,
        author: issues.author,
        authorAssociation: issues.authorAssociation,
        assignees: issues.assignees,
        labels: issues.labels,
        milestone: issues.milestone,
        commentsCount: issues.commentsCount,
        reactionsCount: issues.reactionsCount,
        url: issues.url,
        htmlUrl: issues.htmlUrl,
        metadata: issues.metadata,
        createdAt: issues.createdAt,
        updatedAt: issues.updatedAt,
        repository: {
          id: repositories.id,
          name: repositories.name,
          fullName: repositories.fullName,
          language: repositories.language,
        },
        organization: {
          id: organizations.id,
          name: organizations.name,
          slug: organizations.slug,
        },
      })
      .from(issues)
      .innerJoin(repositories, eq(issues.repositoryId, repositories.id))
      .innerJoin(organizations, eq(issues.organizationId, organizations.id))
      .where(whereConditions)
      .orderBy(desc(issues.updatedAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(issues)
      .where(whereConditions);

    const totalCount = totalCountResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    logger.info('Fetched issues', {
      userId: session.user.id,
      count: issuesData.length,
      page,
      limit,
      state,
      organizationId,
      repositoryId,
    });

    return NextResponse.json({
      issues: issuesData,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    logger.error('Failed to fetch issues', {}, error as Error);
    return NextResponse.json(
      { error: 'Failed to fetch issues' },
      { status: 500 }
    );
  }
}
