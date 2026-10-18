import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "@/lib/db/schema.mysql";

type MysqlDb = ReturnType<typeof drizzle<typeof schema>>;

const globalForMysql = globalThis as unknown as {
  mysqlPool?: mysql.Pool;
  mysqlDb?: MysqlDb;
  mysqlReady?: Promise<void>;
};

function mysqlUrl() {
  const url = process.env["DATABASE_URL"] ?? "";
  return url.replace("@localhost:", "@127.0.0.1:");
}

export function isMysqlUrl(url = process.env["DATABASE_URL"] ?? "") {
  return url.startsWith("mysql:") || url.startsWith("mysql2:");
}

function pool() {
  if (!globalForMysql.mysqlPool) {
    globalForMysql.mysqlPool = mysql.createPool({
      uri: mysqlUrl(),
      connectionLimit: Number(process.env["DATABASE_POOL_MAX"] ?? 5),
      waitForConnections: true,
    });
  }
  return globalForMysql.mysqlPool;
}

export async function ensureMysql() {
  if (!globalForMysql.mysqlReady) {
    globalForMysql.mysqlReady = createMysqlTables();
  }
  await globalForMysql.mysqlReady;
}

async function createMysqlTables() {
  const db = pool();
  await db.query(`
    CREATE TABLE IF NOT EXISTS applications (
      id VARCHAR(36) NOT NULL PRIMARY KEY,
      first_name VARCHAR(80) NOT NULL,
      last_name VARCHAR(80) NOT NULL,
      email VARCHAR(320) NOT NULL,
      phone VARCHAR(40) NULL,
      timezone VARCHAR(80) NOT NULL,
      legal_entity_type VARCHAR(80) NOT NULL,
      company_name VARCHAR(160) NOT NULL,
      website_url VARCHAR(500) NOT NULL,
      address_line1 VARCHAR(200) NOT NULL,
      address_line2 VARCHAR(200) NULL,
      country VARCHAR(80) NOT NULL,
      city VARCHAR(80) NOT NULL,
      postal_code VARCHAR(20) NOT NULL,
      messaging_service VARCHAR(40) NOT NULL,
      messenger_username VARCHAR(120) NOT NULL,
      best_time_to_contact VARCHAR(160) NULL,
      top_verticals TEXT NOT NULL,
      campaigns JSON NOT NULL,
      traffic_source_details TEXT NOT NULL,
      monthly_revenue_range VARCHAR(40) NOT NULL,
      monthly_revenue_notes TEXT NULL,
      reference_one_name VARCHAR(120) NOT NULL,
      reference_one_contact VARCHAR(200) NOT NULL,
      reference_two_name VARCHAR(120) NOT NULL,
      reference_two_contact VARCHAR(200) NOT NULL,
      primary_channel_details TEXT NOT NULL,
      secondary_channel_details TEXT NOT NULL,
      how_entered_affiliate TEXT NOT NULL,
      industry_experience VARCHAR(40) NOT NULL,
      referral_source VARCHAR(500) NOT NULL,
      previous_relationship TEXT NOT NULL,
      internal_referral VARCHAR(200) NULL,
      terms_accepted INT NOT NULL,
      terms_version VARCHAR(40) NOT NULL,
      terms_accepted_at DATETIME(3) NOT NULL,
      status VARCHAR(32) NOT NULL DEFAULT 'pending',
      admin_reviewed_at DATETIME(3) NULL,
      admin_notes TEXT NULL,
      submitter_key_hash VARCHAR(128) NOT NULL,
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    )
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS email_outbox (
      id VARCHAR(36) NOT NULL PRIMARY KEY,
      application_id VARCHAR(36) NOT NULL,
      kind VARCHAR(40) NOT NULL,
      to_address VARCHAR(320) NOT NULL,
      subject VARCHAR(300) NOT NULL,
      body_text TEXT NOT NULL,
      status VARCHAR(32) NOT NULL DEFAULT 'pending',
      attempts INT NOT NULL DEFAULT 0,
      last_error VARCHAR(300) NULL,
      locked_at DATETIME(3) NULL,
      locked_by VARCHAR(80) NULL,
      scheduled_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      sent_at DATETIME(3) NULL,
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      UNIQUE KEY email_outbox_application_kind_unique (application_id, kind)
    )
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS submission_rate_events (
      id VARCHAR(36) NOT NULL PRIMARY KEY,
      key_hash VARCHAR(128) NOT NULL,
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      KEY submission_rate_events_key_created_idx (key_hash, created_at)
    )
  `);
}

export function mysqlDb() {
  if (!globalForMysql.mysqlDb) {
    globalForMysql.mysqlDb = drizzle(pool(), { schema, mode: "default" }) as unknown as MysqlDb;
  }
  return globalForMysql.mysqlDb;
}

export async function pingMysql() {
  await ensureMysql();
  await pool().query("SELECT 1 AS ok");
}

export { schema as mysqlSchema };
