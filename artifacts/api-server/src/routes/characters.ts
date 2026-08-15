import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { db } from "@workspace/db";
import { charactersTable } from "@workspace/db/schema";
import { requireAuth } from "../app";

const router = Router();

/**
 * GET ALL CHARACTERS
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;

    console.log("GET CHARACTERS:", userId);

    const characters = await db
      .select()
      .from(charactersTable)
      .where(eq(charactersTable.userId, userId))
      .orderBy(charactersTable.createdAt);

    console.log("GET CHARACTERS SUCCESS:", characters.length);

    res.json(characters);
  } catch (error: any) {
    console.error("========== GET CHARACTERS ERROR ==========");
      console.error("message:", error?.message);
console.error("code:", error?.code);
console.error("detail:", error?.detail);
console.error("hint:", error?.hint);
console.error("cause:", error?.cause);
console.error("cause message:", error?.cause?.message);
console.error("cause code:", error?.cause?.code);
console.error("cause detail:", error?.cause?.detail);
console.error("cause hint:", error?.cause?.hint);
console.error("FULL ERROR:", error);
console.error("stack:", error?.stack);  console.error("==========================================");

    res.status(500).json({
      error: "Failed to load characters",
      details: error?.message || "Database error",
    });
  }
});

/**
 * CREATE CHARACTER
 */
router.post("/", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;

    const {
      name,
      description,
      personality,
      visualStyle,
      avatarUrl,
    } = req.body;

    console.log("CREATE CHARACTER:", {
      userId,
      name,
      description,
      personality,
      visualStyle,
      avatarUrl,
    });

    if (!name || !String(name).trim()) {
      res.status(400).json({
        error: "name is required",
      });
      return;
    }

    const [character] = await db
      .insert(charactersTable)
      .values({
        userId,
        name: String(name).trim(),
        description: description ?? "",
        personality: personality ?? "",
        visualStyle: visualStyle ?? "",
        avatarUrl: avatarUrl ?? null,
      })
      .returning();

    console.log("CREATE CHARACTER SUCCESS:", character);

    res.status(201).json(character);
  } catch (error: any) {
    console.error("========== CREATE CHARACTER ERROR ==========");
    console.error("message:", error?.message);
    console.error("code:", error?.code);
    console.error("detail:", error?.detail);
    console.error("hint:", error?.hint);
    console.error("constraint:", error?.constraint);
    console.error("table:", error?.table);
    console.error("column:", error?.column);
    console.error("stack:", error?.stack);
    console.error("===========================================");

    res.status(500).json({
      error: "Failed to create character",
      details: error?.message || "Database error",
    });
  }
});

/**
 * GET CHARACTER BY ID
 */
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;

    const id = parseInt(
      Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id,
      10,
    );

    if (!Number.isFinite(id)) {
      res.status(400).json({
        error: "Invalid character ID",
      });
      return;
    }

    const [character] = await db
      .select()
      .from(charactersTable)
      .where(
        and(
          eq(charactersTable.id, id),
          eq(charactersTable.userId, userId),
        ),
      );

    if (!character) {
      res.status(404).json({
        error: "Character not found",
      });
      return;
    }

    res.json(character);
  } catch (error: any) {
    console.error("GET CHARACTER ERROR:", error);

    res.status(500).json({
      error: "Failed to load character",
      details: error?.message || "Database error",
    });
  }
});

/**
 * UPDATE CHARACTER
 */
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;

    const id = parseInt(
      Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id,
      10,
    );

    if (!Number.isFinite(id)) {
      res.status(400).json({
        error: "Invalid character ID",
      });
      return;
    }

    const {
      name,
      description,
      personality,
      visualStyle,
      avatarUrl,
    } = req.body;

    const [updated] = await db
      .update(charactersTable)
      .set({
        name,
        description,
        personality,
        visualStyle,
        avatarUrl: avatarUrl ?? null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(charactersTable.id, id),
          eq(charactersTable.userId, userId),
        ),
      )
      .returning();

    if (!updated) {
      res.status(404).json({
        error: "Character not found",
      });
      return;
    }

    res.json(updated);
  } catch (error: any) {
    console.error("UPDATE CHARACTER ERROR:", error);

    res.status(500).json({
      error: "Failed to update character",
      details: error?.message || "Database error",
    });
  }
});

/**
 * DELETE CHARACTER
 */
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;

    const id = parseInt(
      Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id,
      10,
    );

    if (!Number.isFinite(id)) {
      res.status(400).json({
        error: "Invalid character ID",
      });
      return;
    }

    const deleted = await db
      .delete(charactersTable)
      .where(
        and(
          eq(charactersTable.id, id),
          eq(charactersTable.userId, userId),
        ),
      )
      .returning();

    if (!deleted.length) {
      res.status(404).json({
        error: "Character not found",
      });
      return;
    }

    res.status(204).send();
  } catch (error: any) {
    console.error("DELETE CHARACTER ERROR:", error);

    res.status(500).json({
      error: "Failed to delete character",
      details: error?.message || "Database error",
    });
  }
});

export default router;