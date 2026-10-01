import { sql } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "@/db/schema";

const IDENTIFIER_PREFIX = "VP-";

type DbLike = Pick<PostgresJsDatabase<typeof schema>, "execute">;

export async function allocatePublicIdentifier(db: DbLike): Promise<string> {
  const result = await db.execute(
    sql`SELECT nextval('flower_public_identifier_seq') AS n`,
  );
  const row = result[0] as { n: string | number | bigint } | undefined;
  const next = Number(row?.n);

  if (!Number.isFinite(next) || next < 1) {
    throw new Error("Failed to allocate public identifier");
  }

  return `${IDENTIFIER_PREFIX}${String(next).padStart(4, "0")}`;
}

/** Keeps the sequence aligned when identities use explicit VP-#### values (e.g. demo seed). */
export async function syncPublicIdentifierSequence(db: DbLike): Promise<void> {
  await db.execute(sql`
    SELECT setval(
      'flower_public_identifier_seq',
      GREATEST(
        COALESCE(
          (
            SELECT MAX(CAST(SUBSTRING(public_identifier FROM 4) AS INTEGER))
            FROM flower_identities
            WHERE public_identifier ~ '^VP-[0-9]+$'
          ),
          0
        ),
        1
      ),
      true
    )
  `);
}

export function isPublicIdentifier(value: string): boolean {
  return /^VP-\d{4,}$/.test(value);
}
