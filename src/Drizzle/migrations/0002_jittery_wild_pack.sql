DROP TABLE `user_table`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_dialect_word_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`word` text NOT NULL,
	`pronunciation` text NOT NULL,
	`phrase` text NOT NULL,
	`status` integer DEFAULT 0 NOT NULL,
	`userId` integer NOT NULL,
	`nationalWordId` integer NOT NULL,
	`soundFileId` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`nationalWordId`) REFERENCES `national_word_table`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`soundFileId`) REFERENCES `sound_file_table`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_dialect_word_table`("id", "word", "pronunciation", "phrase", "status", "userId", "nationalWordId", "soundFileId") SELECT "id", "word", "pronunciation", "phrase", "status", "userId", "nationalWordId", "soundFileId" FROM `dialect_word_table`;--> statement-breakpoint
DROP TABLE `dialect_word_table`;--> statement-breakpoint
ALTER TABLE `__new_dialect_word_table` RENAME TO `dialect_word_table`;--> statement-breakpoint
PRAGMA foreign_keys=ON;