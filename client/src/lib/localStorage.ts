/**
 * localStorage Utilities for Assessment Progress Persistence
 * 
 * Allows users to save and resume incomplete assessment sessions
 */

export interface SavedAssessmentProgress {
  sessionId: string;
  currentQuestionNumber: number;
  selectedAnswers: Record<string, string>;
  timestamp: number;
}

const STORAGE_KEY = "amr-assessment-progress";
const STORAGE_EXPIRY_HOURS = 24; // Sessions expire after 24 hours

/**
 * Save current assessment progress to localStorage
 */
export function saveAssessmentProgress(progress: SavedAssessmentProgress): void {
  try {
    const data = {
      ...progress,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn("Failed to save assessment progress to localStorage:", err);
  }
}

/**
 * Retrieve saved assessment progress from localStorage
 * Returns null if no saved progress exists or if session has expired
 */
export function getAssessmentProgress(): SavedAssessmentProgress | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const data = JSON.parse(stored) as SavedAssessmentProgress;
    
    // Check if session has expired (older than 24 hours)
    const ageHours = (Date.now() - data.timestamp) / (1000 * 60 * 60);
    if (ageHours > STORAGE_EXPIRY_HOURS) {
      clearAssessmentProgress();
      return null;
    }

    return data;
  } catch (err) {
    console.warn("Failed to retrieve assessment progress from localStorage:", err);
    return null;
  }
}

/**
 * Clear saved assessment progress from localStorage
 */
export function clearAssessmentProgress(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn("Failed to clear assessment progress from localStorage:", err);
  }
}

/**
 * Check if there is a saved assessment session that can be resumed
 */
export function hasResumableSession(): boolean {
  return getAssessmentProgress() !== null;
}
