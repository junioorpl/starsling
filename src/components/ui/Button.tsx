import { forwardRef, memo, type ButtonHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
}

const Button = memo(
  forwardRef<HTMLButtonElement, ButtonProps>(
    (
      {
        className,
        variant = 'primary',
        size = 'md',
        asChild: _asChild = false,
        loading = false,
        loadingText,
        children,
        disabled,
        ...props
      },
      ref
    ) => {
      const baseClasses =
        'inline-flex items-center justify-center rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

      const variants = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700',
        secondary: 'bg-gray-600 text-white hover:bg-gray-700',
        outline:
          'border border-gray-300 bg-transparent hover:bg-gray-50 text-gray-700',
        ghost: 'hover:bg-gray-100 text-gray-700',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
      };

      const sizes = {
        sm: 'px-3 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
      };

      const isDisabled = disabled || loading;

      return (
        <button
          className={cn(baseClasses, variants[variant], sizes[size], className)}
          ref={ref}
          disabled={isDisabled}
          {...props}
        >
          {loading && (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
          )}
          {loading ? loadingText || 'Loading...' : children}
        </button>
      );
    }
  )
);

Button.displayName = 'Button';

export { Button };
