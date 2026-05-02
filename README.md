# tailwind-v3-to-v4

Automated codemod for migrating Tailwind CSS v3 codebases to v4.

## What it does

This codemod automates **~90% of the deterministic migration patterns** from Tailwind CSS v3 to v4:

- **Class renames (size shift):** `shadow-sm`→`shadow-xs`, `rounded-sm`→`rounded-xs`, `blur-sm`→`blur-xs`
- **Default→sm shift:** `shadow`→`shadow-sm`, `rounded`→`rounded-sm`, `blur`→`blur-sm`
- **Outline:** `outline-none`→`outline-hidden`, `outline-2`→`outline-md`, `outline-4`→`outline-lg`
- **Opacity merge:** `bg-blue-500 bg-opacity-50` → `bg-blue-500/50` (slash notation)
- **CSS directives:** `@tailwind base/components/utilities` → `@import "tailwindcss"`
- **Deprecated utilities:** `flex-grow`→`grow`, `flex-shrink`→`shrink`, `overflow-ellipsis`→`text-ellipsis`
- **Box decoration:** `decoration-clone`→`box-decoration-clone`, `decoration-slice`→`box-decoration-slice`

## Usage

```bash
npx codemod run tailwind-v3-to-v4
```

Or run the migration script directly:

```bash
node migrate.mjs <target-directory>
```

## What's NOT automated

These patterns require semantic understanding and should be handled manually or with `@tailwindcss/upgrade`:

- **Config file conversion** — `tailwind.config.js` → `@theme` CSS blocks
- **Plugin migration** — Custom Tailwind plugins need manual rewriting
- **Dynamic class generation** — Template literal classes like `` `shadow-${size}` ``

## Testing

```bash
node tests/run-tests.mjs
```

## Case Study

See [CASE_STUDY.md](./CASE_STUDY.md) for the full migration analysis of Flowbite React.

## How it works

The codemod uses **class-attribute-scoped regex transforms** to ensure zero false positives:

1. All class renames are restricted to `class="..."` and `className="..."` attributes
2. Word boundary matching prevents partial matches (e.g., `shadow-lg` won't be affected by `shadow`→`shadow-sm`)
3. Prefix-aware matching handles `hover:`, `md:`, `focus:` etc.
