import { ReactNode, memo, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  background?: 'default' | 'gray' | 'gradient';
}

export const PageLayout = memo(function PageLayout({
  children,
  className = '',
  background = 'default',
}: PageLayoutProps) {
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
      className={cn('min-h-screen', backgroundClasses[background], className)}
    >
      {children}
    </div>
  );
});
