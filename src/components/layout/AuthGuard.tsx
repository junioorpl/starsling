import Link from 'next/link';
import { memo, useMemo, type ReactNode } from 'react';

import { GitHubSignInButton } from '@/components/auth/GitHubSignInButton';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  requireAuth?: boolean;
}

const AuthGuardComponent = ({
  children,
  fallback,
  requireAuth = true,
}: AuthGuardProps) => {
  const defaultFallback = useMemo(
    () => (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Authentication Required</CardTitle>
            <CardDescription>
              Please sign in to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <GitHubSignInButton variant="full-width" />
            <div className="text-center">
              <Link
                href="/"
                className="text-sm text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
              >
                ← Back to home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    ),
    []
  );

  if (!requireAuth) {
    return <>{children}</>;
  }

  return <>{fallback || defaultFallback}</>;
};

AuthGuardComponent.displayName = 'AuthGuard';

export const AuthGuard = memo(AuthGuardComponent);
