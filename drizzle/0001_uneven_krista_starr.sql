CREATE TABLE "booking_inquiries" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"inquiry_type" text NOT NULL,
	"contact_name" text NOT NULL,
	"company" text DEFAULT '' NOT NULL,
	"email" text NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"project_name" text DEFAULT '' NOT NULL,
	"proposed_dates" text DEFAULT '' NOT NULL,
	"location" text DEFAULT '' NOT NULL,
	"details" text DEFAULT '' NOT NULL,
	"budget_range" text DEFAULT '' NOT NULL,
	"preferred_contact" text DEFAULT '' NOT NULL,
	"source" text DEFAULT 'website' NOT NULL,
	"referrer" text DEFAULT '' NOT NULL,
	"utm_source" text DEFAULT '' NOT NULL,
	"utm_medium" text DEFAULT '' NOT NULL,
	"utm_campaign" text DEFAULT '' NOT NULL,
	"utm_content" text DEFAULT '' NOT NULL,
	"utm_term" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "portfolio_settings" ADD COLUMN "availability_status" text DEFAULT 'available' NOT NULL;--> statement-breakpoint
ALTER TABLE "portfolio_settings" ADD COLUMN "primary_market" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "portfolio_settings" ADD COLUMN "travel_available" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "portfolio_settings" ADD COLUMN "additional_markets" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "portfolio_settings" ADD COLUMN "availability_note" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "portfolio_settings" ADD COLUMN "comp_card_primary_media_id" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "portfolio_settings" ADD COLUMN "comp_card_media_ids" jsonb DEFAULT '[]'::jsonb NOT NULL;