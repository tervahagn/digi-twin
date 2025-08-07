import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const surveys = pgTable("surveys", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
});

export const responses = pgTable("responses", {
  id: serial("id").primaryKey(),
  surveyId: integer("survey_id").references(() => surveys.id).notNull(),
  questionId: text("question_id").notNull(),
  responseType: text("response_type").notNull(), // 'text' or 'audio'
  textAnswer: text("text_answer"),
  audioUrl: text("audio_url"), // URL to stored audio file
  wordCount: integer("word_count"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertSurveySchema = createInsertSchema(surveys).pick({
  email: true,
});

export const insertResponseSchema = createInsertSchema(responses).pick({
  surveyId: true,
  questionId: true,
  responseType: true,
  textAnswer: true,
  audioUrl: true,
  wordCount: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertSurvey = z.infer<typeof insertSurveySchema>;
export type Survey = typeof surveys.$inferSelect;
export type InsertResponse = z.infer<typeof insertResponseSchema>;
export type Response = typeof responses.$inferSelect;
