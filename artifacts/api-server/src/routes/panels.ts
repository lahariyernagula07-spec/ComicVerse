import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { db } from "@workspace/db";
import { panelsTable, comicsTable } from "@workspace/db/schema";
import { requireAuth } from "../app";

const router = Router({ mergeParams: true });

router.get("/", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  const comicId = parseInt(String(req.params.comicId));
  // Verify comic ownership
  const [comic] = await db.select().from(comicsTable).where(and(eq(comicsTable.id, comicId), eq(comicsTable.userId, userId)));
  if (!comic) { res.status(404).json({ error: "Comic not found" }); return; }
  const panels = await db.select().from(panelsTable).where(eq(panelsTable.comicId, comicId)).orderBy(panelsTable.order);
  res.json(panels.map(p => ({ ...p, characterIds: JSON.parse(p.characterIds || "[]") })));
});

router.post("/", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  const comicId = parseInt(String(req.params.comicId));
  const [comic] = await db.select().from(comicsTable).where(and(eq(comicsTable.id, comicId), eq(comicsTable.userId, userId)));
  if (!comic) { res.status(404).json({ error: "Comic not found" }); return; }
  const { order, dialogue, caption, imageData, imagePrompt, characterIds } = req.body;
  const [panel] = await db
    .insert(panelsTable)
    .values({
      comicId,
      order: order ?? 0,
      dialogue,
      caption,
      imageData,
      imagePrompt,
      characterIds: JSON.stringify(characterIds ?? []),
    })
    .returning();
  res.status(201).json({ ...panel, characterIds: JSON.parse(panel.characterIds || "[]") });
});

export default router;
