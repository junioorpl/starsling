"use client";

import { useState } from "react";
import { Github, CheckCircle, AlertCircle, ExternalLink } from "lucide-react";

interface GitHubIntegrationCardProps {
  status: {
    connected: boolean;
    accountLogin?: string;
    accountType?: string;
    permissions?: Record<string, string>;
    events?: string[];
    error?: string;
  } | null;
  organizationId: string;
}

export default function GitHubIntegrationCard({
  status,
  organizationId,
}: GitHubIntegrationCardProps) {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // Redirect to GitHub App OAuth flow
      window.location.href = `/api/github/auth?organizationId=${organizationId}`;
    } catch (error) {
      console.error("Error initiating GitHub connection:", error);
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (confirm("Are you sure you want to disconnect this integration?")) {
      try {
        const response = await fetch("/api/github/disconnect", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ organizationId }),
        });

        if (response.ok) {
          window.location.reload();
        } else {
          alert("Failed to disconnect integration");
        }
      } catch (error) {
        console.error("Error disconnecting GitHub integration:", error);
        alert("Failed to disconnect integration");
      }
    }
  };

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
                {status.events.map((event) => (
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
            <button
              onClick={handleDisconnect}
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Disconnect
            </button>
            <a
              href="https://github.com/settings/installations"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Manage
              <ExternalLink className="w-4 h-4" />
            </a>
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

          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isConnecting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Github className="w-4 h-4" />
                Connect GitHub
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
