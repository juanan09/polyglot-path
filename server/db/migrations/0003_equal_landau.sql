ALTER TABLE "player_progress" ADD COLUMN "current_story_id" text;--> statement-breakpoint
ALTER TABLE "player_progress" ADD COLUMN "grammar_score" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "player_progress" ADD COLUMN "vocabulary_learned" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "player_progress" ADD COLUMN "dialogue_frequency" integer DEFAULT 0 NOT NULL;