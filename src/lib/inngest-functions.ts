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

        // Process the issue event
        // This could include:
        // - Creating database records
        // - Sending notifications
        // - Updating status
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

        // Process the issue closed event
      });
    }
  ),
];
