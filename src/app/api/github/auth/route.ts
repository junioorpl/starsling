import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const searchParams = request.nextUrl.searchParams;
  const organizationId = searchParams.get('organizationId');

  if (!organizationId) {
    return NextResponse.json(
      { error: 'Organization ID is required' },
      { status: 400 }
    );
  }

  // Generate state parameter for OAuth flow
  const state = Buffer.from(
    JSON.stringify({ organizationId, userId: session.user.id })
  ).toString('base64');

  const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
  githubAuthUrl.searchParams.set(
    'client_id',
    process.env.GITHUB_APP_CLIENT_ID!
  );
  githubAuthUrl.searchParams.set(
    'redirect_uri',
    `${process.env.BETTER_AUTH_URL}/api/github/callback`
  );
  githubAuthUrl.searchParams.set('state', state);
  githubAuthUrl.searchParams.set('scope', 'read:org');

  return NextResponse.redirect(githubAuthUrl.toString());
}
