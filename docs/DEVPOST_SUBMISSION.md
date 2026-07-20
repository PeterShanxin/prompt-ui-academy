# Devpost Submission Draft

This document is ready to copy into the OpenAI Build Week submission form. The public YouTube URL must be added after the demo is recorded.

## Project name

Prompt UI Academy

## Tagline

Learn the shared UI language that turns vague ideas into AI-ready instructions.

## Track

Education

## Links

- Production: <https://prompt-ui-academy.vercel.app>
- Repository: <https://github.com/PeterShanxin/prompt-ui-academy>
- Licence: MIT
- Primary Codex project session: `019f6744-5c3f-7360-9717-2fcd3f6f5235`
- Supporting repository-maintenance session: `019f7416-39cb-7d52-9406-f02a953bf00b`

## Short description

Many people know what interface they want but do not know the vocabulary or level of specificity needed to communicate it to an AI coding agent. Prompt UI Academy teaches that shared language through visual UI examples, a structured learning path, adjustable motion demonstrations, scenario-based quizzes, and a deterministic Prompt Lab that makes the difference between vague and precise instructions immediately visible.

## Inspiration and problem

AI coding agents can build interfaces quickly, but the quality of the result still depends on the quality of the design instruction. A learner may recognize a modal, skeleton screen, or spring animation when they see one, yet describe it only as "that popup," "the gray loading thing," or "make it smoother."

That vocabulary gap creates avoidable ambiguity. The agent must guess the intended component, hierarchy, states, timing, and interaction pattern. Prompt UI Academy treats UI language as a practical form of AI literacy: before asking people to write longer prompts, it teaches them what to name and what constraints matter.

The original product direction came from PeterShanxin, inspired in part by the visual recognition approach of NameThatUI. The defining decisions were to begin with component names, include motion terminology, use small quizzes, and let learners compare the visible consequences of vague and precise prompts.

## What it does

Prompt UI Academy provides a bilingual, multi-route learning experience:

- **Learning Path:** three chapters and nine lessons covering interface language, motion language, and actionable UI prompts.
- **UI Visual Dictionary:** searchable, filterable examples of Button, Modal Dialog, Toast, Tooltip, Tabs, Accordion, Toggle, and Skeleton Screen, each paired with a precise prompt example.
- **Motion Playground:** interactive Fade, Slide, Spring, and Stagger demonstrations with adjustable duration and easing.
- **Quiz:** scenario-based visual questions with immediate answers and explanations.
- **Prompt Lab:** vague and precise prompt comparison, a five-part clarity score, editable instructions, and a keyword-driven simulated UI preview.
- **Bilingual and accessible experience:** persistent Simplified Chinese and English, responsive layouts, keyboard focus, semantic controls, a skip link, and reduced-motion support.

Learning progress and language preference stay on the learner's device. No account, API key, or paid service is required. Optional cross-device account sync exists in the codebase but is disabled on the public deployment, so the experience judges test is entirely anonymous.

## Important Prompt Lab disclosure

The Prompt Lab is intentionally deterministic and browser-local. It checks whether a prompt specifies components, layout, visual style, states, and motion, then updates a simulated preview. It does not call an OpenAI model at runtime and is not presented as model-generated output.

This design keeps the lesson fast, repeatable, private, and easy for judges to test while still demonstrating the causal relationship between specificity and a more controlled UI result.

## How GPT-5.6 and Codex were used

Prompt UI Academy was conceived and built during the OpenAI Build Week submission period in the primary Codex session listed above.

PeterShanxin supplied the original learner problem, the UI-language education concept, the NameThatUI-inspired visual-learning direction, the request for quizzes and live prompt comparison, the decision to expand the first single-page version into focused routes, the request for Chinese-English i18n, and the public deployment and open-source direction. Peter also noticed the gray horizontal line crossing the Modal Dialog demonstration and asked for it to be investigated.

GPT-5.6 and Codex accelerated the work from concept to production by:

- translating the brief into an information architecture and learning sequence;
- implementing the Next.js application, content model, interactions, and visual system;
- expanding the single page into the home, learning path, dictionary, motion, quiz, and Prompt Lab routes;
- implementing local progress, persistent i18n, responsive layouts, keyboard accessibility, and reduced-motion behavior;
- reproducing and fixing the Modal preview layering bug, then adding a regression test;
- configuring Vercel and the ChatGPT Sites build path;
- preparing the public repository, MIT licence, README, architecture, contribution and security guidance, CI, and Dependabot;
- running lint, production builds, tests, deployment checks, and compatibility reviews for dependency updates.

This collaboration kept product judgment with the entrant while using Codex to compress the implementation, testing, and release loop.

