import db from "@/Drizzle";
import { sql, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { dialectWordTable } from "@/Drizzle/models/DialectWord";
import { userTable } from "@/Drizzle/models/User";
import { nationalWordTable } from "@/Drizzle/models/NationalWord";
import { soundFileTable } from "@/Drizzle/models/SoundFile";

// API-route to fetch paginated dialect words data
export async function GET(req: NextRequest) {
  // Get query parameters (page number and page size)
  const { searchParams } = new URL(req.url); // Ex: /api/dialectwords?page=1&pageSize=10
  const page = parseInt(searchParams.get("page") || "1", 10); // Default: page 1
  const paginationSize = parseInt(searchParams.get("pageSize") || "10", 10); // Default: 10 rows per page

  // Calculate offset for SQL query (for pagination)
  const paginationOffset = (page - 1) * paginationSize;

  // Get total number of rows in the table (to be able to show number of pages)
  const [{ count }] = await db.select({ count: sql`COUNT(*)` }).from(dialectWordTable);
  const total = Number(count);

  // Fetch data from the database with join against user, national word, and sound file
  const data = await db
    .select({
      id: dialectWordTable.id,
      word: dialectWordTable.word,
      pronunciation: dialectWordTable.pronunciation,
      phrase: dialectWordTable.phrase,
      status: dialectWordTable.status,
      userName: userTable.name,
      nationalWord: nationalWordTable.word,
      soundFileUrl: soundFileTable.url,
    })
    .from(dialectWordTable)
    .leftJoin(userTable, eq(dialectWordTable.userId, userTable.id))
    .leftJoin(nationalWordTable, eq(dialectWordTable.nationalWordId, nationalWordTable.id))
    .leftJoin(soundFileTable, eq(dialectWordTable.soundFileId, soundFileTable.id))
    .limit(paginationSize)
    .offset(paginationOffset);

  // Return data and pagination info as JSON to frontend
  return NextResponse.json({
    paginationOffset,
    page,
    paginationSize,
    total,
    data,
  });
}