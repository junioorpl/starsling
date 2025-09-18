'use client';

import {
  Activity,
  AlertCircle,
  CheckCircle,
  GitBranch,
  Github,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { IssuesList } from '@/components/issues';

import { DashboardLayout, RecentActivity, StatsCard } from './index';

interface DashboardStats {
  repositories: {
    total: number;
    hasData: boolean;
  };
  issues: {
    total: number;
    open: number;
    closed: number;
    recent: number;
    resolutionRate: number;
    hasData: boolean;
  };
  integrations: {
    connected: boolean;
    count: number;
  };
  organization: {
    id: string;
    name: string;
    slug: string;
  };
}

interface DashboardHomeProps {
  organizationId: string;
  userName: string;
  userEmail: string;
}

export const DashboardHome = ({
  organizationId,
  userName,
}: DashboardHomeProps) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/dashboard/stats');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard stats');
        }

        const data = await response.json();
        setStats(data.stats);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Mock recent activity data - in a real app, this would come from an API
  const recentActivities = [
    {
      id: '1',
      type: 'integration' as const,
      title: 'GitHub integration connected',
      description: 'Successfully connected to your GitHub organization',
      timestamp: '2 hours ago',
      status: 'success' as const,
    },
    {
      id: '2',
      type: 'repository' as const,
      title: '3 repositories synced',
      description: 'New repositories have been imported from GitHub',
      timestamp: '4 hours ago',
      status: 'info' as const,
    },
    {
      id: '3',
      type: 'issue' as const,
      title: 'New issue detected',
      description: 'High priority issue found in main repository',
      timestamp: '6 hours ago',
      status: 'warning' as const,
    },
  ];

  if (loading) {
    return (
      <DashboardLayout title="Dashboard" subtitle={`Welcome back, ${userName}`}>
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Dashboard" subtitle={`Welcome back, ${userName}`}>
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Failed to load dashboard
          </h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard" subtitle={`Welcome back, ${userName}`}>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Repositories"
          value={stats?.repositories.total || 0}
          description="Connected repositories"
          icon={<GitBranch className="w-5 h-5" />}
        />
        <StatsCard
          title="Open Issues"
          value={stats?.issues.open || 0}
          description={`${stats?.issues.total || 0} total issues`}
          icon={<AlertCircle className="w-5 h-5" />}
        />
        <StatsCard
          title="Resolution Rate"
          value={`${stats?.issues.resolutionRate || 0}%`}
          description="Issues resolved"
          icon={<CheckCircle className="w-5 h-5" />}
        />
        <StatsCard
          title="Recent Activity"
          value={stats?.issues.recent || 0}
          description="Issues this week"
          icon={<Activity className="w-5 h-5" />}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Recent Issues */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Recent Issues
            </h2>
            <IssuesList
              organizationId={organizationId}
              state="open"
              limit={8}
            />
          </div>
        </div>

        {/* Right Column - Activity and Integration Status */}
        <div className="space-y-6">
          <RecentActivity activities={recentActivities} />

          {/* Integration Status */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Github className="w-6 h-6 text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-900">
                GitHub Integration
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Status</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    stats?.integrations.connected
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {stats?.integrations.connected
                    ? 'Connected'
                    : 'Not Connected'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Repositories</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats?.repositories.total || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Issues Synced</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats?.issues.total || 0}
                </span>
              </div>
              {!stats?.integrations.connected && (
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-sm text-gray-600 mb-3">
                    Connect GitHub to start syncing repositories and issues.
                  </p>
                  <a
                    href="/integrations"
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    <Github className="w-4 h-4 mr-2" />
                    Connect GitHub
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
