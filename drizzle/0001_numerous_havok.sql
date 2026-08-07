ALTER TABLE `leads` ADD `notification_status` text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `leads` ADD `notification_provider_id` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `leads` ADD `notification_error` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `leads` ADD `notification_sent_at` text DEFAULT '' NOT NULL;