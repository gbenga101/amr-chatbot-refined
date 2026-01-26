# AMR Risk Assessment Chatbot - Production Release

A modern, production-ready web application for assessing Antimicrobial Resistance (AMR) risk through a 12-question assessment. Built with React 19, tRPC 11, Express 4, and MySQL.

## Quick Start

### Features

- **12-Question Assessment:** Comprehensive evaluation across 4 categories (Behavioral, Knowledge, Environmental, Socio-economic)
- **Instant Results:** Real-time risk scoring with personalized recommendations
- **Anonymous & Private:** No personal data collection, all responses kept confidential
- **Mobile Responsive:** Fully optimized for desktop, tablet, and mobile devices
- **Educational Focus:** WHO-aligned content with medical disclaimers
- **Production Ready:** Comprehensive error handling, validation, and testing

### Assessment Categories

1. **Behavioral (40% weight):** User habits and practices related to antibiotic use
2. **Knowledge (20% weight):** Understanding of antimicrobial resistance concepts
3. **Environmental (20% weight):** Living conditions and sanitation factors
4. **Socio-economic (20% weight):** Access to healthcare and medicines

### Risk Levels

- **LOW (0-30):** Good antimicrobial stewardship practices
- **MODERATE (31-60):** Some habits increase AMR risk
- **HIGH (61-100):** Current practices significantly increase AMR risk

## Technical Stack

### Frontend
- React 19 with TypeScript
- Tailwind CSS 4 for styling
- Framer Motion for animations
- shadcn/ui components
- tRPC client for type-safe API calls

### Backend
- Express 4 server
- tRPC 11 for RPC procedures
- Drizzle ORM for database access
- MySQL for data persistence
- Vitest for testing

### Architecture
- Type-safe end-to-end procedures (tRPC)
- Anonymous session management
- Deterministic scoring algorithm
- Comprehensive input validation
- Error handling and recovery

## Project Structure

```
amr-chatbot-refined/
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx                 # Landing page
│   │   │   ├── Assessment.tsx           # Main assessment flow
│   │   │   ├── AssessmentIntro.tsx      # Welcome screen
│   │   │   └── AssessmentResults.tsx    # Results display
│   │   ├── components/
│   │   │   └── QuestionCard.tsx         # Question display
│   │   ├── lib/
│   │   │   └── types.ts                 # Frontend types
│   │   ├── App.tsx                      # Routes and layout
│   │   └── main.tsx                     # Entry point
│   └── public/                          # Static assets
├── server/
│   ├── routers/
│   │   └── assessment.ts                # Assessment procedures
│   ├── scoring.ts                       # Scoring engine
│   ├── db.ts                            # Database helpers
│   ├── scoring.test.ts                  # Scoring tests
│   └── assessment.integration.test.ts   # Integration tests
├── drizzle/
│   ├── schema.ts                        # Database schema
│   └── migrations/                      # SQL migrations
├── shared/
│   └── assessment.ts                    # Shared constants
└── CHANGELOG.md                         # Detailed changelog
```

## Installation & Setup

### Prerequisites
- Node.js 22.13.0 or higher
- MySQL 8.0 or higher
- pnpm 10.4.1 or higher

### Installation Steps

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Configure Environment**
   Create a `.env` file with required variables:
   ```
   DATABASE_URL=mysql://user:password@localhost:3306/amr_chatbot
   JWT_SECRET=your-secret-key-here
   VITE_APP_ID=your-app-id
   OAUTH_SERVER_URL=https://api.manus.im
   VITE_OAUTH_PORTAL_URL=https://portal.manus.im
   ```

3. **Setup Database**
   ```bash
   # Generate migrations
   pnpm drizzle-kit generate
   
   # Apply migrations
   pnpm drizzle-kit migrate
   ```

4. **Run Tests**
   ```bash
   pnpm test
   ```
   Expected: 41 tests passing

5. **Start Development Server**
   ```bash
   pnpm dev
   ```
   Access at `http://localhost:3000`

## Usage

### For End Users

1. **Visit the Application:** Open the web application in your browser
2. **Read Introduction:** Review the assessment overview and disclaimers
3. **Complete Assessment:** Answer all 12 questions honestly
4. **View Results:** Receive instant risk assessment and recommendations
5. **Take Action:** Follow personalized recommendations to reduce AMR risk

### For Developers

#### Adding New Features
1. Update database schema in `drizzle/schema.ts`
2. Generate migrations: `pnpm drizzle-kit generate`
3. Add database helpers in `server/db.ts`
4. Create tRPC procedures in `server/routers/assessment.ts`
5. Build frontend components in `client/src/pages/` or `client/src/components/`
6. Write tests in `server/*.test.ts`

#### Running Tests
```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test server/scoring.test.ts

# Watch mode
pnpm test --watch
```

#### Building for Production
```bash
# Build frontend and backend
pnpm build

# Start production server
pnpm start
```

## API Documentation

### tRPC Procedures

All procedures are accessible through the tRPC client at `/api/trpc`.

