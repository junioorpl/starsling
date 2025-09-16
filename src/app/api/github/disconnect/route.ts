import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { integrationInstallations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { inngest } from "@/lib/inngest";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { organizationId } = await request.json();

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    // Find the integration
    const integration = await db
      .select()
      .from(integrationInstallations)
      .where(eq(integrationInstallations.organizationId, organizationId))
      .limit(1);

    if (integration.length === 0) {
      return NextResponse.json(
        { error: "Integration not found" },
        { status: 404 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const installationId = (integration[0].metadata as any)?.installationId;

    // Delete the integration from database
    await db
      .delete(integrationInstallations)
      .where(eq(integrationInstallations.organizationId, organizationId));

    // Trigger uninstall event
    if (installationId) {
      await inngest.send({
        name: "github/app.uninstalled",
        data: {
          installationId,
          organizationId,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error disconnecting GitHub integration:", error);
    return NextResponse.json(
      { error: "Failed to disconnect integration" },
      { status: 500 }
    );
  }
}
