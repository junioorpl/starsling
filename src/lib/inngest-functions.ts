import { eq, sql } from 'drizzle-orm';

import { db } from './db';
import { integrationInstallations, issues, repositories } from './db/schema';
import { inngest } from './inngest';
import { logger } from './logger';

export const inngestFunctions = [
  // Handle GitHub App installation
  inngest.createFunction(
    { id: 'github-app-installed' },
    { event: 'github/app.installed' },
    async ({ event, step }) => {
      const {
        installationId,
        accountId,
        accountType,
        accountLogin,
        organizationId,
      } = event.data;

      await step.run('log-installation', async () => {
        logger.info('GitHub App installed for organization', {
          organizationId,
          installationId,
          accountId,
          accountType,
          accountLogin,
        });
      });

      // You can add additional processing here, such as:
      // - Fetching repository data
      // - Setting up webhooks
      // - Initializing integrations
    }
  ),

  // Handle GitHub App uninstallation
  inngest.createFunction(
    { id: 'github-app-uninstalled' },
    { event: 'github/app.uninstalled' },
    async ({ event, step }) => {
      const { installationId, organizationId } = event.data;

      await step.run('log-uninstallation', async () => {
        logger.info('GitHub App uninstalled for organization', {
          organizationId,
          installationId,
        });
      });

      // Additional cleanup can be added here
    }
  ),

  // Handle installation repositories events
  inngest.createFunction(
    { id: 'github-installation-repositories' },
    { event: 'github/installation.repositories' },
    async ({ event, step }) => {
      const {
        action,
        installationId,
        organizationId,
        repositoriesAdded,
        repositoriesRemoved,
        repositorySelection,
      } = event.data;

      await step.run('process-repositories-change', async () => {
        logger.info('Installation repositories changed', {
          action,
          installationId,
          organizationId,
          repositoriesAdded: repositoriesAdded.length,
          repositoriesRemoved: repositoriesRemoved.length,
          repositorySelection,
        });

        // Process repository changes
        // This could include:
        // - Updating database records
        // - Setting up repository-specific webhooks
        // - Notifying users about changes
        // - Updating permissions
      });
    }
  ),

  // Handle issue events
  inngest.createFunction(
    { id: 'github-issues-opened' },
    { event: 'github/issues.opened' },
    async ({ event, step }) => {
      const { installationId, issue, repository } = event.data;

      await step.run('process-issue-opened', async () => {
        logger.info('Issue opened in repository', {
          repository: repository.full_name,
          issueNumber: issue.number,
          title: issue.title,
          installationId,
        });

        await ingestIssue(installationId, issue, repository, 'opened');
      });
    }
  ),

  inngest.createFunction(
    { id: 'github-issues-closed' },
    { event: 'github/issues.closed' },
    async ({ event, step }) => {
      const { installationId, issue, repository } = event.data;

      await step.run('process-issue-closed', async () => {
        logger.info('Issue closed in repository', {
          repository: repository.full_name,
          issueNumber: issue.number,
          title: issue.title,
          installationId,
        });

        await ingestIssue(installationId, issue, repository, 'closed');
      });
    }
  ),

  inngest.createFunction(
    { id: 'github-issues-edited' },
    { event: 'github/issues.edited' },
    async ({ event, step }) => {
      const { installationId, issue, repository } = event.data;

      await step.run('process-issue-edited', async () => {
        logger.info('Issue edited in repository', {
          repository: repository.full_name,
          issueNumber: issue.number,
          title: issue.title,
          installationId,
        });

        await ingestIssue(installationId, issue, repository, 'edited');
      });
    }
  ),

  inngest.createFunction(
    { id: 'github-issues-reopened' },
    { event: 'github/issues.reopened' },
    async ({ event, step }) => {
      const { installationId, issue, repository } = event.data;

      await step.run('process-issue-reopened', async () => {
        logger.info('Issue reopened in repository', {
          repository: repository.full_name,
          issueNumber: issue.number,
          title: issue.title,
          installationId,
        });

        await ingestIssue(installationId, issue, repository, 'reopened');
      });
    }
  ),
];

