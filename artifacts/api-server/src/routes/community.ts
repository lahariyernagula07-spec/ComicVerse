import { Router } from "express";
import { eq, and, desc, sql, count } from "drizzle-orm";
import { db } from "@workspace/db";
import { comicsTable, panelsTable, likesTable, userProfilesTable } from "@workspace/db/schema";
import { getAuth } from "@clerk/express";
import { requireAuth } from "../app";

const router = Router();

router.get("/feed", async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, parseInt(req.query.limit as string) || 12);
  const offset = (page - 1) * limit;
  const styleFilter = req.query.style as string | undefined;

  const auth = getAuth(req);
  const currentUserId = (auth?.sessionClaims as { userId?: string })?.userId ?? auth?.userId ?? null;

  let query = db
    .select({
      id: comicsTable.id,
      title: comicsTable.title,
      description: comicsTable.description,
      style: comicsTable.style,
      template: comicsTable.template,
      coverImageData: comicsTable.coverImageData,
      userId: comicsTable.userId,
      createdAt: comicsTable.createdAt,
    })
    .from(comicsTable)
    .where(eq(comicsTable.published, true))
    .orderBy(desc(comicsTable.createdAt))
    .limit(limit)
    .offset(offset)
    .$dynamic();

  const comics = await query;

  const enriched = await Promise.all(comics.map(async (comic) => {
    const [likeRow] = await db.select({ count: sql<number>`count(*)::int` }).from(likesTable).where(eq(likesTable.comicId, comic.id));
    const [panelRow] = await db.select({ count: sql<number>`count(*)::int` }).from(panelsTable).where(eq(panelsTable.comicId, comic.id));
    let userHasLiked = false;
    if (currentUserId) {
      const [existing] = await db.select().from(likesTable).where(and(eq(likesTable.comicId, comic.id), eq(likesTable.userId, currentUserId)));
      userHasLiked = !!existing;
    }
    const [profile] = await db.select().from(userProfilesTable).where(eq(userProfilesTable.userId, comic.userId));
    return {
      ...comic,
      likesCount: likeRow?.count ?? 0,
      userHasLiked,
      panelCount: panelRow?.count ?? 0,
      authorName: profile?.displayName ?? "Anonymous",
      authorId: comic.userId,
    };
  }));

  const [totalRow] = await db.select({ count: sql<number>`count(*)::int` }).from(comicsTable).where(eq(comicsTable.published, true));
  const total = totalRow?.count ?? 0;

  res.json({
    comics: enriched,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
});

router.get("/comics/:id", async (req, res) => {
  const id = parseInt(String(req.params.id));
  const auth = getAuth(req);
  const currentUserId = (auth?.sessionClaims as { userId?: string })?.userId ?? auth?.userId ?? null;

  const [comic] = await db.select().from(comicsTable).where(and(eq(comicsTable.id, id), eq(comicsTable.published, true)));
  if (!comic) { res.status(404).json({ error: "Not found" }); return; }

  const panels = await db.select().from(panelsTable).where(eq(panelsTable.comicId, id)).orderBy(panelsTable.order);
  const [likeRow] = await db.select({ count: sql<number>`count(*)::int` }).from(likesTable).where(eq(likesTable.comicId, id));
  let userHasLiked = false;
  if (currentUserId) {
    const [existing] = await db.select().from(likesTable).where(and(eq(likesTable.comicId, id), eq(likesTable.userId, currentUserId)));
    userHasLiked = !!existing;
  }
  const [profile] = await db.select().from(userProfilesTable).where(eq(userProfilesTable.userId, comic.userId));

  res.json({
    ...comic,
    likesCount: likeRow?.count ?? 0,
    userHasLiked,
    authorName: profile?.displayName ?? "Anonymous",
    authorId: comic.userId,
    panelCount: panels.length,
    panels: panels.map(p => ({ ...p, characterIds: JSON.parse(p.characterIds || "[]") })),
  });
});

router.post("/comics/:id/like", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  const id = parseInt(String(req.params.id));
  const [comic] = await db.select().from(comicsTable).where(and(eq(comicsTable.id, id), eq(comicsTable.published, true)));
  if (!comic) { res.status(404).json({ error: "Not found" }); return; }

  const [existing] = await db.select().from(likesTable).where(and(eq(likesTable.comicId, id), eq(likesTable.userId, userId)));
  if (existing) {
    await db.delete(likesTable).where(and(eq(likesTable.comicId, id), eq(likesTable.userId, userId)));
  } else {
    await db.insert(likesTable).values({ userId, comicId: id });
  }
  const [likeRow] = await db.select({ count: sql<number>`count(*)::int` }).from(likesTable).where(eq(likesTable.comicId, id));
  res.json({ liked: !existing, likesCount: likeRow?.count ?? 0 });
});

export default router;
