import { memo, useMemo, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface HeroProps {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const HeroComponent = ({
  title,
  description,
  children,
  className = '',
  size = 'lg',
}: HeroProps) => {
  const titleSizes = useMemo(
    () => ({
      sm: 'text-3xl',
      md: 'text-4xl',
      lg: 'text-5xl',
    }),
    []
  );

  return (
    <div className={cn('text-center', className)}>
      <h1 className={cn('font-bold text-gray-900 mb-6', titleSizes[size])}>
        {title}
      </h1>
      {description && (
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          {description}
        </p>
      )}
      {children}
    </div>
  );
};

HeroComponent.displayName = 'Hero';

export const Hero = memo(HeroComponent);
