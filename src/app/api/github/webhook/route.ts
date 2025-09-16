import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/github';
import { inngest } from '@/lib/inngest';
import { db } from '@/lib/db';
import { integrationInstallations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('x-hub-signature-256');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
  }

  // Verify webhook signature
  const isValid = verifyWebhookSignature(
    body,
    signature,
    process.env.GITHUB_WEBHOOK_SECRET!
  );

  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = request.headers.get('x-github-event');
  const payload = JSON.parse(body);

  try {
    switch (event) {
      case 'installation':
        if (payload.action === 'created') {
          // Handle new installation
          const installationId = payload.installation.id;
          const accountId = payload.installation.account?.id;
          const accountType = payload.installation.account?.type;
          const accountLogin = payload.installation.account?.login;

          // Find organization by installation metadata
          const installation = await db
            .select()
            .from(integrationInstallations)
            .where(eq(integrationInstallations.metadata, { installationId }))
            .limit(1);

          if (installation.length > 0) {
            await inngest.send({
              name: 'github/app.installed',
              data: {
                installationId,
                accountId: accountId || 0,
                accountType: accountType || 'User',
                accountLogin: accountLogin || '',
                organizationId: installation[0].organizationId,
              },
            });
          }
        } else if (payload.action === 'deleted') {
          // Handle uninstallation
          const installationId = payload.installation.id;

          // Find and remove installation
          const installation = await db
            .select()
            .from(integrationInstallations)
            .where(eq(integrationInstallations.metadata, { installationId }))
            .limit(1);

          if (installation.length > 0) {
            await db
              .delete(integrationInstallations)
              .where(eq(integrationInstallations.id, installation[0].id));

            await inngest.send({
              name: 'github/app.uninstalled',
              data: {
                installationId,
                organizationId: installation[0].organizationId,
              },
            });
          }
        }
        break;

      case 'issues':
        if (payload.action === 'opened' || payload.action === 'closed') {
          const installationId = payload.installation?.id;
          const issue = payload.issue;
          const repository = payload.repository;

          if (installationId) {
            await inngest.send({
              name: `github/issues.${payload.action}` as
                | 'github/issues.opened'
                | 'github/issues.closed',
              data: {
                installationId,
                issue,
                repository,
              },
            });
          }
        }
        break;

      default:
        console.log(`Unhandled event: ${event}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}