// Helper function to ingest or update issues
async function ingestIssue(
  installationId: number,
  issue: {
    id: number;
    number: number;
    title: string;
    body?: string;
    state: string;
    locked?: boolean;
    user?: { login: string };
    author_association?: string;
    assignees?: Array<{ login: string }>;
    labels?: Array<{ name: string }>;
    milestone?: { title: string };
    comments?: number;
    reactions?: { total_count: number };
    url: string;
    html_url: string;
    closed_at?: string;
    created_at: string;
    updated_at: string;
    pull_request?: {
      url: string;
      html_url: string;
      diff_url: string;
      patch_url: string;
    };
  },
  repository: {
    id: number;
    name: string;
    full_name: string;
    description?: string;
    private: boolean;
    url: string;
    clone_url?: string;
    default_branch?: string;
    language?: string;
    topics?: string[];
    size?: number;
    stargazers_count?: number;
    watchers_count?: number;
    forks_count?: number;
    open_issues_count?: number;
    has_issues?: boolean;
    has_projects?: boolean;
    has_wiki?: boolean;
    has_pages?: boolean;
    archived?: boolean;
    disabled?: boolean;
  },
  action: 'opened' | 'closed' | 'edited' | 'reopened'
) {
  try {
    // Find the organization associated with this installation
    const installations = await db
      .select()
      .from(integrationInstallations)
      .where(
        sql`${integrationInstallations.metadata}->>'installationId' = ${installationId.toString()}`
      )
      .limit(1);

    if (installations.length === 0) {
      logger.warn('No matching installation found for issue event', {
        installationId,
        repository: repository.full_name,
        issueNumber: issue.number,
      });
      return;
    }

    const organizationId = installations[0].organizationId;

    // Find or create repository record
    let repositoryRecord = await db
      .select()
      .from(repositories)
      .where(eq(repositories.githubId, repository.id.toString()))
      .limit(1);

    if (repositoryRecord.length === 0) {
      // Create repository record
      const newRepo = await db
        .insert(repositories)
        .values({
          organizationId,
          githubId: repository.id.toString(),
          name: repository.name,
          fullName: repository.full_name,
          description: repository.description,
          private: repository.private,
          url: repository.url,
          cloneUrl: repository.clone_url,
          defaultBranch: repository.default_branch || 'main',
          language: repository.language,
          topics: repository.topics || [],
          metadata: {
            size: repository.size,
            stargazersCount: repository.stargazers_count,
            watchersCount: repository.watchers_count,
            forksCount: repository.forks_count,
            openIssuesCount: repository.open_issues_count,
            hasIssues: repository.has_issues,
            hasProjects: repository.has_projects,
            hasWiki: repository.has_wiki,
            hasPages: repository.has_pages,
            archived: repository.archived,
            disabled: repository.disabled,
          },
        })
        .returning();

      repositoryRecord = newRepo;
    }

    const repoId = repositoryRecord[0].id;

    // Check if issue already exists
    const existingIssue = await db
      .select()
      .from(issues)
      .where(eq(issues.githubId, issue.id.toString()))
      .limit(1);

    const issueData = {
      organizationId,
      repositoryId: repoId,
      githubId: issue.id.toString(),
      number: issue.number.toString(),
      title: issue.title,
      body: issue.body,
      state: issue.state,
      locked: issue.locked || false,
      author: issue.user?.login || 'unknown',
      authorAssociation: issue.author_association,
      assignees: issue.assignees?.map(assignee => assignee.login) || [],
      labels: issue.labels?.map(label => label.name) || [],
      milestone: issue.milestone?.title || null,
      commentsCount: issue.comments?.toString() || '0',
      reactionsCount: issue.reactions?.total_count?.toString() || '0',
      url: issue.url,
      htmlUrl: issue.html_url,
      apiUrl: issue.url,
      metadata: {
        pullRequest: issue.pull_request
          ? {
              url: issue.pull_request.url,
              htmlUrl: issue.pull_request.html_url,
              diffUrl: issue.pull_request.diff_url,
              patchUrl: issue.pull_request.patch_url,
            }
          : undefined,
        closedAt: issue.closed_at,
        createdAt: issue.created_at,
        updatedAt: issue.updated_at,
      },
    };

    if (existingIssue.length > 0) {
      // Update existing issue
      await db
        .update(issues)
        .set({
          ...issueData,
          updatedAt: new Date(),
        })
        .where(eq(issues.githubId, issue.id.toString()));

      logger.info('Updated existing issue', {
        githubId: issue.id,
        number: issue.number,
        title: issue.title,
        action,
      });
    } else {
      // Create new issue
      await db.insert(issues).values(issueData);

      logger.info('Created new issue', {
        githubId: issue.id,
        number: issue.number,
        title: issue.title,
        action,
      });
    }
  } catch (error) {
    logger.error(
      'Failed to ingest issue',
      {
        installationId,
        repository: repository.full_name,
        issueNumber: issue.number,
        action,
      },
      error as Error
    );
    throw error;
  }
}
