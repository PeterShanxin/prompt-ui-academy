# Repository Guidelines

## Project Structure & Module Organization

Application routes live in `app/`; each feature route uses `app/<feature>/page.tsx`. Shared interactive UI belongs in `app/components/`, while bilingual curriculum, glossary, motion, and quiz data lives in `app/lib/content.ts`. Global styles are in `app/globals.css`, and static assets are in `public/`. Database experiments and schemas are under `db/`, `drizzle/`, and `examples/`; deployment adapters live in `worker/` and `build/`. Tests are Node test files in `tests/`. See `docs/ARCHITECTURE.md` before changing rendering or state boundaries.

## Build, Test, and Development Commands

Use Node.js 22.13 or newer and install locked dependencies with `npm ci`.

- `npm run dev`: start the Vinext/Vite development server.
- `npm run lint`: run Next.js Core Web Vitals and TypeScript ESLint rules.
- `npm run build`: create and validate the ChatGPT Sites/Cloudflare artifact.
- `npm run build:vercel`: verify the native Next.js production build.
- `npm test`: build the Vinext artifact, then run all `tests/*.test.mjs` files.
- `npm run check`: run linting, the Vercel build, and the full test suite.
- `npm run db:generate`: generate Drizzle migration files after schema changes.

Shell-backed scripts require Bash; on Windows, use Git Bash or WSL.

## Coding Style & Naming Conventions

Follow existing TypeScript: two-space indentation, double quotes, semicolons, and strict types. Name React components and their files in PascalCase (`TermPreview.tsx`); use camelCase for functions and variables, and kebab-case for CSS classes. Keep route files named `page.tsx`. Preserve explicit `"use client"` boundaries and prefer shared components over duplicated interaction logic. New learning content must provide stable identifiers, Chinese and English terms, concise explanations, and precise prompt examples.

## Testing Guidelines

Tests use `node:test` with `node:assert/strict`. Name files `<behavior>.test.mjs` and write behavior-focused test names. Add regression coverage for rendering, localization, accessibility, or content-contract changes. No numeric coverage threshold is configured; every change should keep `npm run check` green.

## Commit & Pull Request Guidelines

History uses concise imperative subjects and Conventional Commit prefixes for maintenance, such as `chore(deps): update ...`. Keep commits focused. Branch names should describe intent (`feature/new-ui-terms`, `fix/mobile-navigation`). Pull requests must explain learner impact, link relevant issues, list verification performed, and include screenshots or recordings for visible changes. Note responsive and keyboard behavior for interactions, and update `CHANGELOG.md` for user-facing changes. Report security issues through `SECURITY.md`, never public issues.

## Agent Maintenance

Actively update this guide whenever repository changes make its commands, structure, conventions, or contributor expectations incomplete, stale, or misleading.
