import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from "./_core/env";
import {
  assessments,
  assessmentResponses,
  assessmentResults,
  InsertAssessment,
  InsertAssessmentResponse,
  InsertAssessmentResult,
} from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Assessment Database Operations
 */

/**
 * Create a new assessment session
 */
export async function createAssessmentSession(
  sessionId: string,
  userAgent?: string,
  ipHash?: string
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const data: InsertAssessment = {
    sessionId,
    status: "in_progress",
    userAgent,
    ipHash,
  };

  await db.insert(assessments).values(data);
  return sessionId;
}

/**
 * Get assessment session by ID
 */
export async function getAssessmentSession(sessionId: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db
    .select()
    .from(assessments)
    .where(eq(assessments.sessionId, sessionId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Save a single assessment response
 */
export async function saveAssessmentResponse(
  sessionId: string,
  questionId: string,
  category: string,
  answerText: string,
  points: number
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const data: InsertAssessmentResponse = {
    sessionId,
    questionId,
    category,
    answerText,
    points,
  };

  await db.insert(assessmentResponses).values(data);
}

/**
 * Get all responses for a session
 */
export async function getAssessmentResponses(sessionId: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const results = await db
    .select()
    .from(assessmentResponses)
    .where(eq(assessmentResponses.sessionId, sessionId));

  return results;
}

/**
 * Save assessment result
 */
export async function saveAssessmentResult(
  sessionId: string,
  totalScore: number,
  riskLevel: "low" | "moderate" | "high",
  categoryScores: Record<string, number>,
  categoryPercentages: Record<string, number>,
  highestRiskCategories: string[],
  interpretation: string,
  recommendations: string[]
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const data: InsertAssessmentResult = {
    sessionId,
    totalScore,
    riskLevel,
    categoryScores,
    categoryPercentages,
    highestRiskCategories,
    interpretation,
    recommendations,
  };

  await db.insert(assessmentResults).values(data);
}

/**
 * Get assessment result by session ID
 */
export async function getAssessmentResult(sessionId: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db
    .select()
    .from(assessmentResults)
    .where(eq(assessmentResults.sessionId, sessionId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Mark assessment as completed
 */
export async function completeAssessment(sessionId: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db
    .update(assessments)
    .set({ status: "completed", completedAt: new Date() })
    .where(eq(assessments.sessionId, sessionId));
}

/**
 * Get assessment statistics (for analytics)
 */
export async function getAssessmentStats(days: number = 30) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  // Total completed assessments
  const totalResult = await db
    .select({ count: assessmentResults.id })
    .from(assessmentResults)
    .where(eq(assessmentResults.id, assessmentResults.id)); // Placeholder, will be filtered by date in real implementation

  // Risk level distribution
  const riskDistribution = await db
    .select({
      riskLevel: assessmentResults.riskLevel,
      count: assessmentResults.id,
    })
    .from(assessmentResults);

  // Average score
  const avgScoreResult = await db
    .select({ avgScore: assessmentResults.totalScore })
    .from(assessmentResults);

  return {
    totalAssessments: totalResult.length,
    riskDistribution,
    averageScore:
      avgScoreResult.length > 0
        ? Math.round(
            avgScoreResult.reduce((sum, r) => sum + (r.avgScore || 0), 0) /
              avgScoreResult.length
          )
        : 0,
  };
}