#### `assessment.createSession()`
Creates a new assessment session.
- **Returns:** `{ sessionId: string, createdAt: Date }`

#### `assessment.getQuestion(input)`
Retrieves a specific question.
- **Input:** `{ sessionId: string, questionNumber: number }`
- **Returns:** Question object with options

#### `assessment.submitResponse(input)`
Submits a single answer.
- **Input:** `{ sessionId: string, questionId: string, answerText: string }`
- **Returns:** `{ success: boolean, responsesCount: number, totalQuestions: number }`

#### `assessment.submitAssessment(input)`
Calculates final score and generates results.
- **Input:** `{ sessionId: string }`
- **Returns:** Complete assessment result with score and recommendations

#### `assessment.getResult(input)`
Retrieves previously completed assessment.
- **Input:** `{ sessionId: string }`
- **Returns:** Assessment result object

## Scoring Algorithm

### Calculation Steps

1. **Collect Responses:** Gather all 12 question responses with point values
2. **Sum by Category:** Calculate total points for each category
3. **Calculate Percentages:** Convert category scores to 0-100 scale
4. **Apply Weights:** Multiply each percentage by category weight
5. **Total Score:** Sum weighted percentages (0-100)
6. **Determine Risk Level:** Map score to LOW/MODERATE/HIGH
7. **Identify High-Risk Categories:** Find categories with highest percentage

### Example Calculation

```
Behavioral: 8/11 points = 73%
Knowledge: 3/4 points = 75%
Environmental: 4/6 points = 67%
Socio-economic: 2/4 points = 50%

Total Score = (73 × 0.40) + (75 × 0.20) + (67 × 0.20) + (50 × 0.20)
            = 29.2 + 15 + 13.4 + 10
            = 67.6 → 68 (rounded)

Risk Level: HIGH (61-100)
Highest Risk Category: Knowledge (75%)
```

## Testing

### Test Coverage

- **Scoring Engine Tests (22):** Verify scoring accuracy, edge cases, recommendations
- **Integration Tests (18):** Complete assessment flows, question coverage, consistency
- **Authentication Tests (1):** Session management

### Running Tests

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test -- --coverage

# Watch mode for development
pnpm test -- --watch
```

### Test Results
```
✓ server/scoring.test.ts (22 tests)
✓ server/assessment.integration.test.ts (18 tests)
✓ server/auth.logout.test.ts (1 test)

Test Files: 3 passed (3)
Tests: 41 passed (41)
```

## Data Privacy & Security

### Privacy Measures
- **Anonymous Sessions:** No user identification required
- **IP Hashing:** One-way hash (SHA-256) for privacy
- **No Personal Data:** Only assessment responses stored
- **Session Isolation:** Each session completely independent

### Security Features
- **Input Validation:** All user inputs validated server-side
- **Error Handling:** Comprehensive error recovery
- **Session Management:** Secure session tracking
- **HTTPS:** All communications encrypted in production

## Deployment

### Local Development
```bash
pnpm dev
```

### Production Build
```bash
pnpm build
pnpm start
```

### Docker Deployment
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY . .
RUN pnpm install
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

### Environment Configuration
- Set `NODE_ENV=production`
- Configure MySQL connection string
- Set JWT secret for sessions
- Configure OAuth credentials

## Troubleshooting

### Common Issues

**Issue:** Database connection error
- **Solution:** Verify DATABASE_URL and MySQL is running

**Issue:** Session not found
- **Solution:** Clear browser cookies and restart assessment

**Issue:** Scoring mismatch
- **Solution:** Verify all 12 questions were answered

**Issue:** Build errors
- **Solution:** Run `pnpm install` and `pnpm check`

## Performance Considerations

- **Database Indexing:** sessionId indexed for fast lookups
- **Query Optimization:** Minimal database queries per request
- **Frontend Caching:** tRPC query caching enabled
- **Code Splitting:** Separate chunks for assessment flow
- **Lazy Loading:** Questions fetched on-demand

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility

The application follows accessibility best practices:
- Semantic HTML structure
- ARIA labels for interactive elements
- Keyboard navigation support
- Color contrast compliance
- Focus management

## Future Enhancements

1. **PDF Export:** Generate downloadable results
2. **Social Sharing:** Share results on social media
3. **Analytics Dashboard:** Track assessment trends
4. **Multi-language Support:** Add language selection
5. **Mobile App:** Native iOS/Android versions
6. **API Documentation:** OpenAPI/Swagger specs
7. **Webhooks:** External system notifications

## Contributing

To contribute to this project:

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes and write tests
3. Run tests: `pnpm test`
4. Commit changes: `git commit -am 'Add feature'`
5. Push to branch: `git push origin feature/your-feature`
6. Create a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues, questions, or feedback:
- Check the CHANGELOG.md for recent changes
- Review the test files for usage examples
- Consult the inline code documentation

## Acknowledgments

- WHO guidelines on antimicrobial resistance
- Original Python backend implementation
- React and tRPC communities

---

**Version:** 1.0.0
**Status:** Production Ready ✅
**Last Updated:** January 26, 2026
