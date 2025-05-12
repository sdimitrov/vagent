CREATE TABLE "social_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"platform" varchar(50) NOT NULL,
	"platform_user_id" varchar(255) NOT NULL,
	"platform_username" varchar(255),
	"access_token" text NOT NULL,
	"refresh_token" text,
	"scopes" text,
	"token_type" varchar(50),
	"expires_at" timestamp with time zone,
	"connection_status" varchar(50) DEFAULT 'active' NOT NULL,
	"last_validated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "platform_user_unique_idx" ON "social_connections" USING btree ("user_id","platform","platform_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_id_idx" ON "social_connections" USING btree ("user_id");