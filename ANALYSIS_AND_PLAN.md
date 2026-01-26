# AMR Chatbot Refinement - Analysis and Implementation Plan

## Executive Summary

The AMR Risk Assessment Chatbot is a functional web application that conducts a 12-question assessment to evaluate users' antimicrobial resistance risk. The current implementation uses a multilingual interface (English, Hausa, Yoruba, Igbo) with a Flask backend and a web-based frontend. This document outlines the analysis of the current system and a detailed plan to transform it into a production-ready, English-only application with improved UX and optimized code quality.

---

## Current State Analysis

### Frontend Architecture
- **Current Status:** Web-based interface with language selection screen
- **Technology Stack:** HTML/CSS/JavaScript (appears to be vanilla or lightweight framework)
- **Key Features:**
  - Language selection screen (4 languages)
  - 12-question assessment flow
  - Progress indicator (starts at 8% for Q1)
  - Answer selection buttons (Never/Sometimes/Often or Yes/No variants)
  - Results display page

### Backend Architecture
- **Technology Stack:** Python Flask with SQLite database
- **Key Components:**
  - `RiskScoringEngine`: Implements weighted scoring algorithm
  - `DatabaseManager`: Handles SQLite persistence
  - `SessionManager`: Manages user sessions (in-memory with 30-minute timeout)
  - `AMRChatbotAPI`: Flask REST API with CORS enabled

### Scoring Algorithm
- **Categories:** Behavioral (40%), Knowledge (20%), Environmental (20%), Socio-economic (20%)
- **Questions:** 12 total (4 behavioral, 3 knowledge, 3 environmental, 2 socio-economic)
- **Point Scale:** 0-11 behavioral, 0-4 knowledge, 0-6 environmental, 0-4 socio-economic
- **Risk Levels:** LOW (0-30), MODERATE (31-60), HIGH (61-100)

### Identified Issues

#### 1. Language Selection Logic
- **Issue:** The language selection screen is the first user interaction, adding friction
- **Impact:** Users must select language before starting assessment
- **Solution:** Remove entirely and hardcode English as the only language

#### 2. Highest Risk Category Edge Case
- **Issue:** Line 354 in backend: `highest_risk_category = max(category_percentages, key=category_percentages.get)`
- **Problem:** If all scores are 0, this will pick the first category in dictionary order, which is misleading
- **Solution:** Implement logic to handle zero-score cases with a meaningful default or message

#### 3. Session Management
- **Issue:** Sessions are stored in-memory with 30-minute timeout
- **Problem:** Data loss on server restart; no persistence; difficult to track analytics
- **Solution:** Migrate to database-backed session storage with proper indexing

#### 4. Progress Indicator
- **Issue:** Starts at 8% (1/12) instead of 0% or a clearer format
- **Problem:** Confusing percentage calculation; doesn't clearly show progress
- **Solution:** Display as "Question X of 12" with a clear progress bar

#### 5. Redundant Welcome Messages
- **Issue:** Multiple welcome screens and language confirmations
- **Problem:** Adds unnecessary steps to the user flow
- **Solution:** Consolidate into a single welcome screen with clear call-to-action

#### 6. Input Validation
- **Issue:** Limited validation on API endpoints
- **Problem:** Could accept invalid data or incomplete assessments
- **Solution:** Implement comprehensive validation for all inputs

---

## Proposed Implementation Plan

### Phase 1: Database Schema & Core Infrastructure

#### Database Schema Changes
Create new tables in the existing MySQL database:

```sql
-- Assessments table (replaces in-memory sessions)
CREATE TABLE assessments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(64) UNIQUE NOT NULL,
  language VARCHAR(20) DEFAULT 'english',
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  status ENUM('in_progress', 'completed', 'abandoned') DEFAULT 'in_progress',
  user_agent TEXT,
  ip_hash VARCHAR(64),
  INDEX idx_session_id (session_id),
  INDEX idx_status (status)
);

-- Assessment responses table
CREATE TABLE assessment_responses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(64) NOT NULL,
  question_id VARCHAR(64) NOT NULL,
  category VARCHAR(50) NOT NULL,
  answer TEXT NOT NULL,
  points INT NOT NULL,
  answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES assessments(session_id),
  INDEX idx_session_id (session_id)
);

-- Assessment results table
CREATE TABLE assessment_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(64) UNIQUE NOT NULL,
  total_score FLOAT NOT NULL,
  normalized_score INT NOT NULL,
  risk_level VARCHAR(20) NOT NULL,
  highest_risk_category VARCHAR(50),
  category_scores JSON NOT NULL,
  category_percentages JSON NOT NULL,
  recommendations JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES assessments(session_id),
  INDEX idx_risk_level (risk_level)
);
```

### Phase 2: tRPC Procedures (Backend)

#### Assessment Router
Create `server/routers/assessment.ts` with the following procedures:

1. **`assessment.createSession`** (public)
   - Creates a new assessment session
   - Returns session_id for client-side tracking
   - Stores session in database

2. **`assessment.getQuestion`** (public)
   - Returns a specific question with options
   - Input: session_id, question_number
   - Output: question text, options, category

3. **`assessment.submitResponse`** (public)
   - Records a single answer
   - Input: session_id, question_id, answer, points
   - Validates response against question definition
   - Returns: success status, responses_count

