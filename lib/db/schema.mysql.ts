import { sql } from "drizzle-orm";
import {
  datetime,
  index,
  int,
  json,
  mysqlTable,
  text,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

const id = () => varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID());
const created = () =>
  datetime("created_at", { mode: "date", fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`);

export const applications = mysqlTable(
  "applications",
  {
    id: id(),
    firstName: varchar("first_name", { length: 80 }).notNull(),
    lastName: varchar("last_name", { length: 80 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    phone: varchar("phone", { length: 40 }),
    timezone: varchar("timezone", { length: 80 }).notNull(),
    legalEntityType: varchar("legal_entity_type", { length: 80 }).notNull(),
    companyName: varchar("company_name", { length: 160 }).notNull(),
    websiteUrl: varchar("website_url", { length: 500 }).notNull(),
    addressLine1: varchar("address_line1", { length: 200 }).notNull(),
    addressLine2: varchar("address_line2", { length: 200 }),
    country: varchar("country", { length: 80 }).notNull(),
    city: varchar("city", { length: 80 }).notNull(),
    postalCode: varchar("postal_code", { length: 20 }).notNull(),
    messagingService: varchar("messaging_service", { length: 40 }).notNull(),
    messengerUsername: varchar("messenger_username", { length: 120 }).notNull(),
    bestTimeToContact: varchar("best_time_to_contact", { length: 160 }),
    topVerticals: text("top_verticals").notNull(),
    campaigns: json("campaigns").$type<string[]>().notNull(),
    trafficSourceDetails: text("traffic_source_details").notNull(),
    monthlyRevenueRange: varchar("monthly_revenue_range", { length: 40 }).notNull(),
    monthlyRevenueNotes: text("monthly_revenue_notes"),
    referenceOneName: varchar("reference_one_name", { length: 120 }).notNull(),
    referenceOneContact: varchar("reference_one_contact", { length: 200 }).notNull(),
    referenceTwoName: varchar("reference_two_name", { length: 120 }).notNull(),
    referenceTwoContact: varchar("reference_two_contact", { length: 200 }).notNull(),
    primaryChannelDetails: text("primary_channel_details").notNull(),
    secondaryChannelDetails: text("secondary_channel_details").notNull(),
    howEnteredAffiliate: text("how_entered_affiliate").notNull(),
    industryExperience: varchar("industry_experience", { length: 40 }).notNull(),
    referralSource: varchar("referral_source", { length: 500 }).notNull(),
    previousRelationship: text("previous_relationship").notNull(),
    internalReferral: varchar("internal_referral", { length: 200 }),
    termsAccepted: int("terms_accepted").notNull(),
    termsVersion: varchar("terms_version", { length: 40 }).notNull(),
    termsAcceptedAt: datetime("terms_accepted_at", { mode: "date", fsp: 3 }).notNull(),
    status: varchar("status", { length: 32 }).notNull().default("pending"),
    adminReviewedAt: datetime("admin_reviewed_at", { mode: "date", fsp: 3 }),
    adminNotes: text("admin_notes"),
    submitterKeyHash: varchar("submitter_key_hash", { length: 128 }).notNull(),
    createdAt: created(),
    updatedAt: datetime("updated_at", { mode: "date", fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
  },
  (table) => [
    index("applications_created_at_idx").on(table.createdAt),
    index("applications_status_idx").on(table.status),
    index("applications_email_idx").on(table.email),
  ],
);

export const emailOutbox = mysqlTable(
  "email_outbox",
  {
    id: id(),
    applicationId: varchar("application_id", { length: 36 }).notNull(),
    kind: varchar("kind", { length: 40 }).notNull(),
    toAddress: varchar("to_address", { length: 320 }).notNull(),
    subject: varchar("subject", { length: 300 }).notNull(),
    bodyText: text("body_text").notNull(),
    status: varchar("status", { length: 32 }).notNull().default("pending"),
    attempts: int("attempts").notNull().default(0),
    lastError: varchar("last_error", { length: 300 }),
    lockedAt: datetime("locked_at", { mode: "date", fsp: 3 }),
    lockedBy: varchar("locked_by", { length: 80 }),
    scheduledAt: datetime("scheduled_at", { mode: "date", fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
    sentAt: datetime("sent_at", { mode: "date", fsp: 3 }),
    createdAt: created(),
    updatedAt: datetime("updated_at", { mode: "date", fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
  },
  (table) => [
    uniqueIndex("email_outbox_application_kind_unique").on(table.applicationId, table.kind),
    index("email_outbox_status_scheduled_idx").on(table.status, table.scheduledAt),
  ],
);

export const submissionRateEvents = mysqlTable(
  "submission_rate_events",
  {
    id: id(),
    keyHash: varchar("key_hash", { length: 128 }).notNull(),
    createdAt: created(),
  },
  (table) => [index("submission_rate_events_key_created_idx").on(table.keyHash, table.createdAt)],
);