A separate supporting Codex session documented contributor and agent guidance, established the worktree, review, human-approval, and cleanup workflow, and configured `main` branch protection with required CI and an administrator bypass. That session was repository housekeeping only and did not add product functionality.

## How it was built

The application uses Next.js 16, React 19, TypeScript, and Tailwind CSS 4. Route pages are statically rendered, while focused client components handle filters, progress, quizzes, motion controls, language choice, and Prompt Lab simulation.

Shared learning data lives in `app/lib/content.ts`, separate from presentation. `localStorage` preserves locale and mastered terms without collecting user data. The repository supports two verified production targets: a native Next.js build on Vercel and a Vinext-generated Cloudflare Worker artifact for the ChatGPT Sites mirror.

GitHub Actions runs `npm ci`, ESLint, the Vercel production build, the Sites build, and regression tests on pushes and pull requests.

## Challenges

### Turning a broad idea into a teachable sequence

The first concept could easily have become a long glossary. The key product challenge was to create progression: recognize a visual pattern, manipulate its behavior, recall the terminology, and finally transfer the knowledge into a prompt.

### Growing beyond the initial single page

The first working experience concentrated everything on one page. PeterShanxin identified that the product needed stronger information architecture, so Codex restructured it into focused routes with shared navigation and progress.

### Making prompt feedback accurate without pretending to be an AI call

The Prompt Lab needed immediate, understandable feedback. A deterministic scoring and preview system made the instructional logic visible and repeatable without misrepresenting the result as live model generation.

### Maintaining two production build paths

The same source needed to pass both native Next.js compilation for Vercel and Vinext artifact validation for ChatGPT Sites. Build scripts and CI verify both paths.

## Accomplishments

- Built a coherent educational product rather than a static prompt guide.
- Connected UI vocabulary, motion parameters, recall practice, and prompt structure in one learning journey.
- Shipped a bilingual, responsive, keyboard-accessible public experience.
- Preserved anonymous local progress with no account requirement, then added optional cross-device sync without introducing a login wall.
- Added tests for i18n, Modal layering, licence identity, rendered HTML, and deployable artifacts.
- Published a professional MIT-licensed repository with CI and maintenance guidance.
- Reviewed automated dependency proposals rather than blindly merging them.

## Education-track fit and potential impact

Prompt UI Academy teaches a practical skill at the intersection of design literacy and AI literacy. Its learning objective is specific: help learners replace ambiguous visual requests with named components, observable states, measurable motion, and structured constraints.

That skill can help students and non-designers participate more effectively in software creation, reduce frustrating iteration with AI coding agents, and make design intent easier to review and discuss. The same teaching model could later expand to layout systems, responsive behavior, accessibility patterns, data visualization, and domain-specific interface vocabulary.

## What we learned

- Better prompting often begins with better domain vocabulary, not more words.
- Visual recognition and direct manipulation make abstract UI terminology easier to retain.
- Showing the consequence of one additional constraint is more educational than presenting a single "perfect prompt."
- Deterministic simulations are useful when their limits are disclosed clearly.
- AI-assisted development still benefits from explicit human product judgment and careful dependency review.

## What's next

- Expand the UI and interaction-pattern dictionary.
- Add guided prompt-rewrite exercises with progressive hints.
- Add more accessibility and responsive-design lessons.
- Support exportable learning progress and optional cross-device sync.
- Establish a community review workflow for contributed terminology, questions, and examples.

## Technologies used

- GPT-5.6
- Codex
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Vercel
- Vinext
- Cloudflare Worker build target
- GitHub Actions
- Node.js test runner

## Judge testing instructions

### Fastest path

1. Open <https://prompt-ui-academy.vercel.app>.
2. Switch the header language between English and Chinese.
3. Visit the Learning Path, UI Dictionary, Motion Playground, Quiz, and Prompt Lab from the header.
4. In the dictionary, search for `Modal` and mark it as mastered.
5. In the motion playground, change the animation, duration, and easing.
6. In the Prompt Lab, compare vague and precise prompts, then edit the text and observe the local clarity score and simulated preview.

### Local setup and complete verification

```bash
git clone https://github.com/PeterShanxin/prompt-ui-academy.git
cd prompt-ui-academy
npm ci
npm run lint
npm run build:vercel
npm test
```

Node.js `>=22.13.0` is required. No environment variables, credentials, sample data, or external services are required.

## Demo video

Use the storyboard and narration in [DEMO_SCRIPT.md](DEMO_SCRIPT.md). Upload the finished video as a publicly visible YouTube video under three minutes, then add its URL to the Devpost form before final submission.
