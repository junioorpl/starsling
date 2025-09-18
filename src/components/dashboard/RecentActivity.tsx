import { memo } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface ActivityItem {
  id: string;
  type: 'issue' | 'repository' | 'integration' | 'deployment';
  title: string;
  description: string;
  timestamp: string;
  status?: 'success' | 'warning' | 'error' | 'info';
}

interface RecentActivityProps {
  activities: ActivityItem[];
  limit?: number;
}

const RecentActivityComponent = ({
  activities,
  limit = 5,
}: RecentActivityProps) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      case 'info':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'issue':
        return '🐛';
      case 'repository':
        return '📁';
      case 'integration':
        return '🔗';
      case 'deployment':
        return '🚀';
      default:
        return '📄';
    }
  };

  const displayActivities = activities.slice(0, limit);

  if (displayActivities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-600 py-8">
            <p>No recent activity to display</p>
            <p className="text-sm mt-1 text-gray-500">
              Connect your GitHub integration to see activity
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayActivities.map(activity => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <span className="text-lg">{getTypeIcon(activity.type)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.title}
                  </p>
                  {activity.status && (
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        activity.status
                      )}`}
                    >
                      {activity.status}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {activity.description}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {activity.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

RecentActivityComponent.displayName = 'RecentActivity';

export const RecentActivity = memo(RecentActivityComponent);
