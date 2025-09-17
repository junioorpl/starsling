import { createHmac, timingSafeEqual } from 'crypto';

import { createAppAuth } from '@octokit/auth-app';
import { Octokit } from '@octokit/rest';

import { getEnv } from './env';
import { logger } from './logger';
import { GitHubAPIError, ValidationError } from './types';

// GitHub App authentication (for organization-level features)
export function createGitHubApp(): Octokit {
  try {
    const env = getEnv();
    return new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId: env.GITHUB_APP_ID,
        privateKey: env.GITHUB_APP_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientId: env.GITHUB_APP_CLIENT_ID,
        clientSecret: env.GITHUB_APP_CLIENT_SECRET,
      },
    });
  } catch (error) {
    logger.error('Failed to create GitHub App instance', {}, error as Error);
    throw new GitHubAPIError('Failed to initialize GitHub App');
  }
}

// Verify webhook signature
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    if (!payload || !signature || !secret) {
      logger.warn(
        'Missing required parameters for webhook signature verification',
        {
          hasPayload: !!payload,
          hasSignature: !!signature,
          hasSecret: !!secret,
        }
      );
      return false;
    }

    const expectedSignature = createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    const expectedSignatureWithPrefix = `sha256=${expectedSignature}`;

    // Ensure both signatures are the same length for timingSafeEqual
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignatureWithPrefix);

    if (signatureBuffer.length !== expectedBuffer.length) {
      logger.warn('Signature length mismatch', {
        signatureLength: signatureBuffer.length,
        expectedLength: expectedBuffer.length,
        signature: `${signature.substring(0, 20)}...`,
        expected: `${expectedSignatureWithPrefix.substring(0, 20)}...`,
      });
      return false;
    }

    return timingSafeEqual(signatureBuffer, expectedBuffer);
  } catch (error) {
    logger.error('Failed to verify webhook signature', {}, error as Error);
    return false;
  }
}

// Get installation access token for GitHub App
export async function getInstallationAccessToken(
  installationId: number
): Promise<string> {
  try {
    if (!Number.isInteger(installationId) || installationId <= 0) {
      throw new ValidationError('Invalid installation ID');
    }

    const githubApp = createGitHubApp();
    const response = await githubApp.rest.apps.createInstallationAccessToken({
      installation_id: installationId,
    });

    if (!response.data.token) {
      throw new GitHubAPIError('No token returned from GitHub API');
    }

    return response.data.token;
  } catch (error) {
    logger.error(
      'Failed to get installation access token',
      { installationId },
      error as Error
    );
    if (error instanceof ValidationError || error instanceof GitHubAPIError) {
      throw error;
    }
    throw new GitHubAPIError('Failed to get installation access token');
  }
}

// List GitHub App installations
export async function listInstallations(): Promise<
  Array<{
    id: number;
    account: {
      id: number;
      login: string;
      type: string;
    } | null;
    permissions: Record<string, string>;
    events: string[];
  }>
> {
  try {
    const githubApp = createGitHubApp();
    const response = await githubApp.rest.apps.listInstallations();

    // Check if response.data exists and is an array
    if (!response.data || !Array.isArray(response.data)) {
      logger.warn('Unexpected response structure from GitHub API', {
        hasData: !!response.data,
        dataType: typeof response.data,
        responseKeys: response.data ? Object.keys(response.data) : [],
      });
      return [];
    }

    return response.data.map(
      (installation: {
        id: number;
        account?: {
          id: number;
          login: string;
          type: string;
        } | null;
        permissions?: Record<string, string>;
        events?: string[];
      }) => ({
        id: installation.id,
        account: installation.account
          ? {
              id: installation.account.id,
              login: installation.account.login,
              type: installation.account.type,
            }
          : null,
        permissions: installation.permissions || {},
        events: installation.events || [],
      })
    );
  } catch (error) {
    logger.error('Failed to list GitHub App installations', {}, error as Error);
    if (error instanceof GitHubAPIError) {
      throw error;
    }
    throw new GitHubAPIError('Failed to list GitHub App installations');
  }
}
