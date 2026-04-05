CREATE TABLE "player_errors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"error_description" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "player_vocabulary" ADD COLUMN "word_type" text DEFAULT 'word' NOT NULL;--> statement-breakpoint
ALTER TABLE "player_errors" ADD CONSTRAINT "player_errors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_vocabulary" ADD CONSTRAINT "uq_user_word" UNIQUE("user_id","word");