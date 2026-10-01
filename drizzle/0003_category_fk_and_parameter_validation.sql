ALTER TABLE "flower_records" ADD COLUMN IF NOT EXISTS "category_id" uuid;
--> statement-breakpoint
UPDATE "flower_records" AS fr
SET "category_id" = c."id"
FROM "categories" AS c
WHERE fr."category" = c."name" AND fr."category_id" IS NULL;
--> statement-breakpoint
UPDATE "flower_records" AS fr
SET "category_id" = (
  SELECT c."id" FROM "categories" AS c WHERE c."slug" = 'rose' LIMIT 1
)
WHERE fr."category_id" IS NULL;
--> statement-breakpoint
ALTER TABLE "flower_records" ALTER COLUMN "category_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "flower_records" ADD CONSTRAINT "flower_records_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "flower_records" DROP COLUMN IF EXISTS "category";
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "flower_records_category_idx" ON "flower_records" USING btree ("category_id");
--> statement-breakpoint
ALTER TABLE "parameter_definitions" ADD COLUMN IF NOT EXISTS "validation_config" text;
