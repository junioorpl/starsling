'use client';

import { useEffect, useState } from 'react';

import { Card } from '@/components/ui/Card';

import { IssueCard } from './IssueCard';

interface Issue {
  id: string;
  githubId: string;
  number: string;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  author: string;
  assignees: string[];
  labels: string[];
  commentsCount: string;
  reactionsCount: string;
  htmlUrl: string;
  createdAt: string;
  updatedAt: string;
  repository: {
    id: string;
    name: string;
    fullName: string;
    language: string | null;
  };
  organization: {
    id: string;
    name: string;
    slug: string;
  };
}

interface IssuesListProps {
  organizationId?: string;
  repositoryId?: string;
  state?: 'all' | 'open' | 'closed';
  limit?: number;
}

export const IssuesList = ({
  organizationId,
  repositoryId,
  state = 'all',
  limit = 10,
}: IssuesListProps) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          page: '1',
          limit: limit.toString(),
          state,
        });

        if (organizationId) {
          params.append('organizationId', organizationId);
        }

        if (repositoryId) {
          params.append('repositoryId', repositoryId);
        }

        const response = await fetch(`/api/issues?${params.toString()}`);

        if (!response.ok) {
          throw new Error('Failed to fetch issues');
        }

        const data = await response.json();
        setIssues(data.issues || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        // Error is already handled by setError
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, [organizationId, repositoryId, state, limit]);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          <p>Failed to load issues: {error}</p>
        </div>
      </Card>
    );
  }

  if (issues.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-600">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No issues found
          </h3>
          <p className="text-gray-500 mb-4">
            {organizationId
              ? 'No issues have been synced from your GitHub repositories yet.'
              : 'Connect your GitHub organization to start tracking issues.'}
          </p>
          {organizationId && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                To start seeing issues here, you need to:
              </p>
              <ol className="text-sm text-gray-600 text-left max-w-md mx-auto space-y-1">
                <li>1. Connect your GitHub organization</li>
                <li>2. Sync your repositories</li>
                <li>3. Issues will appear automatically</li>
              </ol>
              <div className="pt-4">
                <a
                  href="/integrations"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Connect GitHub
                </a>
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {issues.map(issue => (
        <IssueCard key={issue.id} issue={issue} />
      ))}
    </div>
  );
};
