CREATE INDEX IF NOT EXISTS "analytics_events_event_type_idx" ON "analytics_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "analytics_events_flower_identity_id_idx" ON "analytics_events" USING btree ("flower_identity_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "analytics_events_created_at_idx" ON "analytics_events" USING btree ("created_at");
