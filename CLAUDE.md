# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

This is a TypeScript monorepo using a Convex backend and SvelteKit frontend with Tauri for desktop apps.

### Stack

- **Frontend**: SvelteKit with Svelte 5, TypeScript, TailwindCSS, DaisyUI
  - **CRITICAL**: This project uses Svelte 5 RUNES MODE - NEVER use legacy reactive statements (`$:`)
  - **ALWAYS use**: `$state`, `$derived`, `$effect` instead of legacy syntax
- **Backend**: Convex (real-time database and functions)
- **Desktop**: Tauri (optional, conflicts with web dev server)
- **Styling**: TailwindCSS v4 with DaisyUI components
- **Package Manager**: Bun
- **Monorepo Structure**: Workspaces with `packages/`

### Apps Structure

- `packages/client/` - SvelteKit frontend with Tauri integration
- `packages/convex/` - Convex backend with database schema and functions

### Frontend (SvelteKit)

- **Routes**: Standard SvelteKit routing in `packages/client/src/routes/`
- **Components**: Organized in `packages/client/src/components/` with atoms and examples
- **Aliases**:
  - `@` → `src`
  - `@@` → `../..` (workspace root)
  - `$components` → `src/components`
  - `~` → `src/`
  - `@packages/{package}` → monorepo
- **Convex Integration**: Uses `convex-svelte` for reactive queries
- **State Pattern**: Logic components (e.g., TaskList.svelte) separate from presentation (TaskListSkin.svelte)

### Backend (Convex)

- **Schema**: Defined in `packages/convex/src/convex/schema.ts`
- **Functions**: Database operations in `packages/convex/src/convex/[feature].ts`
- **Type Safety**: Auto-generated types from schema shared with frontend via workspace dependency

### Data Flow

1. Convex schema defines database structure
2. Convex functions provide type-safe CRUD operations
3. Frontend uses `convex-svelte` hooks for reactive data
4. Automatic type generation ensures type safety across stack

## Framework - Convex

### Convex の Import について

```ts
import { api, type Id } from "@packages/convex";

// use api and type Id ...
```

### 注意点: convex-svelte の `useQuery` について

`useQuery` に渡す引数は、関数の形式で渡してください。そうでないと、期待しない動作を引き起こす可能性があります。

```svelte
<script lang="ts">
  // good
  const selectedChannel = useQuery(api.channels.get, () => ({
    id: selectedChannelId,
  }));

  // bad - この形だと `selectedChannelId` の変更を検知できない
  const selectedChannelBad = useQuery(api.channels.get, {
    id: selectedChannelId,
  });
  // works, but smelly code
  const selectedChannelSmelly = useQuery(api.channels.list, {});
  // better - only use getter functions
  const selectedChannelBetter = useQuery(api.channels.list, () => ({}));
</script>
```

### Mutations with useMutation

Since `convex-svelte` doesn't export `useMutation`, we have a custom utility at `src/lib/useMutation.svelte.ts`:

```typescript
import { useMutation } from "~/lib/useMutation.svelte.ts";

const createOrganization = useMutation(api.organizations.create);

// Use like this
await createOrganization.run({ name: "New Org", description: "..." });
// which exposes these properties
createOrganization.processing; // boolean, use for button disabled state / loading spinners
createOrganization.error; // string | null, use for error messages
```

## Framework - Svelte

### Syntax

Never use logacy svelte syntax. This project uses Svelte 5 runes mode.

- ❌ FORBIDDEN: `$: reactiveVar = ...` (reactive statements)
- ❌ FORBIDDEN: `let count = 0` for reactive state
- ✅ REQUIRED: `let count = $state(0)` for reactive state
- ✅ REQUIRED: `$effect(() => { ... })` for side effects
- ✅ REQUIRED: `const sum = $derived(a + b);` for derived variables
- ✅ REQUIRED: `const sum = $derived.by(() => { if (a + b < 0) return 0; return a + b; );` for derived variables which needs a block.

### Svelte Capabilities

- clsx: Svelte has clsx builtin to its class. `<div class={["text-lg", isError && "text-error"]}>{text}</div>`

- reactive class: Svelte allows defining reactive controller classes inside ".svelte.ts" files for reusability and separation of concerns.

```ts
// my-controller.svelte.ts
class MyController {
  foo = $state(3);
  bar: number;
  baz = $derived.by(() => bar + baz); // use derived.by if it needs to be lazy-initialized
  doubleQux: number;
  // unless it doesn't change at runtime (e.g. static configuration - initBar in this example),
  // using getter function is better for reactivity.
  constructor(initBar: number, props: () => { qux: number }) {
    this.bar = $state(initBar);
    this.doubleQux = $derived(props().qux * 2);
  }
}
```

## Code Quality / Coding Rules

### Common Rules

- FILE LENGTH: Prefer short files, 30 ~ 50 lines recommended, 100 lines MAX.
- CHECK: Always run `bun check` after writing code.
- DOCUMENTATION: document the behavior (and optionally the expected usage) of the code, not the implementation

### Svelte

- NAMING: Name snippets with camelCase instead of PascalCase to avoid confusion with components.
- ALIAS: Use TypeScript import alias for client code. `import component from "~/features/foo/component.svelte";`
- STYLING: Don't use style blocks in Svelte components, instead use TailwindCSS and DaisyUI.
- STYLING: Always prefer using DaisyUI classes, and use minimal Tailwind classes.
- SEPARATE COMPONENTS: Separate components into smallest pieces for readability.
- SEPARATE LOGIC: Separate Logic from .svelte files into .svelte.ts files.
  - .svelte.ts files should handle Calculation / Reactivity, while .svelte files should handle UI changes (e.g. navigation, modal open).
  - if it has any reusable utility function, it should be separated again into plain .ts files / .svelte.ts
    - An Ideal import tree would look like this: `UI component [.svelte] -> controller [.svelte.ts] -> processor [.svelte.ts] -> pure logic utility [.ts]`

### Convex Rules

- AUTHORIZATION: write authorization determinator in `packages/convex/src/convex/perms.ts`
