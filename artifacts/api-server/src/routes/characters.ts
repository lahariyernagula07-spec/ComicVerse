import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { db } from "@workspace/db";
import { charactersTable } from "@workspace/db/schema";
import { requireAuth } from "../app";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  const characters = await db
    .select()
    .from(charactersTable)
    .where(eq(charactersTable.userId, userId))
    .orderBy(charactersTable.createdAt);
  res.json(characters);
});

router.post("/", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  const { name, description, personality, visualStyle, avatarUrl } = req.body;
  if (!name) {
    res.status(400).json({ error: "name is required" });
    return;
  }
  const [character] = await db
    .insert(charactersTable)
    .values({ userId, name, description: description ?? "", personality: personality ?? "", visualStyle: visualStyle ?? "", avatarUrl })
    .returning();
  res.status(201).json(character);
});

router.get("/:id", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  const id = parseInt(String(req.params.id));
  const [character] = await db
    .select()
    .from(charactersTable)
    .where(and(eq(charactersTable.id, id), eq(charactersTable.userId, userId)));
  if (!character) { res.status(404).json({ error: "Not found" }); return; }
  res.json(character);
});

router.put("/:id", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  const id = parseInt(String(req.params.id));
  const { name, description, personality, visualStyle, avatarUrl } = req.body;
  const [updated] = await db
    .update(charactersTable)
    .set({ name, description, personality, visualStyle, avatarUrl, updatedAt: new Date() })
    .where(and(eq(charactersTable.id, id), eq(charactersTable.userId, userId)))
    .returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(updated);
});

router.delete("/:id", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  const id = parseInt(String(req.params.id));
  const deleted = await db
    .delete(charactersTable)
    .where(and(eq(charactersTable.id, id), eq(charactersTable.userId, userId)))
    .returning();
  if (!deleted.length) { res.status(404).json({ error: "Not found" }); return; }
  res.status(204).send();
});

export default router;
