import {
  pgTable,
  serial,
  text,
  boolean,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// ── Characters ────────────────────────────────────────────────────────────────

export const charactersTable = pgTable("characters", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  personality: text("personality").notNull().default(""),
  visualStyle: text("visual_style").notNull().default(""),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertCharacterSchema = createInsertSchema(charactersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
export type Character = typeof charactersTable.$inferSelect;

// ── Comics ────────────────────────────────────────────────────────────────────

export const comicsTable = pgTable("comics", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  style: text("style").notNull().default("manga"),
  template: text("template").notNull().default("4-panel"),
  published: boolean("published").notNull().default(false),
  coverImageData: text("cover_image_data"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertComicSchema = createInsertSchema(comicsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertComic = z.infer<typeof insertComicSchema>;
export type Comic = typeof comicsTable.$inferSelect;

// ── Panels ────────────────────────────────────────────────────────────────────

export const panelsTable = pgTable("panels", {
  id: serial("id").primaryKey(),
  comicId: integer("comic_id")
    .notNull()
    .references(() => comicsTable.id, { onDelete: "cascade" }),
  order: integer("order").notNull().default(0),
  dialogue: text("dialogue"),
  caption: text("caption"),
  imageData: text("image_data"),
  imagePrompt: text("image_prompt"),
  characterIds: text("character_ids").notNull().default("[]"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertPanelSchema = createInsertSchema(panelsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertPanel = z.infer<typeof insertPanelSchema>;
export type Panel = typeof panelsTable.$inferSelect;

// ── Likes ─────────────────────────────────────────────────────────────────────

export const likesTable = pgTable("likes", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  comicId: integer("comic_id")
    .notNull()
    .references(() => comicsTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertLikeSchema = createInsertSchema(likesTable).omit({
  id: true,
  createdAt: true,
});
export type InsertLike = z.infer<typeof insertLikeSchema>;
export type Like = typeof likesTable.$inferSelect;

// ── User Profiles (optional display names) ────────────────────────────────────

export const userProfilesTable = pgTable("user_profiles", {
  userId: text("user_id").primaryKey(),
  displayName: text("display_name").notNull().default("Anonymous"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUserProfileSchema = createInsertSchema(
  userProfilesTable
).omit({ createdAt: true, updatedAt: true });
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof userProfilesTable.$inferSelect;
