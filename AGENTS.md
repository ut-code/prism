# Repository Guidelines

## Project Structure & Module Organization

- `packages/`
  - `client`: SvelteKit frontend with Storybook, Tauri shell, feature folders under `src/`
  - `convex`: Convex functions plus auth flows; codegen output lives beside handwritten modules
  - `utils`: Shared TypeScript helpers covered by Vitest
  - `markdown`: Documentation tooling and content previews
- `docs/`: Architecture notes and specs shared across agents
- `tasks/`: Hivemind Procfiles orchestrating dev services
- Keep files under 100 lines; split by feature or concern before they grow

## Build, Test, and Development Commands

```sh
bun install --frozen-lockfile          # install dependencies
bun dev                                # start Convex + web client via Hivemind
bun run:web                            # frontend only (Vite dev server)
bun run:convex                         # backend only (Convex dev)
bun run:storybook                      # Storybook UI catalog
bun run:tauri                          # Native shell preview
bun check                              # biome lint + type + formatting checks
bun fix                                # safe lint/format fixes
bun test                               # run workspace test suites
cd packages/client && bun vite build   # build client bundle
```

## Coding Style & Naming Conventions

- TypeScript-first; Svelte 5 components with two-space indentation and double quotes
- Components stay PascalCase; utilities, stores, and snippets use camelCase
- Prefer module aliases (`~/...`) over deep relative paths
- Styling uses Tailwind with DaisyUI themes; compose UI via DaisyUI component classes before writing Tailwind CSS.
- do NEVER EVER USE `any`.
- don't use `.bind`. use arrow functions to bind context.

## Isolation & Composition

(project-level)

- Co-locate styles, tests, and support files with their feature to keep directories compact.

(file-level)

- If a svelte markup is too big (>= 70 lines of markup), separate each part of the markup into snippets `{#snippet}{/snippet}`, then composite them into the final product.
- If a svelte logic is too big (>= 100 lines of script), separate them into their own reactive class / function. it should be called `*Controller` and be located at `[feature]/controllers/*Controller.svelte.ts`
- All SVGs should have their own file `{icon}.svg` - don't inline them in svelte files.

## Testing Guidelines

- `bun test` fans out to package-level suites; CI expects green before merge
- Playwright lives in `packages/client/tests` for end-to-end specs; name files after features (`orgs.spec.ts`)
- Vitest with Happy DOM guards utilities in `packages/utils/tests`; add coverage whenever a helper ships
- Record reproduction steps or context in failing test comments to aid reviewers
- Run `bun run --filter=@packages/client test:e2e` before UI-heavy PRs and capture flaky cases locally

## Commit & Pull Request Guidelines

- Follow the existing short, present-tense subjects with optional scope (`feat(convex): add member`)
- Lefthook pre-commit runs linting and types; only bypass with `git commit -n` when sharing a failing draft
- PRs should summarize intent, list verification commands, and attach UI screenshots or recordings when UX changes
- Link issues in commit or PR titles where possible and request review before merging
