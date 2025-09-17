'use client';

import { memo, useState, type ReactNode } from 'react';

import { Alert, AlertDescription, AlertIcon } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { authClient } from '@/lib/auth-client';
import { logger } from '@/lib/logger';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
  showLogout?: boolean;
}

const PageHeaderComponent = ({
  title,
  description,
  children,
  className = '',
  showLogout = false,
}: PageHeaderProps) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    setLogoutError(null);
    try {
      await authClient.signOut();
      // Redirect to home page after successful sign-out
      window.location.href = '/';
    } catch (error) {
      logger.error('Logout failed', {}, error as Error);
      setLogoutError('Failed to sign out. Please try again.');
      // Reset loading state on error
      setIsLoggingOut(false);
    }
  };

  return (
    <div className={`mb-8 ${className}`}>
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          {description && <p className="text-gray-600">{description}</p>}
        </div>
        {showLogout && (
          <Button
            variant="secondary"
            onClick={handleLogout}
            loading={isLoggingOut}
            loadingText="Signing Out..."
          >
            Sign Out
          </Button>
        )}
      </div>
      {logoutError && (
        <Alert variant="error" className="mt-4">
          <AlertIcon variant="error" />
          <AlertDescription>{logoutError}</AlertDescription>
        </Alert>
      )}
      {children}
    </div>
  );
};

PageHeaderComponent.displayName = 'PageHeader';

export const PageHeader = memo(PageHeaderComponent);
