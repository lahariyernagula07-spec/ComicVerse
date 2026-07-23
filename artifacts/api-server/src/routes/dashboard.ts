import { Router } from "express";
import { eq, sql } from "drizzle-orm";
import { db } from "@workspace/db";
import { comicsTable, panelsTable, likesTable, charactersTable } from "@workspace/db/schema";
import { requireAuth } from "../app";

const router = Router();

router.get("/stats", requireAuth, async (req, res) => {
  const userId = (req as any).userId;

  const [comicStats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      published: sql<number>`sum(case when published then 1 else 0 end)::int`,
    })
    .from(comicsTable)
    .where(eq(comicsTable.userId, userId));

  const userComics = await db.select({ id: comicsTable.id }).from(comicsTable).where(eq(comicsTable.userId, userId));
  const comicIds = userComics.map(c => c.id);

  let totalLikesReceived = 0;
  if (comicIds.length > 0) {
    const [likeRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(likesTable)
      .where(sql`${likesTable.comicId} = ANY(${sql.raw(`ARRAY[${comicIds.join(",")}]::int[]`)})`)
    totalLikesReceived = likeRow?.count ?? 0;
  }

  const [charRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(charactersTable)
    .where(eq(charactersTable.userId, userId));

  // Recent activity: last 5 comics created/published
  const recentComics = await db
    .select()
    .from(comicsTable)
    .where(eq(comicsTable.userId, userId))
    .orderBy(comicsTable.updatedAt)
    .limit(5);

  const recentActivity = recentComics.map(c => ({
    type: c.published ? "comic_published" : "comic_created",
    comicId: c.id,
    comicTitle: c.title,
    timestamp: c.updatedAt,
  }));

  res.json({
    totalComics: comicStats?.total ?? 0,
    publishedComics: comicStats?.published ?? 0,
    totalLikesReceived,
    totalCharacters: charRow?.count ?? 0,
    recentActivity,
  });
});

export default router;
