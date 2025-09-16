import Link from "next/link";
import { Github } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to StarSling
          </h1>
          <p className="text-gray-600">
            Sign in to access your DevOps automation platform
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/api/auth/sign-in/github"
            className="w-full inline-flex items-center justify-center gap-3 bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            <Github className="w-5 h-5" />
            Sign in with GitHub
          </Link>

          <div className="text-center">
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Back to home
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            By signing in, you agree to our Terms of Service and Privacy Policy.
            StarSling will have access to your GitHub account information.
          </p>
        </div>
      </div>
    </div>
  );
}
