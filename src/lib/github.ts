import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';
import { createHmac, timingSafeEqual } from 'crypto';

// GitHub App authentication
export function createGitHubApp() {
  return new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: process.env.GITHUB_APP_ID!,
      privateKey: process.env.GITHUB_APP_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      clientId: process.env.GITHUB_APP_CLIENT_ID!,
      clientSecret: process.env.GITHUB_APP_CLIENT_SECRET!,
    },
  });
}

// GitHub OAuth App for user authentication
export function createGitHubOAuthApp() {
  return new Octokit({
    auth: process.env.GITHUB_CLIENT_SECRET,
  });
}

// Verify webhook signature
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  const expectedSignatureWithPrefix = `sha256=${expectedSignature}`;

  return timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignatureWithPrefix)
  );
}
