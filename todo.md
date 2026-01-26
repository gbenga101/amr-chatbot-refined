# AMR Chatbot Refinement - Project TODO

## Phase 1: Core Assessment Flow
- [x] Remove language selection screen entirely
- [x] Create English-only assessment flow (12 questions)
- [x] Implement progress indicator (question number and percentage)
- [x] Create question display component with smooth transitions
- [x] Implement answer selection with immediate visual feedback
- [x] Create results display page with risk level and score

## Phase 2: Scoring Logic & Database
- [x] Migrate Python scoring logic to tRPC procedures
- [x] Create database schema for assessments and responses
- [x] Implement session management (anonymous)
- [x] Fix highest risk category logic for edge cases
- [x] Add input validation for all responses
- [x] Store assessment results with category breakdown

## Phase 3: Results & Recommendations
- [x] Display risk level (LOW/MODERATE/HIGH) prominently
- [x] Show category-wise breakdown with percentages
- [x] Generate personalized recommendations based on category
- [x] Add WHO-aligned educational content
- [x] Include medical disclaimer and doctor consultation note
- [x] Create shareable results summary

## Phase 4: UI/UX & Design
- [x] Match existing chatbot design (blue theme, medical imagery)
- [x] Implement mobile-responsive layout
- [x] Add smooth transitions between questions
- [x] Create professional results page layout
- [ ] Ensure accessibility (WCAG 2.1)
- [x] Add loading states and error handling

## Phase 5: Production Readiness
- [x] Implement comprehensive error handling
- [ ] Add logging and error tracking
- [x] Create API validation for all endpoints
- [ ] Test edge cases (all Never, all Often, zero scores)
- [ ] Verify scoring accuracy against documented weights
- [ ] Performance optimization

## Phase 6: Testing & Validation
- [x] Write vitest tests for scoring engine
- [ ] Test all 12 questions and answer combinations
- [x] Verify category weight calculations
- [ ] Test mobile responsiveness
- [ ] End-to-end user flow testing

## Phase 7: Documentation & Delivery
- [ ] Document all code changes
- [ ] Create deployment instructions
- [ ] Prepare change log
- [ ] Final review and testing
