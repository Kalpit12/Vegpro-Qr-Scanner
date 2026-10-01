import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  postgresClient: ReturnType<typeof postgres> | undefined;
};

function getClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  if (!globalForDb.postgresClient) {
    globalForDb.postgresClient = postgres(url, { prepare: false });
  }

  return globalForDb.postgresClient;
}

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | undefined;

export function getDb() {
  if (!dbInstance) {
    dbInstance = drizzle(getClient(), { schema });
  }
  return dbInstance;
}

export type Db = ReturnType<typeof getDb>;
