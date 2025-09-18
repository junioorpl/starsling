import { memo, type ReactNode } from 'react';

import { Container } from '@/components/layout/Container';
import { PageLayout } from '@/components/layout/PageLayout';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}

const DashboardLayoutComponent = ({
  children,
  className = '',
  title,
  subtitle,
  actions,
}: DashboardLayoutProps) => {
  return (
    <PageLayout background="default" fullHeight>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        {(title || subtitle || actions) && (
          <div className="bg-white border-b border-gray-200">
            <Container className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  {title && (
                    <h1 className="text-2xl font-bold text-gray-900">
                      {title}
                    </h1>
                  )}
                  {subtitle && <p className="text-gray-700 mt-1">{subtitle}</p>}
                </div>
                {actions && (
                  <div className="flex items-center space-x-3">{actions}</div>
                )}
              </div>
            </Container>
          </div>
        )}

        {/* Main Content */}
        <Container className="py-6">
          <div className={cn('space-y-6', className)}>{children}</div>
        </Container>
      </div>
    </PageLayout>
  );
};

DashboardLayoutComponent.displayName = 'DashboardLayout';

export const DashboardLayout = memo(DashboardLayoutComponent);
