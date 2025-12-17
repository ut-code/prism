# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

<architecture>

## Stack

- **Frontend**: SvelteKit + Svelte 5 + TailwindCSS v4 + DaisyUI
- **Backend**: Elysia (Bun) + Drizzle ORM + PostgreSQL
- **Desktop**: Tauri (optional)
- **Package Manager**: Bun
- **Monorepo**: Workspaces (`apps/*`)
- **Dev Environment**: devenv (logs: `.devenv/processes.log`)

## Directory Structure

```
.
├── apps/
│   ├── desktop/          # SvelteKit frontend
│   │   ├── src/
│   │   │   ├── components/   # UI components
│   │   │   ├── features/     # Feature modules
│   │   │   ├── lib/          # Utilities
│   │   │   ├── routes/       # SvelteKit routes
│   │   │   └── icons/        # Icon components
│   │   └── src-tauri/    # Tauri config
│   ├── server/           # Elysia API server
│   │   └── src/
│   │       ├── db/           # Drizzle schema & queries
│   │       ├── domains/      # Business logic
│   │       └── middleware/   # Elysia middleware
│   └── api-client/       # Shared API types
├── docs/
│   └── skills/           # Agent skill docs
├── tasks/                # Procfile for dev
├── .env.sample           # environment variable samples.
└── .env                  # all environment variables in here. pls don't read
```

## Import Aliases

| Alias         | Path              |
| ------------- | ----------------- |
| `@`           | `src/`            |
| `$components` | `src/components/` |
| `@apps/{pkg}` | `apps/{pkg}/`     |

</architecture>

<framework-svelte>

## Svelte 5 Runes (CRITICAL)

**NEVER use legacy syntax.** This project uses Svelte 5 runes mode.

```svelte
<!-- ❌ FORBIDDEN -->
$: reactiveVar = ...
let count = 0

<!-- ✅ REQUIRED -->
let count = $state(0)
const doubled = $derived(count * 2)
$effect(() => { ... })
```

## Svelte Tips

- **clsx builtin**: `<div class={["text-lg", isError && "text-error"]}>`
- **Reactive class**: Define in `.svelte.ts` files for reusability

</framework-svelte>

<framework-elysia>

## Eden Treaty (Data Fetching)

```ts
import { treaty } from "@elysiajs/eden";
import type { App } from "@apps/server";

const client = treaty<App>("http://localhost:8080");

await client.products.get(); // GET
await client.products["123"].get(); // Dynamic param
await client.products.get({ query: { category: "foo" } }); // Query
await client.products.post({ name: "bar", price: 100 }); // POST
```

</framework-elysia>

<rules>

## Code Quality

- **FILE LENGTH**: 30-50 lines recommended, 100 MAX
- **TIDY**: Run `bun tidy` after writing code (auto-fix + check)
- **DOCUMENTATION**: Document behavior, not implementation

## Svelte Rules

- **NAMING**: Snippets use camelCase (not PascalCase)
- **ALIAS**: Use `@/` for imports
- **STYLING**: TailwindCSS + DaisyUI only. No `<style>` blocks
- **SEPARATE**: Components → smallest pieces. Logic → `.svelte.ts` files

## Import Tree (Ideal)

```
UI [.svelte] → controller [.svelte.ts] → processor [.svelte.ts] → utility [.ts]
```

</rules>

<skills>

## Skills

毎回の作業前、タスクの種類に応じて `docs/skills/` 内の該当ドキュメントを読む。

| Skill     | File                       | Usage                |
| --------- | -------------------------- | -------------------- |
| UI Design | `docs/skills/ui-design.md` | UI実装、デザイン判断 |

</skills>

<debugging>

## Debugging

サーバーエラー時は **最初に** ログを確認する：

```bash
tail -100 .devenv/processes.log
```

</debugging>
