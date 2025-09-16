import Link from "next/link";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { memo, useMemo } from "react";

interface GitHubSignInButtonProps {
  href?: string;
  className?: string;
  children?: React.ReactNode;
  variant?: "default" | "full-width";
}

export const GitHubSignInButton = memo(function GitHubSignInButton({ 
  href = "/api/auth/sign-in/github", 
  className,
  children = "Sign in with GitHub",
  variant = "default"
}: GitHubSignInButtonProps) {
  const buttonClasses = useMemo(() => 
    variant === "full-width" 
      ? "w-full inline-flex items-center justify-center gap-3"
      : "inline-flex items-center gap-2",
    [variant]
  );

  return (
    <Link href={href} className={className}>
      <Button
        variant="primary"
        className={`${buttonClasses} bg-gray-900 hover:bg-gray-800`}
      >
        <Github className="w-5 h-5" />
        {children}
      </Button>
    </Link>
  );
});
