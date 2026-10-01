CREATE UNIQUE INDEX IF NOT EXISTS "variety_relations_edge_unique" ON "variety_relations" USING btree ("from_flower_record_id","to_flower_record_id","relation_type");--> statement-breakpoint
ALTER TABLE "variety_relations" ADD CONSTRAINT "variety_relations_no_self" CHECK ("from_flower_record_id" <> "to_flower_record_id");