4. **`assessment.submitAssessment`** (public)
   - Finalizes assessment and calculates score
   - Input: session_id, all_responses
   - Validates all 12 responses are provided
   - Calculates risk score using scoring engine
   - Returns: complete assessment result with recommendations

5. **`assessment.getResult`** (public)
   - Retrieves a completed assessment result
   - Input: session_id
   - Output: full result object with all details

#### Scoring Engine (TypeScript Port)
Migrate the Python scoring logic to TypeScript:
- Implement weighted category scoring
- Generate risk level determination
- Create personalized recommendations
- Handle edge cases (zero scores, equal categories)

### Phase 3: Frontend Components

#### Assessment Flow Components
1. **`AssessmentIntro.tsx`** - Welcome screen with single CTA
2. **`QuestionCard.tsx`** - Individual question display with answer options
3. **`ProgressBar.tsx`** - Visual progress indicator (Question X of 12)
4. **`ResultsPage.tsx`** - Comprehensive results display
5. **`RecommendationsSection.tsx`** - Category-specific and risk-level recommendations

#### Key Features
- **Smooth Transitions:** CSS animations between questions
- **Immediate Feedback:** Visual indication when answer is selected
- **Mobile Responsive:** Tailwind-based responsive design
- **Accessibility:** WCAG 2.1 compliance with keyboard navigation

### Phase 4: Results Display

#### Results Page Layout
1. **Header Section**
   - Risk level badge (LOW/MODERATE/HIGH) with color coding
   - Total score (0-100)
   - Assessment completion time

2. **Category Breakdown**
   - Visual representation of scores per category
   - Percentage for each category
   - Highest risk category highlighted

3. **Recommendations Section**
   - Category-specific actionable tips
   - Risk-level specific guidance
   - WHO-aligned educational content

4. **Medical Disclaimer**
   - Clear statement: "This is for educational purposes only"
   - Recommendation to consult healthcare professional
   - Emergency contact guidance

5. **Share/Print Options**
   - Option to download results as PDF
   - Share assessment (without personal data)

### Phase 5: Edge Case Handling

#### Highest Risk Category Logic
```typescript
function getHighestRiskCategory(categoryPercentages: Record<string, number>): string {
  // Handle case where all scores are 0
  const maxScore = Math.max(...Object.values(categoryPercentages));
  
  if (maxScore === 0) {
    return "none"; // Return meaningful default
  }
  
  // Find category with highest percentage
  return Object.entries(categoryPercentages)
    .reduce((max, [cat, score]) => score > max[1] ? [cat, score] : max)[0];
}
```

#### Input Validation
- Validate question_id exists in question database
- Validate answer is one of allowed options
- Validate points match expected value for answer
- Ensure all 12 questions answered before submission
- Check for duplicate submissions

### Phase 6: Production Readiness

#### Error Handling
- Comprehensive try-catch blocks in all procedures
- Meaningful error messages for API consumers
- Logging of all errors with context
- Graceful degradation for failed operations

#### Logging
- Session creation/completion events
- Assessment submission events
- Error events with full context
- Performance metrics (response times)

#### Security
- Session ID validation on all requests
- Input sanitization for all text fields
- Rate limiting on assessment submission (prevent spam)
- Anonymous session tracking (no PII storage)

---

## Design Specifications

### Color Scheme (Matching Current Design)
- **Primary Blue:** #0066CC (medical/trust)
- **Success Green:** #28A745 (low risk)
- **Warning Yellow:** #FFC107 (moderate risk)
- **Danger Red:** #DC3545 (high risk)
- **Background:** Light blue-tinted white (#F8F9FA)
- **Text:** Dark gray (#333333)

### Typography
- **Headings:** Bold, 24-32px
- **Body Text:** Regular, 14-16px
- **Labels:** Medium, 12-14px

### Layout
- **Max Width:** 800px for assessment flow
- **Padding:** 16px mobile, 24px desktop
- **Question Card:** Full width with 16px border radius
- **Answer Buttons:** Full width, 48px height minimum (touch-friendly)

---

## Implementation Timeline

| Phase | Tasks | Estimated Duration |
|-------|-------|-------------------|
| 1 | Database schema, tRPC setup | 2-3 hours |
| 2 | Scoring engine, procedures | 3-4 hours |
| 3 | Frontend components, flow | 4-5 hours |
| 4 | Results display, recommendations | 2-3 hours |
| 5 | Error handling, validation | 2-3 hours |
| 6 | Testing, optimization | 3-4 hours |
| **Total** | | **16-22 hours** |

---

## Success Criteria

1. ✓ Language selection screen removed; English-only flow
2. ✓ 12-question assessment completes without language switching
3. ✓ Progress indicator shows "Question X of 12" with percentage
4. ✓ Results page displays risk level, score, and category breakdown
5. ✓ Highest risk category logic handles zero-score cases
6. ✓ All API endpoints validated and error-handled
7. ✓ Mobile responsive on all screen sizes
8. ✓ Assessment data persisted in database
9. ✓ Scoring accuracy verified against documented algorithm
10. ✓ Production-ready error handling and logging

---

## Next Steps

1. **Approval:** Confirm this plan aligns with your vision
2. **Implementation:** Begin Phase 1 (Database Schema)
3. **Testing:** Validate each phase before moving to the next
4. **Deployment:** Push to production with checkpoint

Please review this plan and provide any feedback or adjustments before we proceed with implementation.
