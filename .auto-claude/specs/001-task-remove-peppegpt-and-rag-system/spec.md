# Specification: Remove PeppeGPT and RAG System

## Overview

This task involves the complete removal of the PeppeGPT chat assistant and RAG (Retrieval-Augmented Generation) system from the portfolio website. The chat feature, which consisted of a React-based frontend chat widget integrated with a FastAPI backend (deployed both locally and on Hugging Face Spaces), will be entirely removed from the codebase. This includes deleting the frontend chat feature directory, both backend directories, updating core application files to remove all chat references, and modifying the CI/CD pipeline to remove backend-related deployment steps.

## Workflow Type

**Type**: feature

**Rationale**: This is a systematic feature removal task that involves deleting entire directories, modifying multiple interconnected files, and updating the CI/CD pipeline. While it's removal rather than addition, it follows the feature workflow pattern because it requires careful coordination across multiple services (frontend, backend, CI/CD) and must ensure no broken references remain.

## Task Scope

### Services Involved
- **frontend** (primary) - React portfolio application that needs chat components removed from App.js and Home.js
- **backend** (removal) - FastAPI backend for local development - entire directory to be deleted
- **hf** (removal) - Hugging Face Spaces FastAPI backend - entire directory to be deleted
- **ci/cd** (modification) - GitHub Actions workflow needs backend-related jobs removed

### This Task Will:
- [ ] Delete `/src/features/chat/` directory (18 files: components, context, services, hooks, utils, tests)
- [ ] Delete `/backend/` directory (local development backend)
- [ ] Delete `/hf/` directory (Hugging Face Spaces backend)
- [ ] Remove all chat imports and components from `/src/App.js`
- [ ] Remove ProminentChatButton and chat logic from `/src/components/Home/Home.js`
- [ ] Remove backend testing job from CI/CD workflow
- [ ] Remove HF Spaces deployment job from CI/CD workflow
- [ ] Remove backend validation from validate-deployment job
- [ ] Update `/version.json` to remove backend URL references
- [ ] Update `/src/App.integration.test.js` to remove chat-related tests

### Out of Scope:
- Documentation updates (docs/, README files) - can be addressed in a follow-up task
- Removal of environment variable definitions from hosting platforms (e.g., GitHub Secrets)
- Any other feature additions or modifications

## Service Context

### Frontend (Primary Service)

**Tech Stack:**
- Language: JavaScript (React)
- Framework: React with styled-components
- Key directories: `/src/components/`, `/src/features/`

**Entry Point:** `src/index.js` (renders App.js)

**How to Run:**
```bash
npm install
npm start
```

**Port:** 3000 (default React development server)

### Backend (To Be Deleted)

**Tech Stack:**
- Language: Python
- Framework: FastAPI
- Key directories: `/backend/tests/`

**Entry Point:** `backend/app.py`

**How to Run:**
```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --reload
```

**Port:** 8000

### Hugging Face Backend (To Be Deleted)

**Tech Stack:**
- Language: Python
- Framework: FastAPI

**Entry Point:** `hf/app.py`

**Port:** 7860

## Files to Modify

| File | Service | What to Change |
|------|---------|---------------|
| `/src/App.js` | frontend | Remove chat imports (lines 17-31), ChatDisplay component (lines 34-44), ChatProvider wrapper, isChatEnabled logic, and all chat UI |
| `/src/components/Home/Home.js` | frontend | Remove ProminentChatButton and useChat imports (line 6), remove toggleChat usage (line 20), remove isChatEnabled logic (line 21), remove ProminentChatButton component (line 77) |
| `/.github/workflows/deploy.yml` | ci/cd | Remove backend-test job (lines 56-82), deploy-backend job (lines 113-169), backend validation in validate-deployment (lines 183-196, 202) |
| `/version.json` | frontend | Remove backend_version, deployment_target.backend, urls.backend |
| `/src/App.integration.test.js` | frontend | Remove ChatPanel mock (lines 14-23), remove all chat-related test cases |

## Files to Reference

These files show patterns to follow:

| File | Pattern to Copy |
|------|----------------|
| `/src/App.js` | Clean component structure without chat - target end state |
| `/src/components/Home/Home.js` | Button container pattern for remaining buttons |
| `/.github/workflows/deploy.yml` | CI/CD workflow structure for frontend-only deployment |

## Patterns to Follow

### React Component Structure (Without Chat)

From `/src/App.js` after cleanup:

```javascript
import React from 'react';
import styled from 'styled-components';
import GlobalStyles from './styles/GlobalStyles';

// Components
import Navbar from './components/Navigation/Navbar';
import AboutMe from './components/Home/Home';
// ... other component imports

function App() {
  return (
    <AppContainer>
      <GlobalStyles />
      <ThreeBackground />
      <Navbar />
      {/* ... other components without ChatProvider wrapper */}
    </AppContainer>
  );
}
```

**Key Points:**
- No lazy loading imports for chat
- No ChatProvider context wrapper
- No conditional isChatEnabled rendering

### CI/CD Workflow (Frontend Only)

From `/.github/workflows/deploy.yml` after cleanup:

```yaml
jobs:
  frontend-test:
    # ... frontend testing job remains unchanged

  deploy-frontend:
    needs: [frontend-test]  # Remove backend-test dependency
    # ... deployment job remains unchanged

  validate-deployment:
    needs: [deploy-frontend]  # Remove deploy-backend dependency
    # ... frontend-only validation
```

