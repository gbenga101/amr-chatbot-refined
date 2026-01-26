import {
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * AMR Assessment Sessions
 * Tracks each user's assessment session (anonymous, no user_id required)
 */
export const assessments = mysqlTable("assessments", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }).notNull().unique(),
  status: mysqlEnum("status", ["in_progress", "completed", "abandoned"])
    .default("in_progress")
    .notNull(),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  userAgent: text("userAgent"),
  ipHash: varchar("ipHash", { length: 64 }), // Hashed for privacy
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Assessment = typeof assessments.$inferSelect;
export type InsertAssessment = typeof assessments.$inferInsert;

/**
 * Individual Assessment Responses
 * Each answer to a question in the assessment
 */
export const assessmentResponses = mysqlTable("assessmentResponses", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  questionId: varchar("questionId", { length: 64 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  answerText: text("answerText").notNull(),
  points: int("points").notNull(),
  answeredAt: timestamp("answeredAt").defaultNow().notNull(),
});

export type AssessmentResponse = typeof assessmentResponses.$inferSelect;
export type InsertAssessmentResponse = typeof assessmentResponses.$inferInsert;

/**
 * Assessment Results
 * Final score and recommendations for a completed assessment
 */
export const assessmentResults = mysqlTable("assessmentResults", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }).notNull().unique(),
  totalScore: int("totalScore").notNull(), // 0-100
  riskLevel: mysqlEnum("riskLevel", ["low", "moderate", "high"]).notNull(),
  categoryScores: json("categoryScores").$type<Record<string, number>>().notNull(),
  categoryPercentages: json("categoryPercentages").$type<Record<string, number>>().notNull(),
  highestRiskCategories: json("highestRiskCategories").$type<string[]>().notNull(), // Array to handle ties
  interpretation: text("interpretation").notNull(),
  recommendations: json("recommendations").$type<string[]>().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AssessmentResult = typeof assessmentResults.$inferSelect;
export type InsertAssessmentResult = typeof assessmentResults.$inferInsert;
