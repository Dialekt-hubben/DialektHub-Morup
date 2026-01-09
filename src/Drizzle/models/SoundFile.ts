import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const soundFileTable = sqliteTable("sound_file_table", {
  id: int().primaryKey({ autoIncrement: true }),
  fileName: text().notNull(),
  url: text().notNull(),
});