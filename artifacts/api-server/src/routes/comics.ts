import { Router } from "express";
import { eq, and, sql } from "drizzle-orm";
import { db } from "@workspace/db";
import { comicsTable, panelsTable, likesTable } from "@workspace/db/schema";
import { requireAuth } from "../app";

const router = Router();

async function withLikeInfo(comics: typeof comicsTable.$inferSelect[], userId?: string) {
  return Promise.all(comics.map(async (comic) => {
    const [likeRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(likesTable)
      .where(eq(likesTable.comicId, comic.id));
    const likesCount = likeRow?.count ?? 0;
    let userHasLiked = false;
    if (userId) {
      const [existing] = await db
        .select()
        .from(likesTable)
        .where(and(eq(likesTable.comicId, comic.id), eq(likesTable.userId, userId)));
      userHasLiked = !!existing;
    }
    return { ...comic, likesCount, userHasLiked };
  }));
}

router.get("/", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  const comics = await db
    .select()
    .from(comicsTable)
    .where(eq(comicsTable.userId, userId))
    .orderBy(comicsTable.updatedAt);
  const result = await withLikeInfo(comics, userId);
  res.json(result);
});

router.post("/", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  const { title, description, style, template } = req.body;
  if (!title) { res.status(400).json({ error: "title is required" }); return; }
  const [comic] = await db
    .insert(comicsTable)
    .values({ userId, title, description, style: style ?? "manga", template: template ?? "4-panel" })
    .returning();
  res.status(201).json({ ...comic, likesCount: 0, userHasLiked: false });
});

router.get("/:id", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  const id = parseInt(String(req.params.id));
  const [comic] = await db
    .select()
    .from(comicsTable)
    .where(and(eq(comicsTable.id, id), eq(comicsTable.userId, userId)));
  if (!comic) { res.status(404).json({ error: "Not found" }); return; }
  const panels = await db
    .select()
    .from(panelsTable)
    .where(eq(panelsTable.comicId, id))
    .orderBy(panelsTable.order);
  const parsedPanels = panels.map(p => ({ ...p, characterIds: JSON.parse(p.characterIds || "[]") }));
  const [likeRow] = await db.select({ count: sql<number>`count(*)::int` }).from(likesTable).where(eq(likesTable.comicId, id));
  const [existing] = await db.select().from(likesTable).where(and(eq(likesTable.comicId, id), eq(likesTable.userId, userId)));
  res.json({ ...comic, likesCount: likeRow?.count ?? 0, userHasLiked: !!existing, panels: parsedPanels });
});

router.put("/:id", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  const id = parseInt(String(req.params.id));
  const { title, description, style, template, coverImageData } = req.body;
  const [updated] = await db
    .update(comicsTable)
    .set({ title, description, style, template, coverImageData, updatedAt: new Date() })
    .where(and(eq(comicsTable.id, id), eq(comicsTable.userId, userId)))
    .returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  const [likeRow] = await db.select({ count: sql<number>`count(*)::int` }).from(likesTable).where(eq(likesTable.comicId, id));
  const [existing] = await db.select().from(likesTable).where(and(eq(likesTable.comicId, id), eq(likesTable.userId, userId)));
  res.json({ ...updated, likesCount: likeRow?.count ?? 0, userHasLiked: !!existing });
});

router.delete("/:id", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  const id = parseInt(String(req.params.id));
  const deleted = await db
    .delete(comicsTable)
    .where(and(eq(comicsTable.id, id), eq(comicsTable.userId, userId)))
    .returning();
  if (!deleted.length) { res.status(404).json({ error: "Not found" }); return; }
  res.status(204).send();
});

router.post("/:id/publish", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  const id = parseInt(String(req.params.id));
  const { published } = req.body;
  const [updated] = await db
    .update(comicsTable)
    .set({ published: !!published, updatedAt: new Date() })
    .where(and(eq(comicsTable.id, id), eq(comicsTable.userId, userId)))
    .returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  const [likeRow] = await db.select({ count: sql<number>`count(*)::int` }).from(likesTable).where(eq(likesTable.comicId, id));
  const [existing] = await db.select().from(likesTable).where(and(eq(likesTable.comicId, id), eq(likesTable.userId, userId)));
  res.json({ ...updated, likesCount: likeRow?.count ?? 0, userHasLiked: !!existing });
});

export default router;
