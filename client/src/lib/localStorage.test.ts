/**
 * Tests for localStorage persistence utilities
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  saveAssessmentProgress,
  getAssessmentProgress,
  clearAssessmentProgress,
  hasResumableSession,
  SavedAssessmentProgress,
} from "./localStorage";

// Mock localStorage for Node.js environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, "localStorage", {
  value: localStorageMock,
  writable: true,
});

describe("localStorage Utilities", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  describe("saveAssessmentProgress", () => {
    it("should save assessment progress to localStorage", () => {
      const progress: SavedAssessmentProgress = {
        sessionId: "test-session-123",
        currentQuestionNumber: 5,
        selectedAnswers: {
          behavioral_1: "Never",
          behavioral_2: "Yes",
        },
        timestamp: Date.now(),
      };

      saveAssessmentProgress(progress);

      const stored = localStorage.getItem("amr-assessment-progress");
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed.sessionId).toBe("test-session-123");
      expect(parsed.currentQuestionNumber).toBe(5);
    });

    it("should update timestamp when saving progress", () => {
      const progress: SavedAssessmentProgress = {
        sessionId: "test-session-123",
        currentQuestionNumber: 3,
        selectedAnswers: {},
        timestamp: Date.now(),
      };

      const beforeSave = Date.now();
      saveAssessmentProgress(progress);
      const afterSave = Date.now();

      const stored = JSON.parse(localStorage.getItem("amr-assessment-progress")!);
      expect(stored.timestamp).toBeGreaterThanOrEqual(beforeSave);
      expect(stored.timestamp).toBeLessThanOrEqual(afterSave);
    });

    it("should handle localStorage errors gracefully", () => {
      const mockSetItem = vi.spyOn(localStorage, "setItem").mockImplementation(() => {
        throw new Error("Storage quota exceeded");
      });

      const progress: SavedAssessmentProgress = {
        sessionId: "test-session-123",
        currentQuestionNumber: 1,
        selectedAnswers: {},
        timestamp: Date.now(),
      };

      expect(() => saveAssessmentProgress(progress)).not.toThrow();
      mockSetItem.mockRestore();
    });
  });

  describe("getAssessmentProgress", () => {
    it("should retrieve saved assessment progress", () => {
      const progress: SavedAssessmentProgress = {
        sessionId: "test-session-123",
        currentQuestionNumber: 7,
        selectedAnswers: {
          knowledge_1: "Yes",
          behavioral_1: "Sometimes",
        },
        timestamp: Date.now(),
      };

      saveAssessmentProgress(progress);
      const retrieved = getAssessmentProgress();

      expect(retrieved).toBeTruthy();
      expect(retrieved?.sessionId).toBe("test-session-123");
      expect(retrieved?.currentQuestionNumber).toBe(7);
      expect(retrieved?.selectedAnswers).toEqual({
        knowledge_1: "Yes",
        behavioral_1: "Sometimes",
      });
    });

    it("should return null if no saved progress exists", () => {
      const retrieved = getAssessmentProgress();
      expect(retrieved).toBeNull();
    });

    it("should return null if session has expired (older than 24 hours)", () => {
      const progress: SavedAssessmentProgress = {
        sessionId: "test-session-123",
        currentQuestionNumber: 5,
        selectedAnswers: {},
        timestamp: Date.now(),
      };

      saveAssessmentProgress(progress);

      // Advance time by 25 hours
      vi.advanceTimersByTime(25 * 60 * 60 * 1000);

      const retrieved = getAssessmentProgress();
      expect(retrieved).toBeNull();
    });

    it("should return progress if session is within 24 hours", () => {
      const progress: SavedAssessmentProgress = {
        sessionId: "test-session-123",
        currentQuestionNumber: 5,
        selectedAnswers: {},
        timestamp: Date.now(),
      };

      saveAssessmentProgress(progress);

      // Advance time by 12 hours (within 24-hour window)
      vi.advanceTimersByTime(12 * 60 * 60 * 1000);

      const retrieved = getAssessmentProgress();
      expect(retrieved).toBeTruthy();
      expect(retrieved?.sessionId).toBe("test-session-123");
    });

    it("should handle corrupted localStorage data gracefully", () => {
      localStorage.setItem("amr-assessment-progress", "invalid json");

      const retrieved = getAssessmentProgress();
      expect(retrieved).toBeNull();
    });

    it("should clear expired sessions when retrieving", () => {
      const progress: SavedAssessmentProgress = {
        sessionId: "test-session-123",
        currentQuestionNumber: 5,
        selectedAnswers: {},
        timestamp: Date.now(),
      };

      saveAssessmentProgress(progress);

      // Advance time by 25 hours
      vi.advanceTimersByTime(25 * 60 * 60 * 1000);

      getAssessmentProgress();

      // Verify the expired session was cleared
      const stored = localStorage.getItem("amr-assessment-progress");
      expect(stored).toBeNull();
    });
  });

  describe("clearAssessmentProgress", () => {
    it("should clear saved assessment progress", () => {
      const progress: SavedAssessmentProgress = {
        sessionId: "test-session-123",
        currentQuestionNumber: 5,
        selectedAnswers: {},
        timestamp: Date.now(),
      };

      saveAssessmentProgress(progress);
      expect(localStorage.getItem("amr-assessment-progress")).toBeTruthy();

      clearAssessmentProgress();
      expect(localStorage.getItem("amr-assessment-progress")).toBeNull();
    });

    it("should handle clearing when no progress exists", () => {
      expect(() => clearAssessmentProgress()).not.toThrow();
    });

    it("should handle localStorage errors gracefully", () => {
      const mockRemoveItem = vi.spyOn(localStorage, "removeItem").mockImplementation(() => {
        throw new Error("Storage error");
      });

      expect(() => clearAssessmentProgress()).not.toThrow();
      mockRemoveItem.mockRestore();
    });
  });

  describe("hasResumableSession", () => {
    it("should return true if resumable session exists", () => {
      const progress: SavedAssessmentProgress = {
        sessionId: "test-session-123",
        currentQuestionNumber: 5,
        selectedAnswers: {},
        timestamp: Date.now(),
      };

      saveAssessmentProgress(progress);
      expect(hasResumableSession()).toBe(true);
    });

    it("should return false if no session exists", () => {
      expect(hasResumableSession()).toBe(false);
    });

    it("should return false if session has expired", () => {
      const progress: SavedAssessmentProgress = {
        sessionId: "test-session-123",
        currentQuestionNumber: 5,
        selectedAnswers: {},
        timestamp: Date.now(),
      };

      saveAssessmentProgress(progress);

      // Advance time by 25 hours
      vi.advanceTimersByTime(25 * 60 * 60 * 1000);

      expect(hasResumableSession()).toBe(false);
    });
  });

  describe("Integration scenarios", () => {
    it("should handle complete save and resume flow", () => {
      // Start assessment
      const initialProgress: SavedAssessmentProgress = {
        sessionId: "session-abc123",
        currentQuestionNumber: 1,
        selectedAnswers: {},
        timestamp: Date.now(),
      };

      saveAssessmentProgress(initialProgress);

      // Answer some questions
      const updatedProgress: SavedAssessmentProgress = {
        sessionId: "session-abc123",
        currentQuestionNumber: 6,
        selectedAnswers: {
          knowledge_3: "Yes",
          knowledge_1: "Yes",
          knowledge_2: "No",
          behavioral_1: "Never",
          behavioral_2: "No",
        },
        timestamp: Date.now(),
      };

      saveAssessmentProgress(updatedProgress);

      // Retrieve and verify
      const retrieved = getAssessmentProgress();
      expect(retrieved?.currentQuestionNumber).toBe(6);
      expect(Object.keys(retrieved?.selectedAnswers || {}).length).toBe(5);

      // Clear after completion
      clearAssessmentProgress();
      expect(hasResumableSession()).toBe(false);
    });

    it("should preserve selected answers across saves", () => {
      const answers = {
        knowledge_3: "Yes",
        knowledge_1: "No",
      };

      saveAssessmentProgress({
        sessionId: "session-123",
        currentQuestionNumber: 3,
        selectedAnswers: answers,
        timestamp: Date.now(),
      });

      const retrieved = getAssessmentProgress();
      expect(retrieved?.selectedAnswers).toEqual(answers);
    });
  });
});
