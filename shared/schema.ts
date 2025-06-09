import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const modules = pgTable("modules", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  orderIndex: integer("order_index").notNull().default(0),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id").notNull().references(() => modules.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  videoUrl: text("video_url"),
  duration: integer("duration"), // in seconds
  orderIndex: integer("order_index").notNull().default(0),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const progress = pgTable("progress", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(), // using session instead of user for shared login
  lessonId: integer("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }),
  moduleId: integer("module_id").notNull().references(() => modules.id, { onDelete: "cascade" }),
  isCompleted: boolean("is_completed").default(false).notNull(),
  progressPercentage: integer("progress_percentage").default(0).notNull(),
  lastWatchedAt: timestamp("last_watched_at").defaultNow().notNull(),
});

// Relations
export const modulesRelations = relations(modules, ({ many }) => ({
  lessons: many(lessons),
  progress: many(progress),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  module: one(modules, {
    fields: [lessons.moduleId],
    references: [modules.id],
  }),
  progress: many(progress),
}));

export const progressRelations = relations(progress, ({ one }) => ({
  lesson: one(lessons, {
    fields: [progress.lessonId],
    references: [lessons.id],
  }),
  module: one(modules, {
    fields: [progress.moduleId],
    references: [modules.id],
  }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertModuleSchema = createInsertSchema(modules).omit({
  id: true,
  createdAt: true,
});

export const insertLessonSchema = createInsertSchema(lessons).omit({
  id: true,
  createdAt: true,
});

export const insertProgressSchema = createInsertSchema(progress).omit({
  id: true,
  lastWatchedAt: true,
});

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Module = typeof modules.$inferSelect;
export type InsertModule = z.infer<typeof insertModuleSchema>;
export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type Progress = typeof progress.$inferSelect;
export type InsertProgress = z.infer<typeof insertProgressSchema>;
export type LoginData = z.infer<typeof loginSchema>;

// Extended types for API responses
export type ModuleWithLessons = Module & {
  lessons: Lesson[];
  progress?: Progress[];
};

export type LessonWithProgress = Lesson & {
  progress?: Progress;
};
