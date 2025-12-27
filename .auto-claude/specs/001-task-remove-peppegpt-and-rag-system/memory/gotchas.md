# Gotchas & Pitfalls

Things to watch out for in this codebase.

## [2025-12-27 06:52]
npm commands are blocked in the sandboxed environment - manual verification of imports and file existence should be performed instead

_Context: subtask-6-1 Build and Test Verification phase - needed to verify production build but npm run build was blocked_
