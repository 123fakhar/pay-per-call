import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/lib/db/schema";
import { ensureMysql, isMysqlUrl, mysqlDb, mysqlSchema, pingMysql } from "@/lib/db/mysql";

type Db = ReturnType<typeof drizzle<typeof schema>>;

const globalForDb = globalThis as unknown as {
  sql?: ReturnType<typeof postgres>;
  db?: Db;
};

function databaseUrl() {
  const url = process.env["DATABASE_URL"];
  if (!url) {
    throw new Error("DATABASE_URL is not configured");
  }
  return url;
}

export async function openDatabase(): Promise<{
  db: ReturnType<typeof getDb>;
  applications: typeof schema.applications;
  emailOutbox: typeof schema.emailOutbox;
  submissionRateEvents: typeof schema.submissionRateEvents;
}> {
  if (isMysqlUrl()) {
    await ensureMysql();
    return {
      db: mysqlDb() as unknown as ReturnType<typeof getDb>,
      applications: mysqlSchema.applications as unknown as typeof schema.applications,
      emailOutbox: mysqlSchema.emailOutbox as unknown as typeof schema.emailOutbox,
      submissionRateEvents: mysqlSchema.submissionRateEvents as unknown as typeof schema.submissionRateEvents,
    };
  }
  return {
    db: getDb(),
    applications: schema.applications,
    emailOutbox: schema.emailOutbox,
    submissionRateEvents: schema.submissionRateEvents,
  };
}

export function getSql() {
  if (!globalForDb.sql) {
    globalForDb.sql = postgres(databaseUrl(), {
      max: Number(process.env.DATABASE_POOL_MAX ?? 10),
      idle_timeout: 20,
      connect_timeout: 10,
      max_lifetime: 60 * 30,
      prepare: false,
    });
  }
  return globalForDb.sql;
}

export function getDb() {
  if (!globalForDb.db) {
    globalForDb.db = drizzle(getSql(), { schema });
  }
  return globalForDb.db;
}

export async function pingDatabase() {
  if (isMysqlUrl()) {
    await pingMysql();
    return;
  }
  const sql = getSql();
  await sql`select 1 as ok`;
}
