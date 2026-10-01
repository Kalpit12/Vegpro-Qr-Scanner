import "../src/env/load-local-env";
import { getDb } from "../src/db/index";
import { flowerIdentities } from "../src/db/schema";

async function main() {
  console.log("DATABASE_URL set:", Boolean(process.env.DATABASE_URL));
  const db = getDb();
  const rows = await db.select().from(flowerIdentities);
  console.log(
    "identities:",
    rows.map((r) => r.publicIdentifier).join(", ") || "(none)",
  );
}

main().catch((error) => {
  console.error("DB error:", error instanceof Error ? error.message : error);
  if (error && typeof error === "object" && "cause" in error) {
    console.error("cause:", (error as { cause?: unknown }).cause);
  }
  process.exit(1);
});
