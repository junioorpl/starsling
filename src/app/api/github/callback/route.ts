import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { integrationInstallations } from "@/lib/db/schema";
import { encrypt } from "@/lib/encryption";
import { createGitHubApp } from "@/lib/github";
import { inngest } from "@/lib/inngest";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL("/integrations?error=access_denied", request.url)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/integrations?error=invalid_request", request.url)
    );
  }

  try {
    // Decode state
    const stateData = JSON.parse(Buffer.from(state, "base64").toString());
    const { organizationId } = stateData;

    // Exchange code for access token
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_APP_CLIENT_ID!,
          client_secret: process.env.GITHUB_APP_CLIENT_SECRET!,
          code,
        }),
      }
    );

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      throw new Error(
        tokenData.error_description || "Failed to exchange code for token"
      );
    }

    // Get installation information
    const githubApp = createGitHubApp();
    const installationId = parseInt(tokenData.installation_id);
    const installationResponse = await githubApp.rest.apps.getInstallation({
      installation_id: installationId,
    });

    const installation = installationResponse.data;

    // Check if installation already exists
    const existingInstallation = await db
      .select()
      .from(integrationInstallations)
      .where(eq(integrationInstallations.organizationId, organizationId))
      .limit(1);

    if (existingInstallation.length > 0) {
      // Update existing installation
      await db
        .update(integrationInstallations)
        .set({
          accessToken: encrypt(tokenData.access_token),
          refreshToken: tokenData.refresh_token
            ? encrypt(tokenData.refresh_token)
            : null,
          metadata: {
            installationId: installation.id,
            accountId: installation.account?.id,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            accountType: (installation.account as any)?.type || "Organization",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            accountLogin: (installation.account as any)?.login,
            permissions: installation.permissions,
            events: installation.events,
          },
          updatedAt: new Date(),
        })
        .where(eq(integrationInstallations.organizationId, organizationId));
    } else {
      // Create new installation
      await db.insert(integrationInstallations).values({
        organizationId,
        provider: "github",
        accessToken: encrypt(tokenData.access_token),
        refreshToken: tokenData.refresh_token
          ? encrypt(tokenData.refresh_token)
          : null,
        metadata: {
          installationId: installation.id,
          accountId: installation.account?.id,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          accountType: (installation.account as any)?.type || "Organization",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          accountLogin: (installation.account as any)?.login,
          permissions: installation.permissions,
          events: installation.events,
        },
      });
    }

    // Trigger Inngest event
    await inngest.send({
      name: "github/app.installed",
      data: {
        installationId: installation.id,
        accountId: installation.account?.id || 0,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        accountType: (installation.account as any)?.type || "Organization",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        accountLogin: (installation.account as any)?.login || "",
        organizationId,
      },
    });

    return NextResponse.redirect(
      new URL("/integrations?success=connected", request.url)
    );
  } catch (error) {
    console.error("GitHub OAuth callback error:", error);
    return NextResponse.redirect(
      new URL("/integrations?error=callback_failed", request.url)
    );
  }
}
