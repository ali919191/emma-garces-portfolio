CREATE TABLE "content_sections" (
	"slug" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" text PRIMARY KEY NOT NULL,
	"storage_key" text NOT NULL,
	"filename" text NOT NULL,
	"mime_type" text DEFAULT 'application/octet-stream' NOT NULL,
	"size" bigint DEFAULT 0 NOT NULL,
	"category" text NOT NULL,
	"caption" text DEFAULT '' NOT NULL,
	"photographer" text DEFAULT '' NOT NULL,
	"designer" text DEFAULT '' NOT NULL,
	"event" text DEFAULT '' NOT NULL,
	"date" text DEFAULT '' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"focal_point" text DEFAULT 'center' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "media_assets_storage_key_unique" UNIQUE("storage_key")
);
--> statement-breakpoint
CREATE TABLE "portfolio_settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"hero_media_id" text DEFAULT '' NOT NULL,
	"public_site" boolean DEFAULT true NOT NULL,
	"base_line" text DEFAULT '' NOT NULL,
	"selected_services" jsonb NOT NULL,
	"last_published_at" text DEFAULT '' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portfolio_videos" (
	"id" text PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"label" text DEFAULT '' NOT NULL,
	"designer" text DEFAULT '' NOT NULL,
	"year" text DEFAULT '' NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"full_name" text NOT NULL,
	"professional_name" text NOT NULL,
	"age" text DEFAULT '' NOT NULL,
	"city" text DEFAULT '' NOT NULL,
	"country" text DEFAULT '' NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"instagram" text DEFAULT '' NOT NULL,
	"tiktok" text DEFAULT '' NOT NULL,
	"website" text DEFAULT '' NOT NULL,
	"agency" text DEFAULT '' NOT NULL,
	"booking_contact" text DEFAULT '' NOT NULL,
	"bio" text DEFAULT '' NOT NULL,
	"height" text DEFAULT '' NOT NULL,
	"bust" text DEFAULT '' NOT NULL,
	"waist" text DEFAULT '' NOT NULL,
	"hips" text DEFAULT '' NOT NULL,
	"dress_size" text DEFAULT '' NOT NULL,
	"shoe_size" text DEFAULT '' NOT NULL,
	"hair" text DEFAULT '' NOT NULL,
	"eyes" text DEFAULT '' NOT NULL,
	"ethnicity" text DEFAULT '' NOT NULL,
	"languages" text DEFAULT '' NOT NULL,
	"citizenship" text DEFAULT '' NOT NULL,
	"travel_availability" text DEFAULT '' NOT NULL,
	"work_authorization" text DEFAULT '' NOT NULL,
	"visibility" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "runway_credits" (
	"id" text PRIMARY KEY NOT NULL,
	"event" text DEFAULT '' NOT NULL,
	"designer" text DEFAULT '' NOT NULL,
	"show_name" text DEFAULT '' NOT NULL,
	"city" text DEFAULT '' NOT NULL,
	"country" text DEFAULT '' NOT NULL,
	"year" text DEFAULT '' NOT NULL,
	"venue" text DEFAULT '' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"designer_base" text DEFAULT '' NOT NULL,
	"priority" text DEFAULT 'standard' NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
