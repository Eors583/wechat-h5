CREATE TABLE `leads` (
	`id` text PRIMARY KEY NOT NULL,
	`campaign_code` text NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`company` text DEFAULT '' NOT NULL,
	`job_title` text DEFAULT '' NOT NULL,
	`budget_range` text DEFAULT '' NOT NULL,
	`contact_time` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`utm_source` text DEFAULT '' NOT NULL,
	`utm_medium` text DEFAULT '' NOT NULL,
	`utm_campaign` text DEFAULT '' NOT NULL,
	`utm_content` text DEFAULT '' NOT NULL,
	`referrer` text DEFAULT '' NOT NULL,
	`landing_url` text DEFAULT '' NOT NULL,
	`consent_version` text NOT NULL,
	`consent_at` text NOT NULL,
	`idempotency_key` text NOT NULL,
	`request_fingerprint` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_leads_idempotency_key` ON `leads` (`idempotency_key`);--> statement-breakpoint
CREATE INDEX `idx_leads_campaign_created_at` ON `leads` (`campaign_code`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_leads_fingerprint_created_at` ON `leads` (`request_fingerprint`,`created_at`);--> statement-breakpoint
PRAGMA optimize;
