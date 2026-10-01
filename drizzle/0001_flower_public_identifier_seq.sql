CREATE SEQUENCE IF NOT EXISTS "flower_public_identifier_seq" START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
--> statement-breakpoint
SELECT setval(
  'flower_public_identifier_seq',
  GREATEST(
    COALESCE(
      (
        SELECT MAX(CAST(SUBSTRING("public_identifier" FROM 4) AS INTEGER))
        FROM "flower_identities"
        WHERE "public_identifier" ~ '^VP-[0-9]+$'
      ),
      0
    ),
    1
  ),
  true
);
