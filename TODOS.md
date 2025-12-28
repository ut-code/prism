# TODOS

Generated: 2025-12-24

## Batch 1: Critical Security Fixes

- [ ] Fix SQL injection in message search (`apps/server/src/domains/messages/service.ts` - escape `ilike` pattern)
- [ ] Add file path sanitization (`apps/server/src/domains/files/service.ts` - prevent `../` traversal)
- [ ] Add WebSocket auth re-validation on subscribe (`apps/server/src/ws/index.ts` - check permissions on subscribe)
- [ ] Add rate limiting middleware (`apps/server/src/middleware/` - create rate-limit.ts)

## Batch 2: High-Impact Performance Fixes

- [ ] Fix N+1 query in message list (`apps/server/src/domains/messages/service.ts` - include reactions/attachments in query)
- [ ] Remove duplicate useQuery per message (`apps/desktop/src/components/MessageItem.svelte` - pass reactions as props)
- [ ] Deduplicate permission checks (`apps/server/src/domains/permissions/service.ts` - cache within request context)
- [ ] Lazy load CodeMirror and emoji-picker (`apps/desktop/src/components/` - use dynamic imports)

## Batch 3: Code Quality & Dead Code Removal

- [ ] Delete unused example/ directory (`.storybook`, `apps/desktop/src/example/`)
- [ ] Remove console.log/error statements (9 files - use proper logger or delete)
- [ ] Split large components: `MessageItem.svelte` (143 lines → ~50 lines each)
- [ ] Split large components: `ChannelList.svelte` (141 lines → ~50 lines each)

## Batch 4: Accessibility Fixes

- [ ] Add aria-labels to icon buttons (`apps/desktop/src/components/` - all IconButton components)
- [ ] Replace alert() with toast notifications (`apps/desktop/src/` - create toast utility)
- [ ] Add form labels for WCAG compliance (`apps/desktop/src/routes/` - all form inputs)
- [ ] Standardize placeholder text language (`apps/desktop/src/` - choose Japanese or English consistently)

## Deferred (Needs User Confirmation)

- [ ] DISABLE_AUTH flag - clarify production usage policy (`apps/server/src/middleware/auth.ts`)
- [ ] Add CSRF protection - confirm if needed for API-only backend (`apps/server/src/middleware/`)
- [ ] Add security headers - confirm headers policy (`apps/server/src/index.ts`)
- [ ] shadow-2xl usage - confirm if Clarity design principles apply (`apps/desktop/src/components/`)
- [ ] Empty state CTAs - requires design decisions (multiple files)

## Rejected (Low Value / Out of Scope)

- Duplicate logic in unread.ts - minimal impact, refactor during feature work
- Test coverage improvements - separate test-focused sprint needed
- Flaky waitForTimeout(500) - address when writing new E2E tests
- Page Object Model - requires significant test refactoring
