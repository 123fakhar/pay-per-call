import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { logger } from "@/lib/logger";

const LOCK_KEY = 87123451;

async function main() {
  const url = process.env.DATABASE_MIGRATE_URL ?? process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_MIGRATE_URL or DATABASE_URL is required");
  }

  const sql = postgres(url, { max: 1 });
  try {
    await sql`select pg_advisory_lock(${LOCK_KEY})`;
    await sql`select 1`;
    const db = drizzle(sql);
    await migrate(db, { migrationsFolder: "./drizzle" });
    const appUser = process.env.APP_DB_USER;
    if (appUser) {
      await sql.unsafe(
        `GRANT USAGE ON SCHEMA public TO ${quoteIdent(appUser)};
         GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ${quoteIdent(appUser)};
         GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ${quoteIdent(appUser)};
         ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ${quoteIdent(appUser)};`,
      );
    }
    logger.info("migrations_complete");
  } finally {
    await sql`select pg_advisory_unlock(${LOCK_KEY})`;
    await sql.end({ timeout: 5 });
  }
}

function quoteIdent(value: string) {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) {
    throw new Error("Invalid database role name");
  }
  return `"${value}"`;
}

main().catch((error) => {
  logger.error("migrations_failed");
  console.error(error instanceof Error ? error.message : "unknown_error");
  process.exit(1);
});
