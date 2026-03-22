import { mysqlTable, serial, text, varchar, int } from "drizzle-orm/mysql-core";
import { nationalWordTable } from "./NationalWord";
import { soundFileTable } from "./SoundFile";
import { user } from "./auth-schema";

export const dialectWordTable = mysqlTable("dialect_word_table", {
    id: serial("id").primaryKey(),
    word: text("word").notNull(),
    pronunciation: text("pronunciation"),
    phrase: text("phrase"),
    status: int("status").default(0),
    userId: varchar("user_id", { length: 36 })
        .references(() => user.id)
        .notNull(),
    nationalWordId: int("national_word_id")
        .references(() => nationalWordTable.id)
        .notNull(),
    soundFileId: int("sound_file_id").references(() => soundFileTable.id),
});
