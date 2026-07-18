# Repository Guidelines

## Project Structure & Module Organization

Routes use `app/<feature>/page.tsx`; shared UI is in `app/components/`, bilingual data in `app/lib/content.ts`, styles in `app/globals.css`, assets in `public/`, and tests in `tests/`. Deployment adapters occupy `worker/` and `build/`; database work occupies `db/`, `drizzle/`, and `examples/`. Consult `docs/ARCHITECTURE.md` before changing rendering boundaries.

## Build, Test, and Development Commands

Use Node.js 22.13 or newer and install locked dependencies with `npm ci`.

- `npm run dev`: start the Vinext/Vite development server.
- `npm run lint`: run Next.js and TypeScript ESLint rules.
- `npm run build`: validate the ChatGPT Sites/Cloudflare artifact.
- `npm run build:vercel`: verify the native Next.js production build.
- `npm test`: build the Vinext artifact, then run all `tests/*.test.mjs` files.
- `npm run check`: run linting, the Vercel build, and the full test suite.
- `npm run db:generate`: generate Drizzle migrations after schema changes.

Shell-backed scripts require Bash; use Git Bash or WSL on Windows.

## Coding Style & Naming Conventions

Use two-space indentation, double quotes, semicolons, and strict TypeScript. Name component files in PascalCase (`TermPreview.tsx`), variables in camelCase, and CSS classes in kebab-case. Preserve explicit `"use client"` boundaries. Learning content needs stable IDs, Chinese and English terms, concise explanations, and precise prompt examples.

## Testing Guidelines

Tests use `node:test` and `node:assert/strict`. Name files `<behavior>.test.mjs`. Add regression coverage for rendering, localization, accessibility, and content contracts. Keep `npm run check` green; no numeric coverage threshold exists.

## Commit & Pull Request Guidelines

Use imperative commit subjects and Conventional Commit prefixes where appropriate (`chore(deps): update ...`). Keep commits focused. Branch names describe intent (`feature/new-ui-terms`). PRs explain learner impact, link issues, list verification, and include media for visible changes. Update `CHANGELOG.md` for user-facing changes. Follow `SECURITY.md` for vulnerabilities.

## Standard Agent Workflow

Use a task worktree except for very trivial changes, which may be committed directly; never alter another session's worktree. For behavior changes, provide a short checklist when helpful and ask the user to validate before the PR. After approval, open the PR and run `$weow` through review fixes and green CI. Ask the user to verify the ship commit again; later behavior changes reset this gate. Never merge without explicit approval. Docs-only or CI-only changes may mark manual testing N/A but still require approval. Merge with the supported strategy, then run `$call-it-a-day` for sync and cleanup.

## Agent Maintenance

Update this guide when its commands, structure, conventions, or expectations become stale or incomplete.
