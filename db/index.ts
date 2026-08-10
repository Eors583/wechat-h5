import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import Database from "better-sqlite3";
import {
  drizzle,
  type BetterSQLite3Database,
} from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "./schema";

type LeadDatabase = BetterSQLite3Database<typeof schema>;
type DatabaseGlobals = typeof globalThis & {
  __leadDatabase?: LeadDatabase;
};

const databaseGlobals = globalThis as DatabaseGlobals;

function openDatabase() {
  const configuredPath = process.env.DATABASE_PATH?.trim() || "./data/leads.sqlite";
  const databasePath = configuredPath === ":memory:" ? configuredPath : resolve(configuredPath);

  if (databasePath !== ":memory:") {
    mkdirSync(dirname(databasePath), { recursive: true });
  }

  const sqlite = new Database(databasePath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("busy_timeout = 5000");
  sqlite.pragma("foreign_keys = ON");
  const database = drizzle(sqlite, { schema });
  const migrationsFolder = resolve(
    process.env.DATABASE_MIGRATIONS_PATH?.trim() || "./drizzle",
  );
  migrate(database, { migrationsFolder });

  return database;
}

export function getDb(): LeadDatabase {
  databaseGlobals.__leadDatabase ??= openDatabase();
  return databaseGlobals.__leadDatabase;
}
