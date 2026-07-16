# Architecture

Prompt UI Academy is a statically rendered Next.js learning product with small, focused client-side interaction islands.

## Application layers

1. **Route pages** in `app/*/page.tsx` define page-specific metadata, learning goals, and progression.
2. **Shared learning components** in `app/components/` own filters, quizzes, motion controls, and Prompt simulation.
3. **Content data** in `app/lib/content.ts` keeps UI terms, motion definitions, questions, and curriculum separate from presentation.
4. **App shell** provides navigation, footer, active-route state, and device-local progress.

## State model

The application deliberately avoids a backend. Learned UI terms are stored in `localStorage` under `ui-language-progress`. Quiz and lab state is ephemeral React state. This keeps the public learning experience anonymous and easy to deploy.

## Rendering and deployment

The source supports two production targets:

- `next build` for Vercel;
- `vinext build` for the Cloudflare Worker artifact used by ChatGPT Sites.

The route content is statically rendered. Components that require browser state use explicit `"use client"` boundaries.

## Accessibility

- Semantic landmarks and route-level headings
- Visible keyboard focus states
- Accessible control names and pressed states
- Skip link for keyboard users
- Reduced-motion support through `prefers-reduced-motion`
- Responsive layouts for touch and small screens

## Adding learning content

Prefer extending `app/lib/content.ts` and reusing `TermPreview` or another shared component. New UI terms should include a stable identifier, bilingual name, category, explanation, and precise Prompt example. Add new interaction logic only when the learning objective cannot be expressed with an existing component.
