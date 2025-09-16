import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { memo, useMemo } from 'react';

interface UserWelcomeProps {
  userName?: string | null;
  userEmail?: string | null;
  showSignOut?: boolean;
  className?: string;
}

export const UserWelcome = memo(function UserWelcome({
  userName,
  userEmail,
  showSignOut = true,
  className = '',
}: UserWelcomeProps) {
  const displayName = useMemo(
    () => userName || userEmail || 'User',
    [userName, userEmail]
  );

  return (
    <div className={`space-y-4 ${className}`}>
      <p className="text-lg text-gray-700">Welcome back, {displayName}!</p>
      <div className="flex gap-4 justify-center">
        <Button asChild>
          <Link href="/integrations">View Integrations</Link>
        </Button>
        {showSignOut && (
          <Button variant="secondary" asChild>
            <Link href="/api/auth/sign-out">Sign Out</Link>
          </Button>
        )}
      </div>
    </div>
  );
});
