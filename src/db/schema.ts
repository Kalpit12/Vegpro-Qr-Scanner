import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "ADMIN",
  "BREEDER",
  "VIEWER",
]);

export const flowerStatusEnum = pgEnum("flower_status", [
  "DRAFT",
  "TRIAL",
  "EVALUATION",
  "APPROVED",
  "COMMERCIAL",
  "ARCHIVED",
]);

export const developmentStageEnum = pgEnum("development_stage", [
  "PARENT",
  "CROSS",
  "SEEDLING",
  "TRIAL",
  "EVALUATION",
  "SELECTED",
  "APPROVED",
  "COMMERCIAL",
]);

export const parameterDataTypeEnum = pgEnum("parameter_data_type", [
  "text",
  "number",
  "decimal",
  "boolean",
  "date",
  "percentage",
  "range",
  "select",
]);

export const sourceSystemEnum = pgEnum("source_system", ["Demo", "VegPro"]);

export const varietyRelationTypeEnum = pgEnum("variety_relation_type", [
  "PARENT",
  "CHILD",
  "RELATED",
  "PREDECESSOR",
  "SUCCESSOR",
]);

export const syncStatusEnum = pgEnum("sync_status", [
  "PENDING",
  "SUCCESS",
  "ERROR",
]);

export const analyticsEventTypeEnum = pgEnum("analytics_event_type", [
  "QR_SCAN",
  "PASSPORT_VIEW",
  "GALLERY_VIEW",
  "SHARE",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  passwordHash: text("password_hash"),
  role: userRoleEnum("role").notNull().default("VIEWER"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (table) => ({
    compoundKey: primaryKey({
      columns: [table.provider, table.providerAccountId],
    }),
  }),
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").notNull().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (table) => ({
    compoundKey: primaryKey({
      columns: [table.identifier, table.token],
    }),
  }),
);

export const flowerIdentities = pgTable(
  "flower_identities",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    publicIdentifier: text("public_identifier").notNull().unique(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("flower_identities_public_identifier_idx").on(
      table.publicIdentifier,
    ),
  ],
);

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const flowerRecords = pgTable(
  "flower_records",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    flowerIdentityId: uuid("flower_identity_id")
      .notNull()
      .references(() => flowerIdentities.id, { onDelete: "cascade" })
      .unique(),
    externalId: text("external_id").notNull(),
    varietyCode: text("variety_code").notNull(),
    name: text("name").notNull(),
    slug: text("slug"),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    flowerType: text("flower_type"),
    shortDescription: text("short_description"),
    description: text("description"),
    status: flowerStatusEnum("status").notNull().default("DRAFT"),
    developmentStage: developmentStageEnum("development_stage"),
    origin: text("origin"),
    breeder: text("breeder"),
    breedingProgram: text("breeding_program"),
    breedingYear: integer("breeding_year"),
    publicVisible: boolean("public_visible").notNull().default(false),
    featured: boolean("featured").notNull().default(false),
    sourceSystem: sourceSystemEnum("source_system").notNull().default("Demo"),
    sourceExternalId: text("source_external_id").notNull(),
    sourceLastUpdatedAt: timestamp("source_last_updated_at", {
      mode: "date",
    }).notNull(),
    sourceSynchronizedAt: timestamp("source_synchronized_at", {
      mode: "date",
    }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("flower_records_identity_idx").on(table.flowerIdentityId),
    index("flower_records_name_idx").on(table.name),
    index("flower_records_category_idx").on(table.categoryId),
  ],
);

export const parameterDefinitions = pgTable(
  "parameter_definitions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    key: text("key").notNull().unique(),
    category: text("category").notNull(),
    dataType: parameterDataTypeEnum("data_type").notNull(),
    unit: text("unit"),
    displayOrder: integer("display_order").notNull().default(0),
    publicVisibility: boolean("public_visibility").notNull().default(true),
    isActive: boolean("is_active").notNull().default(true),
    validationConfig: text("validation_config"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
);

export const flowerParameterValues = pgTable(
  "flower_parameter_values",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    flowerRecordId: uuid("flower_record_id")
      .notNull()
      .references(() => flowerRecords.id, { onDelete: "cascade" }),
    parameterDefinitionId: uuid("parameter_definition_id")
      .notNull()
      .references(() => parameterDefinitions.id, { onDelete: "restrict" }),
    value: text("value").notNull(),
    publicVisible: boolean("public_visible").notNull().default(true),
  },
  (table) => [
    uniqueIndex("flower_parameter_values_unique_idx").on(
      table.flowerRecordId,
      table.parameterDefinitionId,
    ),
  ],
);

