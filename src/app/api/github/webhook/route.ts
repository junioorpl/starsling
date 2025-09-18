import { eq, sql } from 'drizzle-orm';
import { NextResponse, type NextRequest } from 'next/server';

import { db } from '@/lib/db';
import { integrationInstallations } from '@/lib/db/schema';
import { verifyWebhookSignature } from '@/lib/github';
import { inngest } from '@/lib/inngest';
import { logger } from '@/lib/logger';
import {
  ValidationError,
  type GitHubWebhookInstallationPayload,
  type GitHubWebhookInstallationRepositoriesPayload,
  type GitHubWebhookIssuePayload,
  type GitHubWebhookPingPayload,
} from '@/lib/types';

import { getEnv } from '../../../../lib/env';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-hub-signature-256');
    const event = request.headers.get('x-github-event');

    if (!signature) {
      logger.warn('Webhook request missing signature');
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    if (!event) {
      logger.warn('Webhook request missing event type');
      return NextResponse.json(
        { error: 'Missing event type' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const env = getEnv();
    const isValid = verifyWebhookSignature(
      body,
      signature,
      env.GITHUB_WEBHOOK_SECRET
    );

    if (!isValid) {
      logger.warn('Invalid webhook signature', { event });
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse and validate payload
    let payload: unknown;
    try {
      payload = JSON.parse(body);
    } catch (error) {
      logger.warn('Failed to parse webhook payload', {
        event,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    logger.info('Processing webhook event', { event });

    switch (event) {
      case 'ping':
        await handlePingEvent(payload as GitHubWebhookPingPayload);
        break;

      case 'installation':
        await handleInstallationEvent(
          payload as GitHubWebhookInstallationPayload
        );
        break;

      case 'installation_repositories':
        await handleInstallationRepositoriesEvent(
          payload as GitHubWebhookInstallationRepositoriesPayload
        );
        break;

      case 'issues':
        await handleIssuesEvent(payload as GitHubWebhookIssuePayload);
        break;

      default:
        logger.info('Unhandled webhook event', { event });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Webhook processing error', {}, error as Error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}

async function handlePingEvent(payload: GitHubWebhookPingPayload) {
  try {
    logger.info('Received GitHub webhook ping', {
      hookId: payload.hook_id,
      zen: payload.zen,
      events: payload.hook.events,
    });

    // GitHub sends ping events to verify the webhook endpoint
    // We just need to log it and return success
    return;
  } catch (error) {
    logger.error('Failed to handle ping event', {}, error as Error);
    throw error;
  }
}

async function handleInstallationRepositoriesEvent(
  payload: GitHubWebhookInstallationRepositoriesPayload
) {
  try {
    const { action, installation, repositories_added, repositories_removed } =
      payload;

    if (!installation?.id) {
      throw new ValidationError('Missing installation ID in payload');
    }

    const installationId = installation.id;

    logger.info('Processing installation repositories event', {
      action,
      installationId,
      repositoriesAdded: repositories_added?.length || 0,
      repositoriesRemoved: repositories_removed?.length || 0,
    });

    // Find the organization associated with this installation
    const installations = await db
      .select()
      .from(integrationInstallations)
      .where(
        sql`${integrationInstallations.metadata}->>'installationId' = ${installationId.toString()}`
      )
      .limit(1);

    if (installations.length === 0) {
      logger.warn('No matching installation found for repositories event', {
        installationId,
      });
      return;
    }

    const organizationId = installations[0].organizationId;

    // Send event to Inngest for processing
    await inngest.send({
      name: 'github/installation.repositories',
      data: {
        action,
        installationId,
        organizationId,
        repositoriesAdded: repositories_added || [],
        repositoriesRemoved: repositories_removed || [],
        repositorySelection: payload.repository_selection,
      },
    });

    logger.info('Sent installation repositories event to Inngest', {
      action,
      installationId,
      organizationId,
    });
  } catch (error) {
    logger.error(
      'Failed to handle installation repositories event',
      {
        action: payload?.action,
        installationId: payload?.installation?.id,
      },
      error as Error
    );
    throw error;
  }
}

async function handleInstallationEvent(
  payload: GitHubWebhookInstallationPayload
) {
  try {
    const { action, installation } = payload;

    if (!installation?.id) {
      throw new ValidationError('Missing installation ID in payload');
    }

    const installationId = installation.id;

    if (action === 'created') {
      // Handle new installation
      const accountId = installation.account?.id;
      const accountType = installation.account?.type;
      const accountLogin = installation.account?.login;

      // Find organization by installation metadata
      const installations = await db
        .select()
        .from(integrationInstallations)
        .where(
          sql`${integrationInstallations.metadata}->>'installationId' = ${installationId.toString()}`
        )
        .limit(1);

      if (installations.length > 0) {
        await inngest.send({
          name: 'github/app.installed',
          data: {
            installationId,
            accountId: accountId || 0,
            accountType: accountType || 'User',
            accountLogin: accountLogin || '',
            organizationId: installations[0].organizationId,
          },
        });

        logger.info('Sent installation event to Inngest', {
          installationId,
          organizationId: installations[0].organizationId,
        });
      } else {
        logger.warn('No matching installation found for webhook', {
          installationId,
        });
      }
    } else if (action === 'deleted') {
      // Handle uninstallation
      const installations = await db
        .select()
        .from(integrationInstallations)
        .where(
          sql`${integrationInstallations.metadata}->>'installationId' = ${installationId.toString()}`
        )
        .limit(1);

      if (installations.length > 0) {
        await db
          .delete(integrationInstallations)
          .where(eq(integrationInstallations.id, installations[0].id));

        await inngest.send({
          name: 'github/app.uninstalled',
          data: {
            installationId,
            organizationId: installations[0].organizationId,
          },
        });

        logger.info('Processed installation deletion', {
          installationId,
          organizationId: installations[0].organizationId,
        });
      } else {
        logger.warn('No matching installation found for deletion', {
          installationId,
        });
      }
    }
  } catch (error) {
    logger.error(
      'Failed to handle installation event',
      {
        action: payload?.action,
        installationId: payload?.installation?.id,
      },
      error as Error
    );
    throw error;
  }
}

async function handleIssuesEvent(payload: GitHubWebhookIssuePayload) {
  try {
    const { action, issue, repository, installation } = payload;

    if (!['opened', 'closed', 'edited', 'reopened'].includes(action)) {
      logger.info('Ignoring issue event action', { action });
      return;
    }

    if (!issue || !repository) {
      throw new ValidationError('Missing issue or repository data in payload');
    }

    const installationId = installation?.id;
    if (!installationId) {
      logger.warn('No installation ID in issues event', { action });
      return;
    }

    await inngest.send({
      name: `github/issues.${action}` as
        | 'github/issues.opened'
        | 'github/issues.closed'
        | 'github/issues.edited'
        | 'github/issues.reopened',
      data: {
        installationId,
        issue,
        repository,
      },
    });

    logger.info('Sent issue event to Inngest', {
      action,
      installationId,
      issueNumber: issue.number,
    });
  } catch (error) {
    logger.error(
      'Failed to handle issues event',
      {
        action: payload?.action,
        installationId: payload?.installation?.id,
      },
      error as Error
    );
    throw error;
  }
}