**Key Points:**
- Remove `backend-test` job entirely
- Remove `deploy-backend` job entirely
- Update job dependencies to remove backend references
- Remove backend validation steps

## Requirements

### Functional Requirements

1. **Remove Frontend Chat Feature**
   - Description: Delete entire `/src/features/chat/` directory and all imports referencing it
   - Acceptance: No import statements reference `./features/chat` anywhere in codebase

2. **Clean App.js**
   - Description: Remove ChatProvider, ChatDisplay, ChatLauncher, ErrorBoundary, and isChatEnabled logic
   - Acceptance: App.js renders without chat components and has no references to chat features

3. **Clean Home.js**
   - Description: Remove ProminentChatButton component and related chat logic
   - Acceptance: Home page renders with only "Explore my work" and "Download my CV" buttons

4. **Remove Backend Directories**
   - Description: Delete `/backend/` and `/hf/` directories entirely
   - Acceptance: Directories no longer exist in repository

5. **Update CI/CD Pipeline**
   - Description: Remove backend testing, HF Spaces deployment, and backend validation jobs
   - Acceptance: Pipeline only tests and deploys frontend to GitHub Pages

6. **Update version.json**
   - Description: Remove backend-related version and URL information
   - Acceptance: version.json only contains frontend-related information

7. **Update Integration Tests**
   - Description: Remove chat-related tests and mocks from App.integration.test.js
   - Acceptance: All remaining tests pass and don't reference chat functionality

### Edge Cases

1. **Broken Import Detection** - Run build after changes to catch any missed import references
2. **Test Failures** - Some tests may fail due to removed components; update assertions accordingly
3. **Environment Variable Usage** - Code may reference `REACT_APP_CHAT_ENABLED`; ensure all usages removed

## Implementation Notes

### DO
- Delete directories first (chat feature, backend, hf) to avoid import resolution issues during subsequent edits
- Remove all chat-related imports before modifying component logic
- Run `npm run build` after changes to verify no broken imports
- Run `npm test` to ensure all tests pass
- Verify CI/CD workflow syntax with a YAML linter

### DON'T
- Leave any orphaned imports that reference deleted files
- Leave the isChatEnabled environment variable checks if nothing uses them
- Partially remove chat components (all or nothing approach)
- Modify documentation files in this task (separate follow-up task)

## Development Environment

### Start Services

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build
```

### Service URLs
- Frontend Development: http://localhost:3000

### Required Environment Variables
- None required after chat removal (REACT_APP_CHAT_ENABLED will no longer be used)

## Success Criteria

The task is complete when:

1. [ ] `/src/features/chat/` directory deleted
2. [ ] `/backend/` directory deleted
3. [ ] `/hf/` directory deleted
4. [ ] App.js renders without any chat components
5. [ ] Home.js renders without ProminentChatButton
6. [ ] CI/CD pipeline no longer has backend-related jobs
7. [ ] version.json contains only frontend information
8. [ ] No broken imports or references
9. [ ] `npm run build` succeeds without errors
10. [ ] `npm test` passes (with updated tests)
11. [ ] No console errors in browser

## QA Acceptance Criteria

**CRITICAL**: These criteria must be verified by the QA Agent before sign-off.

### Unit Tests
| Test | File | What to Verify |
|------|------|----------------|
| App renders | `src/App.test.js` | App component renders without errors |
| Home renders | `src/components/Home/Home.test.js` | Home component renders without chat button |
| Integration tests | `src/App.integration.test.js` | Remaining tests pass without chat references |

### Integration Tests
| Test | Services | What to Verify |
|------|----------|----------------|
| Build Process | frontend | `npm run build` completes without errors |
| Import Resolution | frontend | No broken imports detected during build |

### End-to-End Tests
| Flow | Steps | Expected Outcome |
|------|-------|------------------|
| App Load | 1. Start dev server 2. Navigate to localhost:3000 | App loads without errors, no chat launcher visible |
| Home Section | 1. View home section 2. Check buttons | Only "Explore my work" and "Download my CV" buttons visible |
| Navigation | 1. Navigate through all sections | All portfolio sections work without chat interference |

### Browser Verification (if frontend)
| Page/Component | URL | Checks |
|----------------|-----|--------|
| Home Page | `http://localhost:3000` | No chat launcher button in corner, no ProminentChatButton in hero |
| All Sections | `http://localhost:3000` | Portfolio, Skills, Experience, Education, Contact all render correctly |
| Console | Browser DevTools | No errors related to missing chat components |

### Static Analysis Verification
| Check | Command | Expected |
|-------|---------|----------|
| Build succeeds | `npm run build` | Exit code 0, no errors |
| Tests pass | `npm test -- --watchAll=false` | All tests pass |
| No chat imports | `grep -r "features/chat" src/` | No results |
| No chat env vars | `grep -r "REACT_APP_CHAT" src/` | No results |

### CI/CD Verification
| Check | Method | Expected |
|-------|--------|----------|
| Workflow syntax | YAML lint or GitHub Actions validation | Valid YAML |
| No backend jobs | Manual review of deploy.yml | Only frontend-test, deploy-frontend, validate-deployment jobs |
| Job dependencies | Review `needs` arrays | No references to backend-test or deploy-backend |

### QA Sign-off Requirements
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All E2E tests pass
- [ ] Browser verification complete
- [ ] No chat components visible in UI
- [ ] No console errors
- [ ] Build succeeds without warnings related to removed files
- [ ] No regressions in existing functionality
- [ ] Code follows established patterns
- [ ] CI/CD workflow is valid
