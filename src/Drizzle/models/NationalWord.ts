import { unique } from "drizzle-orm/gel-core";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const nationalWordTable = sqliteTable("national_word_table", {
    id: int().primaryKey({ autoIncrement: true }),
    word: text().unique().notNull(),
    description: text(),
});
