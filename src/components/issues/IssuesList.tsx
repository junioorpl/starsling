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
        <div className="text-center text-gray-500">
          <p>No issues found</p>
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
