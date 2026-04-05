ALTER TABLE "player_progress" ALTER COLUMN "current_location" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "player_progress" ALTER COLUMN "current_location" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "provider" SET DEFAULT 'local';--> statement-breakpoint
ALTER TABLE "player_missions" ADD COLUMN "story_id" text;--> statement-breakpoint
ALTER TABLE "player_progress" ADD COLUMN "current_story_name" text;--> statement-breakpoint
ALTER TABLE "player_progress" ADD COLUMN "current_npc_id" text;--> statement-breakpoint
ALTER TABLE "player_progress" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "name" text DEFAULT 'Viajero' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_hash" text;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE("email");