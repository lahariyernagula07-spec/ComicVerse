import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { db } from "@workspace/db";
import { panelsTable, comicsTable } from "@workspace/db/schema";
import { requireAuth } from "../app";

const router = Router();

router.put("/:id", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  const id = parseInt(String(req.params.id));
  const { order, dialogue, caption, imageData, imagePrompt, characterIds } = req.body;
  // Verify ownership via comic join
  const [panel] = await db.select().from(panelsTable).where(eq(panelsTable.id, id));
  if (!panel) { res.status(404).json({ error: "Not found" }); return; }
  const [comic] = await db.select().from(comicsTable).where(and(eq(comicsTable.id, panel.comicId), eq(comicsTable.userId, userId)));
  if (!comic) { res.status(403).json({ error: "Forbidden" }); return; }
  const [updated] = await db
    .update(panelsTable)
    .set({
      ...(order !== undefined && { order }),
      ...(dialogue !== undefined && { dialogue }),
      ...(caption !== undefined && { caption }),
      ...(imageData !== undefined && { imageData }),
      ...(imagePrompt !== undefined && { imagePrompt }),
      ...(characterIds !== undefined && { characterIds: JSON.stringify(characterIds) }),
      updatedAt: new Date(),
    })
    .where(eq(panelsTable.id, id))
    .returning();
  res.json({ ...updated, characterIds: JSON.parse(updated.characterIds || "[]") });
});

router.delete("/:id", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  const id = parseInt(String(req.params.id));
  const [panel] = await db.select().from(panelsTable).where(eq(panelsTable.id, id));
  if (!panel) { res.status(404).json({ error: "Not found" }); return; }
  const [comic] = await db.select().from(comicsTable).where(and(eq(comicsTable.id, panel.comicId), eq(comicsTable.userId, userId)));
  if (!comic) { res.status(403).json({ error: "Forbidden" }); return; }
  await db.delete(panelsTable).where(eq(panelsTable.id, id));
  res.status(204).send();
});

export default router;
