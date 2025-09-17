'use client';

import { Github } from 'lucide-react';
import { memo, useMemo, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { authClient } from '@/lib/auth-client';
import { logger } from '@/lib/logger';

interface GitHubSignInButtonProps {
  href?: string;
  className?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'full-width';
}

const GitHubSignInButtonComponent = ({
  href: _href,
  className,
  children = 'Sign in with GitHub',
  variant = 'default',
}: GitHubSignInButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const buttonClasses = useMemo(
    () =>
      variant === 'full-width'
        ? 'w-full inline-flex items-center justify-center gap-3'
        : 'inline-flex items-center gap-2',
    [variant]
  );

  const handleSignIn = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const result = await authClient.signIn.social({
        provider: 'github',
        callbackURL: '/',
      });

      if (result.error) {
        logger.error('Sign-in failed', { error: result.error });
        return;
      }

      // Redirect will be handled automatically by Better Auth
      logger.info('GitHub sign-in initiated successfully');
    } catch (error) {
      logger.error('Sign-in failed', {}, error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="primary"
      className={`${buttonClasses} bg-gray-900 hover:bg-gray-800 ${className || ''}`}
      onClick={handleSignIn}
      loading={isLoading}
      loadingText="Signing in..."
    >
      <Github className="w-5 h-5" />
      {children}
    </Button>
  );
};

GitHubSignInButtonComponent.displayName = 'GitHubSignInButton';

export const GitHubSignInButton = memo(GitHubSignInButtonComponent);
