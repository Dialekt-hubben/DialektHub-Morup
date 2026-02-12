import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { nationalWordTable } from "./NationalWord";
import { soundFileTable } from "./SoundFile";
import { user } from "./auth-schema";

export const dialectWordTable = sqliteTable("dialect_word_table", {
    id: int().primaryKey({ autoIncrement: true }),
    word: text().notNull(),
    pronunciation: text().notNull(),
    phrase: text().notNull(),
    status: int().notNull().default(0),
    userId: text()
        .references(() => user.id)
        .notNull(),
    nationalWordId: int()
        .references(() => nationalWordTable.id)
        .notNull(),
    soundFileId: int()
        .references(() => soundFileTable.id)
        .notNull(),
});
