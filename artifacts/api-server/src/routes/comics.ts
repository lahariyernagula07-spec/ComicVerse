import { Router } from "express";
import { eq, and, sql } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  comicsTable,
  panelsTable,
  likesTable,
} from "@workspace/db/schema";
import { requireAuth } from "../app";

const router = Router();

function getId(value: string | string[]) {
  return parseInt(
    Array.isArray(value) ? value[0] : value,
    10,
  );
}

async function withLikeInfo(
  comics: typeof comicsTable.$inferSelect[],
  userId?: string,
) {
  return Promise.all(
    comics.map(async (comic) => {
      const [likeRow] = await db
        .select({
          count: sql<number>`count(*)::int`,
        })
        .from(likesTable)
        .where(eq(likesTable.comicId, comic.id));

      const likesCount = likeRow?.count ?? 0;

      let userHasLiked = false;

      if (userId) {
        const [existing] = await db
          .select()
          .from(likesTable)
          .where(
            and(
              eq(likesTable.comicId, comic.id),
              eq(likesTable.userId, userId),
            ),
          );

        userHasLiked = !!existing;
      }

      return {
        ...comic,
        likesCount,
        userHasLiked,
      };
    }),
  );
}

/**
 * GET USER COMICS
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;

    console.log("GET COMICS:", userId);

    const comics = await db
      .select()
      .from(comicsTable)
      .where(eq(comicsTable.userId, userId))
      .orderBy(comicsTable.updatedAt);

    const result = await withLikeInfo(comics, userId);

    console.log("GET COMICS SUCCESS:", result.length);

    res.json(result);
  } catch (error: any) {
    console.error("========== GET COMICS ERROR ==========");
    console.error("message:", error?.message);
    console.error("code:", error?.code);
    console.error("detail:", error?.detail);
    console.error("hint:", error?.hint);
    console.error("stack:", error?.stack);
    console.error("======================================");

    res.status(500).json({
      error: "Failed to load comics",
      details: error?.message || "Database error",
    });
  }
});

/**
 * CREATE COMIC
 */
router.post("/", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;

    const {
      title,
      description,
      style,
      template,
    } = req.body;

    console.log("CREATE COMIC REQUEST:", {
      userId,
      title,
      description,
      style,
      template,
    });

    if (!title || !String(title).trim()) {
      res.status(400).json({
        error: "title is required",
      });
      return;
    }

    const [comic] = await db
      .insert(comicsTable)
      .values({
        userId,
        title: String(title).trim(),
        description: description ?? null,
        style: style ?? "manga",
        template: template ?? "4-panel",
      })
      .returning();

    if (!comic) {
      throw new Error("Comic was not returned after insert");
    }

    console.log("CREATE COMIC SUCCESS:", comic);

    res.status(201).json({
      ...comic,
      likesCount: 0,
      userHasLiked: false,
      panels: [],
    });
  } catch (error: any) {
    console.error("========== CREATE COMIC DATABASE ERROR ==========");
    console.error("message:", error?.message);
    console.error("code:", error?.code);
    console.error("detail:", error?.detail);
    console.error("hint:", error?.hint);
    console.error("constraint:", error?.constraint);
    console.error("table:", error?.table);
    console.error("column:", error?.column);
    console.error("stack:", error?.stack);
    console.error("=================================================");

    res.status(500).json({
      error: "Failed to create comic",
      details: error?.message || "Database error",
    });
  }
});

/**
 * GET COMIC + PANELS
 */
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const id = getId(req.params.id);

    if (!Number.isFinite(id)) {
      res.status(400).json({
        error: "Invalid comic ID",
      });
      return;
    }

    const [comic] = await db
      .select()
      .from(comicsTable)
      .where(
        and(
          eq(comicsTable.id, id),
          eq(comicsTable.userId, userId),
        ),
      );

    if (!comic) {
      res.status(404).json({
        error: "Comic not found",
      });
      return;
    }

    const panels = await db
      .select()
      .from(panelsTable)
      .where(eq(panelsTable.comicId, id))
      .orderBy(panelsTable.order);

    const parsedPanels = panels.map((panel) => ({
      ...panel,
      characterIds: JSON.parse(panel.characterIds || "[]"),
    }));

    const [likeRow] = await db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(likesTable)
      .where(eq(likesTable.comicId, id));

    const [existing] = await db
      .select()
      .from(likesTable)
      .where(
        and(
          eq(likesTable.comicId, id),
          eq(likesTable.userId, userId),
        ),
      );

    res.json({
      ...comic,
      likesCount: likeRow?.count ?? 0,
      userHasLiked: !!existing,
      panels: parsedPanels,
    });
  } catch (error: any) {
    console.error("GET COMIC ERROR:", error);

    res.status(500).json({
      error: "Failed to load comic",
      details: error?.message || "Database error",
    });
  }
});

/**
 * UPDATE COMIC
 */
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const id = getId(req.params.id);

    const {
      title,
      description,
      style,
      template,
      coverImageData,
    } = req.body;

    const [updated] = await db
      .update(comicsTable)
      .set({
        title,
        description,
        style,
        template,
        coverImageData,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(comicsTable.id, id),
          eq(comicsTable.userId, userId),
        ),
      )
      .returning();

    if (!updated) {
      res.status(404).json({
        error: "Comic not found",
      });
      return;
    }

    res.json({
      ...updated,
      likesCount: 0,
      userHasLiked: false,
    });
  } catch (error: any) {
    console.error("UPDATE COMIC ERROR:", error);

    res.status(500).json({
      error: "Failed to update comic",
      details: error?.message || "Database error",
    });
  }
});

/**
 * DELETE COMIC
 */
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const id = getId(req.params.id);

    const deleted = await db
      .delete(comicsTable)
      .where(
        and(
          eq(comicsTable.id, id),
          eq(comicsTable.userId, userId),
        ),
      )
      .returning();

    if (!deleted.length) {
      res.status(404).json({
        error: "Comic not found",
      });
      return;
    }

    res.status(204).send();
  } catch (error: any) {
    console.error("DELETE COMIC ERROR:", error);

    res.status(500).json({
      error: "Failed to delete comic",
      details: error?.message || "Database error",
    });
  }
});

/**
 * PUBLISH COMIC
 */
router.post("/:id/publish", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const id = getId(req.params.id);

    const { published } = req.body;

    const [updated] = await db
      .update(comicsTable)
      .set({
        published: !!published,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(comicsTable.id, id),
          eq(comicsTable.userId, userId),
        ),
      )
      .returning();

    if (!updated) {
      res.status(404).json({
        error: "Comic not found",
      });
      return;
    }

    res.json({
      ...updated,
      likesCount: 0,
      userHasLiked: false,
    });
  } catch (error: any) {
    console.error("PUBLISH COMIC ERROR:", error);

    res.status(500).json({
      error: "Failed to publish comic",
      details: error?.message || "Database error",
    });
  }
});

export default router;