# Architecture

Prompt UI Academy is a statically rendered Next.js learning product with small, focused client-side interaction islands.

## Application layers

1. **Route pages** in `app/*/page.tsx` define page-specific metadata, learning goals, and progression.
2. **Shared learning components** in `app/components/` own filters, quizzes, motion controls, and Prompt simulation.
3. **Content data** in `app/lib/content.ts` keeps UI terms, motion definitions, questions, and curriculum separate from presentation.
4. **App shell** provides navigation, footer, active-route state, authentication, and learning progress.

## State model

The application is local-first. A versioned learning-progress record is stored in `localStorage`, so every lesson remains available without an account or network connection. Signed-in learners can optionally sync that record through Supabase.

Supabase Auth supports Google and email verification codes. Public tables use row-level security keyed by `auth.uid()`, while bounded security-definer functions handle profile creation, additive first-login merge, and qualitative community bands. Account deletion is performed by a server-only route. See [Supabase setup](SUPABASE_SETUP.md) for operational configuration.

Cloud functionality is gated by `NEXT_PUBLIC_CLOUD_PROGRESS_ENABLED`. Missing or disabled configuration removes account controls without weakening the guest experience.

## Rendering and deployment

The source supports two production targets:

- `next build` for Vercel;
- `vinext build` for the Cloudflare Worker artifact used by ChatGPT Sites.

Most route content is statically rendered. Components that require browser state use explicit `"use client"` boundaries. Auth callback and account-deletion handlers are the only dynamic server routes.

## Accessibility

- Semantic landmarks and route-level headings
- Visible keyboard focus states
- Accessible control names and pressed states
- Skip link for keyboard users
- Reduced-motion support through `prefers-reduced-motion`
- Responsive layouts for touch and small screens

## Adding learning content

Prefer extending `app/lib/content.ts` and reusing `TermPreview` or another shared component. New UI terms should include a stable identifier, bilingual name, category, explanation, and precise Prompt example. Add new interaction logic only when the learning objective cannot be expressed with an existing component.
