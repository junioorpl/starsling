import { inngest } from './inngest';

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
        console.log(
          `GitHub App installed for organization ${organizationId}:`,
          {
            installationId,
            accountId,
            accountType,
            accountLogin,
          }
        );
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
        console.log(
          `GitHub App uninstalled for organization ${organizationId}:`,
          {
            installationId,
          }
        );
      });

      // Additional cleanup can be added here
    }
  ),

  // Handle issue events
  inngest.createFunction(
    { id: 'github-issues-opened' },
    { event: 'github/issues.opened' },
    async ({ event, step }) => {
      const { installationId, issue, repository } = event.data;

      await step.run('process-issue-opened', async () => {
        console.log(`Issue opened in ${repository.full_name}:`, {
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
        console.log(`Issue closed in ${repository.full_name}:`, {
          issueNumber: issue.number,
          title: issue.title,
          installationId,
        });

        // Process the issue closed event
      });
    }
  ),
];
