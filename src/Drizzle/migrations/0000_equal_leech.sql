CREATE TABLE `dialect_word_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`word` text NOT NULL,
	`pronunciation` text NOT NULL,
	`phrase` text NOT NULL,
	`status` integer DEFAULT 0 NOT NULL,
	`userId` integer NOT NULL,
	`nationalWordId` integer NOT NULL,
	`soundFileId` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user_table`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`nationalWordId`) REFERENCES `national_word_table`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`soundFileId`) REFERENCES `sound_file_table`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `national_word_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`word` text NOT NULL,
	`description` text
);
--> statement-breakpoint
CREATE TABLE `sound_file_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`fileName` text NOT NULL,
	`url` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`age` integer NOT NULL,
	`email` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_table_email_unique` ON `user_table` (`email`);