import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { forwardRef, memo, type HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

const Alert = memo(
  forwardRef<HTMLDivElement, AlertProps>(
    ({ className, variant = 'default', ...props }, ref) => {
      const variants = {
        default: 'bg-gray-50 border-gray-200 text-gray-800',
        success: 'bg-green-50 border-green-200 text-green-800',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        error: 'bg-red-50 border-red-200 text-red-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800',
      };

      return (
        <div
          ref={ref}
          className={cn(
            'relative w-full rounded-lg border p-4',
            variants[variant],
            className
          )}
          {...props}
        />
      );
    }
  )
);
Alert.displayName = 'Alert';

const AlertIcon = memo(
  forwardRef<HTMLDivElement, { variant?: AlertProps['variant'] }>(
    ({ variant = 'default' }, ref) => {
      const icons = {
        default: Info,
        success: CheckCircle,
        warning: AlertTriangle,
        error: AlertCircle,
        info: Info,
      };

      const Icon = icons[variant];

      return (
        <div ref={ref} className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
        </div>
      );
    }
  )
);
AlertIcon.displayName = 'AlertIcon';

const AlertTitle = memo(
  forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
      <h5
        ref={ref}
        className={cn(
          'mb-1 font-medium leading-none tracking-tight',
          className
        )}
        {...props}
      />
    )
  )
);
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = memo(
  forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
    ({ className, ...props }, ref) => (
      <div
        ref={ref}
        className={cn('text-sm [&_p]:leading-relaxed', className)}
        {...props}
      />
    )
  )
);
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertDescription, AlertIcon, AlertTitle };
