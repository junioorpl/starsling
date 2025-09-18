import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

import { Card } from '@/components/ui/Card';

interface IssueCardProps {
  issue: {
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
  };
}

export const IssueCard = ({ issue }: IssueCardProps) => {
  const getStateColor = (state: string) => {
    return state === 'open' ? 'text-green-600' : 'text-red-600';
  };

  const getStateIcon = (state: string) => {
    return state === 'open' ? '●' : '●';
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className={`text-sm font-medium ${getStateColor(issue.state)}`}>
            {getStateIcon(issue.state)}
          </span>
          <Link
            href={issue.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
          >
            #{issue.number}
          </Link>
          <span className="text-sm text-gray-600">
            in {issue.repository.fullName}
          </span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          {issue.commentsCount !== '0' && <span>💬 {issue.commentsCount}</span>}
          {issue.reactionsCount !== '0' && (
            <span>👍 {issue.reactionsCount}</span>
          )}
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
        <Link
          href={issue.htmlUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-600 transition-colors"
        >
          {issue.title}
        </Link>
      </h3>

      {issue.body && (
        <p className="text-gray-700 text-sm mb-3 line-clamp-3">
          {truncateText(issue.body, 200)}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">by {issue.author}</span>
          {issue.assignees.length > 0 && (
            <span className="text-sm text-gray-600">
              • assigned to {issue.assignees.join(', ')}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {issue.labels.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {issue.labels.slice(0, 3).map(label => (
                <span
                  key={label}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {label}
                </span>
              ))}
              {issue.labels.length > 3 && (
                <span className="text-xs text-gray-600">
                  +{issue.labels.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Updated{' '}
            {formatDistanceToNow(new Date(issue.updatedAt), {
              addSuffix: true,
            })}
          </span>
          <div className="flex items-center space-x-2">
            {issue.repository.language && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                {issue.repository.language}
              </span>
            )}
            <span className="text-xs">{issue.organization.name}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
