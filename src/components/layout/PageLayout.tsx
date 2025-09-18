import { memo, useMemo, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  background?: 'default' | 'gray' | 'gradient';
  fullHeight?: boolean;
}

const PageLayoutComponent = ({
  children,
  className = '',
  background = 'default',
  fullHeight = false,
}: PageLayoutProps) => {
  const backgroundClasses = useMemo(
    () => ({
      default: 'bg-white',
      gray: 'bg-gray-50',
      gradient: 'bg-gradient-to-br from-blue-50 to-indigo-100',
    }),
    []
  );

  return (
    <div
      className={cn(
        fullHeight ? 'min-h-screen' : 'min-h-[calc(100vh-4rem)]',
        backgroundClasses[background],
        className
      )}
    >
      {children}
    </div>
  );
};

PageLayoutComponent.displayName = 'PageLayout';

export const PageLayout = memo(PageLayoutComponent);
