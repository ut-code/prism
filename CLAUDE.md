# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

<architecture>

## Stack

- **Frontend**: SvelteKit + Svelte 5 + TailwindCSS v4 + DaisyUI
- **Backend**: Elysia (Bun) + Drizzle ORM + PostgreSQL
- **Desktop**: Tauri (optional)
- **Package Manager**: Bun
- **Monorepo**: Workspaces (`apps/*`, `packages/*`)
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
│   │   │   └── routes/       # SvelteKit routes
│   │   └── src-tauri/        # Tauri config
│   └── server/               # Elysia API server
│       └── src/
│           ├── db/           # Drizzle schema & queries
│           ├── domains/      # Business logic
│           ├── middleware/   # Elysia middleware
│           ├── ws/           # WebSocket handlers
│           └── lib/          # Server utilities
├── packages/
│   └── api-client/       # Shared API client & types
├── e2e/                  # Playwright E2E tests
├── scripts/              # Utility scripts (seed.ts)
├── docs/
│   └── skills/           # Agent skill docs
└── .env                  # Environment variables (don't read)
```

## Commands

```sh
bun tidy          # Fix + check (run after writing code)
bun run check     # Lint + type check + format check
bun run fix       # Auto-fix lint + format
bun db            # Run drizzle-kit commands
bun db:seed       # Seed database
bun test:e2e      # Run Playwright E2E tests
bun test:e2e:ui   # Run E2E tests with UI
```

## Import Aliases

| Alias             | Path              |
| ----------------- | ----------------- |
| `@`               | `src/`            |
| `$components`     | `src/components/` |
| `@apps/{pkg}`     | `apps/{pkg}/`     |
| `@packages/{pkg}` | `packages/{pkg}/` |

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

## Controllers (`.svelte.ts`)

Controllers must be instantiated **synchronously at script top-level**, so `$effect`/`$derived` work in constructors.

**Reactive props pattern:**

```ts
// ✅ Pass getter function, fine-grained reactivity
class MyController {
  organizationId: string;
  constructor(organizationId: () => string) {
    this.organizationId = $derived(organizationId());
  }
}
// Usage: new MyController(() => organizationId)

// ❌ Don't pass raw values (not reactive)
class MyController {
  organizationId: string;
  constructor(organizationId: string) {
    this.organizationId = organizationId; // Won't update!
  }
}
```

```svelte
<script lang="ts">
  // ✅ Do - at the top of the script (just after imports)
  const foo = FooController();

  // ❌ Don't - delay the initialization after an await
  await something();
  const foo = FooController();
</script>
```

**Hooks in controllers:** `useWebSocket`, `useQuery`, etc. can be called in constructors since they run at component init time.
for example,

```ts
// foo.controller.svelte.ts
class FooController {
  constructor() {
    useWebSocket("message:foo", (ev) => {
      console.log("event received:", ev);
    });
  }
}
```

## Vocaburaly

[Hooks]
we derive the words "hooks" from react.
hooks in svelte can only be called at script initialization time.

```ts
// for "constant" variable you may use bare variables, but otherwise use getter-style passing, just like in controllers.
function useHook(defaultVal: number, plus: () => number) {
  // inside hooks you can call effects
  $effect(() => {
    console.log("effects");
  });

  // create reactive variables
  let reactive = $state(defaultVal);
  let derived = $derived(reactive * 2 + plus());

  // and return controller-like objects
  // ALWAYS use getters and setters for returning reactive variables, otherwise it won't be reactive.
  return {
    get reactive() {
      return reactive;
    },
    set reactive(newVal) {
      reactive = newVal;
    }
    get derived() {
      return derived;
    }
  }
}
```

```svelte
<script lang="ts">
  let plus = $state(1);

  // do not destruct it. don't.
  const foo = useHook(3, () => plus);
  foo.reactive++;
</script>

{foo.reactive} * 2 + {plus} = {foo.derived}
```

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

- **FILE LENGTH**: 30-50 lines recommended, be warned over 100, 200 AT MAX
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

サーバーエラー時はログを確認する：

```bash
tail -100 .devenv/processes.log
```

</debugging>