export const flowerImages = pgTable("flower_images", {
  id: uuid("id").defaultRandom().primaryKey(),
  flowerRecordId: uuid("flower_record_id")
    .notNull()
    .references(() => flowerRecords.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  altText: text("alt_text"),
  displayOrder: integer("display_order").notNull().default(0),
  publicVisible: boolean("public_visible").notNull().default(true),
  isPrimary: boolean("is_primary").notNull().default(false),
});

export const breedingRecords = pgTable("breeding_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  flowerRecordId: uuid("flower_record_id")
    .notNull()
    .references(() => flowerRecords.id, { onDelete: "cascade" })
    .unique(),
  breederNotesInternal: text("breeder_notes_internal"),
  trialNotesInternal: text("trial_notes_internal"),
  breedingCode: text("breeding_code"),
  publicSummary: text("public_summary"),
  publicVisible: boolean("public_visible").notNull().default(false),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const varietyRelations = pgTable(
  "variety_relations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fromFlowerRecordId: uuid("from_flower_record_id")
      .notNull()
      .references(() => flowerRecords.id, { onDelete: "cascade" }),
    toFlowerRecordId: uuid("to_flower_record_id")
      .notNull()
      .references(() => flowerRecords.id, { onDelete: "cascade" }),
    relationType: varietyRelationTypeEnum("relation_type").notNull(),
    publicVisible: boolean("public_visible").notNull().default(false),
  },
  (table) => [
    uniqueIndex("variety_relations_edge_unique").on(
      table.fromFlowerRecordId,
      table.toFlowerRecordId,
      table.relationType,
    ),
  ],
);

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  previousValue: text("previous_value"),
  newValue: text("new_value"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const analyticsEvents = pgTable(
  "analytics_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    eventType: analyticsEventTypeEnum("event_type").notNull(),
    flowerIdentityId: uuid("flower_identity_id").references(
      () => flowerIdentities.id,
      { onDelete: "set null" },
    ),
    sessionHash: text("session_hash"),
    userAgent: text("user_agent"),
    referrer: text("referrer"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("analytics_events_event_type_idx").on(table.eventType),
    index("analytics_events_flower_identity_id_idx").on(table.flowerIdentityId),
    index("analytics_events_created_at_idx").on(table.createdAt),
  ],
);

export const syncEvents = pgTable("sync_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  source: sourceSystemEnum("source").notNull(),
  eventType: text("event_type").notNull(),
  externalId: text("external_id"),
  status: syncStatusEnum("status").notNull(),
  startedAt: timestamp("started_at", { mode: "date" }).notNull(),
  completedAt: timestamp("completed_at", { mode: "date" }),
  errorMessage: text("error_message"),
  recordsChanged: integer("records_changed").default(0),
});

export const platformSettings = pgTable("platform_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const flowerRecordsRelations = relations(flowerRecords, ({ one, many }) => ({
  identity: one(flowerIdentities, {
    fields: [flowerRecords.flowerIdentityId],
    references: [flowerIdentities.id],
  }),
  category: one(categories, {
    fields: [flowerRecords.categoryId],
    references: [categories.id],
  }),
  parameterValues: many(flowerParameterValues),
  images: many(flowerImages),
  breedingRecord: one(breedingRecords),
}));

export const flowerIdentitiesRelations = relations(
  flowerIdentities,
  ({ one }) => ({
    record: one(flowerRecords, {
      fields: [flowerIdentities.id],
      references: [flowerRecords.flowerIdentityId],
    }),
  }),
);
