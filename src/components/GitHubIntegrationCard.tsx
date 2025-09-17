'use client';

import { AlertCircle, CheckCircle, ExternalLink, Github } from 'lucide-react';
import { memo, useCallback, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { AlertModal, ConfirmModal } from '@/components/ui/Modal';

interface GitHubIntegrationCardProps {
  status: {
    connected: boolean;
    accountLogin?: string;
    accountType?: string;
    permissions?: Record<string, string>;
    events?: string[];
    error?: string;
    canSync?: boolean;
    installationId?: number;
  } | null;
  organizationId: string;
  availableInstallations?: Array<{
    id: number;
    account: {
      id: number;
      login: string;
      type: string;
    } | null;
    permissions: Record<string, string>;
    events: string[];
  }> | null;
}

const GitHubIntegrationCardComponent = ({
  status,
  organizationId,
  availableInstallations,
}: GitHubIntegrationCardProps) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Modal states
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleConnect = useCallback(async () => {
    setIsConnecting(true);
    try {
      // Redirect to GitHub App OAuth flow
      window.location.href = `/api/github/auth?organizationId=${organizationId}`;
    } catch (error) {
      // Note: In client-side components, we can't use the server logger
      // This would typically be handled by a client-side error reporting service
      // eslint-disable-next-line no-console
      console.error('Error initiating GitHub connection:', error);
      setIsConnecting(false);
    }
  }, [organizationId]);

  const handleSync = useCallback(async () => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/github/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        window.location.reload();
      } else {
        const errorData = await response.json();
        setErrorMessage(
          `Failed to sync integration: ${errorData.error || 'Unknown error'}`
        );
        setShowErrorModal(true);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error syncing GitHub integration:', error);
      setErrorMessage('Failed to sync integration');
      setShowErrorModal(true);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const handleDisconnectClick = useCallback(() => {
    setShowDisconnectModal(true);
  }, []);

  const handleDisconnectConfirm = useCallback(async () => {
    setIsDisconnecting(true);
    try {
      const response = await fetch('/api/github/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ organizationId }),
      });

      if (response.ok) {
        window.location.reload();
      } else {
        setErrorMessage('Failed to disconnect integration');
        setShowErrorModal(true);
      }
    } catch (error) {
      // Note: In client-side components, we can't use the server logger
      // This would typically be handled by a client-side error reporting service
      // eslint-disable-next-line no-console
      console.error('Error disconnecting GitHub integration:', error);
      setErrorMessage('Failed to disconnect integration');
      setShowErrorModal(true);
    } finally {
      setIsDisconnecting(false);
    }
  }, [organizationId]);

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-900 rounded-lg">
            <Github className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">GitHub</h3>
            <p className="text-sm text-gray-500">
              Connect your GitHub organization
            </p>
          </div>
        </div>

        {status?.connected ? (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Connected</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-gray-400">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">Disconnected</span>
          </div>
        )}
      </div>

      {status?.connected ? (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-800 mb-2">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">Successfully Connected</span>
            </div>
            <p className="text-sm text-green-700">
              Connected to {status.accountLogin} ({status.accountType})
            </p>
          </div>

          {status.permissions && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-900">
                Permissions:
              </h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(status.permissions).map(([key, value]) => (
                  <span
                    key={key}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                  >
                    {key}: {value as string}
                  </span>
                ))}
              </div>
            </div>
          )}

          {status.events && status.events.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-900">Events:</h4>
              <div className="flex flex-wrap gap-2">
                {status.events.map(event => (
                  <span
                    key={event}
                    className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                  >
                    {event}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              className="flex-1"
              onClick={handleDisconnectClick}
            >
              Disconnect
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a
                href={
                  status.accountType === 'Organization' && status.accountLogin
                    ? `https://github.com/organizations/${status.accountLogin}/settings/installations/${status.installationId || ''}`
                    : `https://github.com/settings/installations/${status.installationId || ''}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                Manage
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              Connect your GitHub organization to enable automated issue
              tracking, deployment management, and incident response.
            </p>
          </div>

          {status?.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-800 mb-1">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">Connection Error</span>
              </div>
              <p className="text-sm text-red-700">{status.error}</p>
            </div>
          )}

          {status?.canSync &&
            availableInstallations &&
            availableInstallations.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-800 mb-2">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">Installation Found</span>
                </div>
                <p className="text-sm text-blue-700 mb-3">
                  We found a GitHub App installation that can be synced:
                </p>
                <div className="space-y-2">
                  {availableInstallations.map(installation => (
                    <div
                      key={installation.id}
                      className="flex items-center justify-between bg-white rounded p-2"
                    >
                      <div>
                        <span className="font-medium">
                          {installation.account?.login}
                        </span>
                        <span className="text-sm text-gray-500 ml-2">
                          ({installation.account?.type})
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        ID: {installation.id}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          <div className="space-y-2">
            {status?.canSync ? (
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={handleSync}
                loading={isSyncing}
                loadingText="Syncing..."
              >
                <CheckCircle className="w-4 h-4" />
                Sync Installation
              </Button>
            ) : (
              <Button
                variant="primary"
                size="lg"
                className="w-full bg-gray-900 hover:bg-gray-800"
                onClick={handleConnect}
                loading={isConnecting}
                loadingText="Connecting..."
              >
                <Github className="w-4 h-4" />
                Connect GitHub
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <ConfirmModal
        open={showDisconnectModal}
        onClose={() => setShowDisconnectModal(false)}
        onConfirm={handleDisconnectConfirm}
        title="Disconnect Integration"
        message="Are you sure you want to disconnect this GitHub integration? This will remove all associated data and stop automated workflows."
        confirmText="Disconnect"
        cancelText="Cancel"
        variant="destructive"
        loading={isDisconnecting}
      />

      <AlertModal
        open={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Error"
        message={errorMessage}
        variant="error"
        buttonText="OK"
      />
    </div>
  );
};

GitHubIntegrationCardComponent.displayName = 'GitHubIntegrationCard';

export default memo(GitHubIntegrationCardComponent);
