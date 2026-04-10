ALTER TABLE `national_word_table` MODIFY COLUMN `word` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `role` varchar(50) DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE `national_word_table` ADD CONSTRAINT `national_word_table_word_unique` UNIQUE(`word`);