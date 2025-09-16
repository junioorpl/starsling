import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "starsling",
  eventKey: process.env.INNGEST_EVENT_KEY,
});

// Event types
export type Events = {
  "github/app.installed": {
    data: {
      installationId: number;
      accountId: number;
      accountType: string;
      accountLogin: string;
      organizationId: string;
    };
  };
  "github/app.uninstalled": {
    data: {
      installationId: number;
      organizationId: string;
    };
  };
  "github/issues.opened": {
    data: {
      installationId: number;
      issue: Record<string, unknown>;
      repository: Record<string, unknown>;
    };
  };
  "github/issues.closed": {
    data: {
      installationId: number;
      issue: Record<string, unknown>;
      repository: Record<string, unknown>;
    };
  };
};
