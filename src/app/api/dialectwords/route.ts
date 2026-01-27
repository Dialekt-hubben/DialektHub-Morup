
import { NextRequest, NextResponse } from "next/server";
import { dialectWordTable } from "@/Drizzle/models/DialectWord";
import db from "@/Drizzle";
import { sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  
  const { searchParams } = new URL(req.url); // Hämta query-parametrar för paginering
  const page = parseInt(searchParams.get("page") || "1", 10); // Sätter standard till sida 1
  const paginationSize = parseInt(searchParams.get("pageSize") || "10", 10); // Sätter standard till 10 poster per sida
  
  // Beräkna offset för paginering
  const pagineringOffset = (page - 1) * paginationSize;

  // Total antal poster i tabellen
  const [{ count }] = await db.select({ count: sql`COUNT(*)` }).from(dialectWordTable);
  const total = Number(count);
  
  // Hämta endast rätt sida direkt från databasen
  const data = await db
  .select()
  .from(dialectWordTable)
  .limit(paginationSize)
  .offset(pagineringOffset);
  
  return NextResponse.json({
    pagineringOffset,
    page,
    paginationSize,
    total,
    data,
  });
}
