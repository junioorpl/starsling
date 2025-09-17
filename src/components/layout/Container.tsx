import { memo, useMemo, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const ContainerComponent = ({
  children,
  className = '',
  size = 'lg',
}: ContainerProps) => {
  const sizeClasses = useMemo(
    () => ({
      sm: 'max-w-2xl',
      md: 'max-w-4xl',
      lg: 'max-w-6xl',
      xl: 'max-w-7xl',
      full: 'max-w-none',
    }),
    []
  );

  return (
    <div className={cn('container mx-auto px-4', sizeClasses[size], className)}>
      {children}
    </div>
  );
};

ContainerComponent.displayName = 'Container';

export const Container = memo(ContainerComponent);
