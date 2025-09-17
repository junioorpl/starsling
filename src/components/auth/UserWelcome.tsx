'use client';

import { memo, useMemo, useState } from 'react';

import { Alert, AlertDescription, AlertIcon } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { authClient } from '@/lib/auth-client';
import { logger } from '@/lib/logger';

interface UserWelcomeProps {
  userName?: string | null;
  userEmail?: string | null;
  showSignOut?: boolean;
  className?: string;
}

const UserWelcomeComponent = ({
  userName,
  userEmail,
  showSignOut = true,
  className = '',
}: UserWelcomeProps) => {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  const displayName = useMemo(
    () => userName || userEmail || 'User',
    [userName, userEmail]
  );

  const handleSignOut = async () => {
    if (isSigningOut) return;

    setIsSigningOut(true);
    setSignOutError(null);
    try {
      await authClient.signOut();
      // Redirect to home page after successful sign-out
      window.location.href = '/';
    } catch (error) {
      logger.error('Sign-out failed', {}, error as Error);
      setSignOutError('Failed to sign out. Please try again.');
      // Reset loading state on error
      setIsSigningOut(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <p className="text-lg text-gray-700">Welcome back, {displayName}!</p>
      {signOutError && (
        <Alert variant="error">
          <AlertIcon variant="error" />
          <AlertDescription>{signOutError}</AlertDescription>
        </Alert>
      )}
      <div className="flex gap-4 justify-center">
        <Button asChild>
          <a href="/integrations">View Integrations</a>
        </Button>
        {showSignOut && (
          <Button
            variant="secondary"
            onClick={handleSignOut}
            loading={isSigningOut}
            loadingText="Signing Out..."
          >
            Sign Out
          </Button>
        )}
      </div>
    </div>
  );
};

UserWelcomeComponent.displayName = 'UserWelcome';

export const UserWelcome = memo(UserWelcomeComponent);
