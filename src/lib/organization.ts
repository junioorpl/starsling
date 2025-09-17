import { and, eq } from 'drizzle-orm';

import { db } from './db';
import { organizationMembers, organizations, user } from './db/schema';
import { logger } from './logger';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  createdAt: Date;
  updatedAt: Date;
}

export async function createOrganization(
  name: string,
  slug: string,
  ownerId: string,
  description?: string
): Promise<Organization> {
  try {
    // Check if slug already exists
    const existingOrg = await db
      .select()
      .from(organizations)
      .where(eq(organizations.slug, slug))
      .limit(1);

    if (existingOrg.length > 0) {
      throw new Error('Organization slug already exists');
    }

    // Create organization
    const [organization] = await db
      .insert(organizations)
      .values({
        name,
        slug,
        description,
        ownerId,
      })
      .returning();

    // Add owner as member
    await db.insert(organizationMembers).values({
      organizationId: organization.id,
      userId: ownerId,
      role: 'owner',
    });

    logger.info('Created organization', {
      organizationId: organization.id,
      name,
      slug,
      ownerId,
    });

    return organization;
  } catch (error) {
    logger.error(
      'Failed to create organization',
      { name, slug, ownerId },
      error as Error
    );
    throw error;
  }
}

export async function getOrganizationById(
  organizationId: string
): Promise<Organization | null> {
  try {
    const [organization] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, organizationId))
      .limit(1);

    return organization || null;
  } catch (error) {
    logger.error(
      'Failed to get organization by ID',
      { organizationId },
      error as Error
    );
    throw error;
  }
}

export async function getOrganizationBySlug(
  slug: string
): Promise<Organization | null> {
  try {
    const [organization] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.slug, slug))
      .limit(1);

    return organization || null;
  } catch (error) {
    logger.error(
      'Failed to get organization by slug',
      { slug },
      error as Error
    );
    throw error;
  }
}

export async function getUserOrganizations(
  userId: string
): Promise<Organization[]> {
  try {
    const userOrgs = await db
      .select({
        id: organizations.id,
        name: organizations.name,
        slug: organizations.slug,
        description: organizations.description,
        ownerId: organizations.ownerId,
        createdAt: organizations.createdAt,
        updatedAt: organizations.updatedAt,
      })
      .from(organizations)
      .innerJoin(
        organizationMembers,
        eq(organizations.id, organizationMembers.organizationId)
      )
      .where(eq(organizationMembers.userId, userId));

    return userOrgs;
  } catch (error) {
    logger.error(
      'Failed to get user organizations',
      { userId },
      error as Error
    );
    throw error;
  }
}

export async function getUserOrganizationRole(
  userId: string,
  organizationId: string
): Promise<'owner' | 'admin' | 'member' | null> {
  try {
    const [member] = await db
      .select({ role: organizationMembers.role })
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.userId, userId),
          eq(organizationMembers.organizationId, organizationId)
        )
      )
      .limit(1);

    return (member?.role as 'owner' | 'admin' | 'member') || null;
  } catch (error) {
    logger.error(
      'Failed to get user organization role',
      { userId, organizationId },
      error as Error
    );
    throw error;
  }
}

export async function addOrganizationMember(
  organizationId: string,
  userId: string,
  role: 'admin' | 'member' = 'member'
): Promise<OrganizationMember> {
  try {
    const [member] = await db
      .insert(organizationMembers)
      .values({
        organizationId,
        userId,
        role,
      })
      .returning();

    logger.info('Added organization member', {
      organizationId,
      userId,
      role,
    });

    return member;
  } catch (error) {
    logger.error(
      'Failed to add organization member',
      { organizationId, userId, role },
      error as Error
    );
    throw error;
  }
}

export async function removeOrganizationMember(
  organizationId: string,
  userId: string
): Promise<void> {
  try {
    await db
      .delete(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, organizationId),
          eq(organizationMembers.userId, userId)
        )
      );

    logger.info('Removed organization member', {
      organizationId,
      userId,
    });
  } catch (error) {
    logger.error(
      'Failed to remove organization member',
      { organizationId, userId },
      error as Error
    );
    throw error;
  }
}

export async function getOrganizationMembers(
  organizationId: string
): Promise<OrganizationMember[]> {
  try {
    const members = await db
      .select()
      .from(organizationMembers)
      .where(eq(organizationMembers.organizationId, organizationId));

    return members;
  } catch (error) {
    logger.error(
      'Failed to get organization members',
      { organizationId },
      error as Error
    );
    throw error;
  }
}

// Helper function to get or create a default organization for a user
export async function getOrCreateDefaultOrganization(
  userId: string
): Promise<Organization> {
  try {
    // First, try to get user's organizations
    const userOrgs = await getUserOrganizations(userId);

    if (userOrgs.length > 0) {
      // Return the first organization (or the one they own)
      const ownedOrg = userOrgs.find(org => org.ownerId === userId);
      return ownedOrg || userOrgs[0];
    }

    // Create a default organization for the user
    const userData = await db
      .select({ email: user.email })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    const defaultName = `Personal Organization`;
    const defaultSlug = `personal-${userId.slice(0, 8)}`;

    return await createOrganization(
      defaultName,
      defaultSlug,
      userId,
      'Personal organization'
    );
  } catch (error) {
    logger.error(
      'Failed to get or create default organization',
      { userId },
      error as Error
    );
    throw error;
  }
}
