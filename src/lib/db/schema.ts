import {
  pgTable,
  text,
  timestamp,
  uuid,
  jsonb,
  varchar,
} from "drizzle-orm/pg-core";

export const integrationInstallations = pgTable("integration_installations", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull(),
  provider: varchar("provider", { length: 50 }).notNull().default("github"),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
