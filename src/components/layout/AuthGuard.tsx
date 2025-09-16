import { ReactNode, memo, useMemo } from "react";
import Link from "next/link";
import { GitHubSignInButton } from "@/components/auth/GitHubSignInButton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  requireAuth?: boolean;
}

export const AuthGuard = memo(function AuthGuard({ 
  children, 
  fallback,
  requireAuth = true 
}: AuthGuardProps) {
  const defaultFallback = useMemo(() => (
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
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Back to home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  ), []);

  if (!requireAuth) {
    return <>{children}</>;
  }

  return <>{fallback || defaultFallback}</>;
});
