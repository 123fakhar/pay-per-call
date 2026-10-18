import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

export const applicationStatusEnum = pgEnum("application_status", [
  "pending",
  "in_review",
  "approved",
  "declined",
  "withdrawn",
]);

export const emailKindEnum = pgEnum("email_kind", [
  "admin_notification",
  "applicant_confirmation",
]);

export const emailStatusEnum = pgEnum("email_status", [
  "pending",
  "sending",
  "sent",
  "failed",
]);

export const applications = pgTable(
  "applications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    timezone: text("timezone").notNull(),
    legalEntityType: text("legal_entity_type").notNull(),
    companyName: text("company_name").notNull(),
    websiteUrl: text("website_url").notNull(),
    addressLine1: text("address_line1").notNull(),
    addressLine2: text("address_line2"),
    country: text("country").notNull(),
    city: text("city").notNull(),
    postalCode: text("postal_code").notNull(),
    messagingService: text("messaging_service").notNull(),
    messengerUsername: text("messenger_username").notNull(),
    bestTimeToContact: text("best_time_to_contact"),
    topVerticals: text("top_verticals").notNull(),
    campaigns: jsonb("campaigns").$type<string[]>().notNull(),
    trafficSourceDetails: text("traffic_source_details").notNull(),
    monthlyRevenueRange: text("monthly_revenue_range").notNull(),
    monthlyRevenueNotes: text("monthly_revenue_notes"),
    referenceOneName: text("reference_one_name").notNull(),
    referenceOneContact: text("reference_one_contact").notNull(),
    referenceTwoName: text("reference_two_name").notNull(),
    referenceTwoContact: text("reference_two_contact").notNull(),
    primaryChannelDetails: text("primary_channel_details").notNull(),
    secondaryChannelDetails: text("secondary_channel_details").notNull(),
    howEnteredAffiliate: text("how_entered_affiliate").notNull(),
    industryExperience: text("industry_experience").notNull(),
    referralSource: text("referral_source").notNull(),
    previousRelationship: text("previous_relationship").notNull(),
    internalReferral: text("internal_referral"),
    termsAccepted: integer("terms_accepted").notNull(),
    termsVersion: text("terms_version").notNull(),
    termsAcceptedAt: timestamp("terms_accepted_at", { withTimezone: true }).notNull(),
    status: applicationStatusEnum("status").notNull().default("pending"),
    adminReviewedAt: timestamp("admin_reviewed_at", { withTimezone: true }),
    adminNotes: text("admin_notes"),
    submitterKeyHash: text("submitter_key_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("applications_created_at_idx").on(table.createdAt),
    index("applications_status_idx").on(table.status),
    index("applications_email_idx").on(table.email),
  ],
);

export const emailOutbox = pgTable(
  "email_outbox",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    applicationId: uuid("application_id")
      .notNull()
      .references(() => applications.id),
    kind: emailKindEnum("kind").notNull(),
    toAddress: text("to_address").notNull(),
    subject: text("subject").notNull(),
    bodyText: text("body_text").notNull(),
    status: emailStatusEnum("status").notNull().default("pending"),
    attempts: integer("attempts").notNull().default(0),
    lastError: text("last_error"),
    lockedAt: timestamp("locked_at", { withTimezone: true }),
    lockedBy: text("locked_by"),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull().defaultNow(),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("email_outbox_application_kind_unique").on(table.applicationId, table.kind),
    index("email_outbox_status_scheduled_idx").on(table.status, table.scheduledAt),
  ],
);

export const submissionRateEvents = pgTable(
  "submission_rate_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    keyHash: text("key_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("submission_rate_events_key_created_idx").on(table.keyHash, table.createdAt)],
);

export type ApplicationRow = typeof applications.$inferSelect;
export type EmailOutboxRow = typeof emailOutbox.$inferSelect;
