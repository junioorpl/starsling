import Link from 'next/link';
import { GitHubSignInButton } from '@/components/auth/GitHubSignInButton';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/Card';
import { memo } from 'react';

interface LoginCardProps {
  title?: string;
  description?: string;
  showBackLink?: boolean;
  showTerms?: boolean;
  className?: string;
}

export const LoginCard = memo(function LoginCard({
  title = 'Welcome to StarSling',
  description = 'Sign in to access your DevOps automation platform',
  showBackLink = true,
  showTerms = true,
  className = '',
}: LoginCardProps) {
  return (
    <Card className={`w-full max-w-md ${className}`}>
      <CardHeader className="text-center">
        <CardTitle className="text-3xl mb-2">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <GitHubSignInButton variant="full-width" />

        {showBackLink && (
          <div className="text-center">
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Back to home
            </Link>
          </div>
        )}

        {showTerms && (
          <div className="pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              By signing in, you agree to our Terms of Service and Privacy
              Policy. StarSling will have access to your GitHub account
              information.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
