import db from ".";
import { dialectWordTable } from "../Drizzle/models/DialectWord";
import { nationalWordTable } from "../Drizzle/models/NationalWord";
import { soundFileTable } from "../Drizzle/models/SoundFile";
import { userTable } from "../Drizzle/models/User";
import { like, eq } from "drizzle-orm";

export async function searchDialectWords(query: string) {
  if (!query || query.length < 2) return [];
  if (query.length > 50) return [];  // prevent overly long queries
  if(!query.trim()) return []; // prevent searching only whitespace
  if (/[%_]/.test(query)) return []; // prevent wildcard characters

  return db
    .select({
      id: dialectWordTable.id,
      word: dialectWordTable.word,
      pronunciation: dialectWordTable.pronunciation,
      phrase: dialectWordTable.phrase,

      nationalWord: nationalWordTable.word,
      description: nationalWordTable.description,

      soundUrl: soundFileTable.url,
      author: userTable.name,
    })
    .from(dialectWordTable)
    .leftJoin(
      nationalWordTable,
      eq(dialectWordTable.nationalWordId, nationalWordTable.id),
    )
    .leftJoin(
      soundFileTable,
      eq(dialectWordTable.soundFileId, soundFileTable.id),
    )
    .leftJoin(userTable, eq(dialectWordTable.userId, userTable.id))
    .where(like(dialectWordTable.word, `%${query}%`))
    .limit(10);
}
