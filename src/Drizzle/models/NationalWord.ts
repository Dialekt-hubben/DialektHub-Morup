import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const nationalWordTable = sqliteTable("national_word_table", {
    id: int().primaryKey({ autoIncrement: true }),
    word: text().notNull(),
    description: text(),
});
