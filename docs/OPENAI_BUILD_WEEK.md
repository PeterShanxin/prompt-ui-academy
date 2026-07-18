# OpenAI Build Week Development Record

## Project record

| Field | Value |
| --- | --- |
| Project | Prompt UI Academy / 界面话术 |
| Track | Education |
| Entrant and maintainer | PeterShanxin |
| Repository | <https://github.com/PeterShanxin/prompt-ui-academy> |
| Production | <https://prompt-ui-academy.vercel.app> |
| Licence | MIT |
| Primary Codex project session | `019f6744-5c3f-7360-9717-2fcd3f6f5235` |
| Supporting repository-maintenance session | `019f7416-39cb-7d52-9406-f02a953bf00b` |

Prompt UI Academy was newly conceived and built during the OpenAI Build Week submission period. The primary Codex session above contains the original product idea, implementation work, iteration, debugging, deployment, public-repository preparation, and dependency maintenance.

The supporting session records repository governance and housekeeping only: contributor and agent guidance, the standard worktree-to-review-to-human-approval workflow, and `main` branch protection with required CI and an administrator bypass. It did not add product functionality.

## Problem and intended learners

Many people can picture the interface they want but cannot name its components or specify its behavior. Requests such as "make the box more premium" or "add a smooth animation" leave an AI coding agent to guess the layout, states, timing, and interaction pattern.

Prompt UI Academy teaches the shared language behind UI collaboration with AI. It is designed for students, creators, non-designers, early-career developers, and anyone using an AI coding agent without an established design vocabulary.

## Educational approach

The learning sequence moves from recognition to controlled application:

1. **See and name:** visual examples connect familiar interface shapes to terms such as Modal Dialog, Toast, Tooltip, Tabs, and Skeleton Screen.
2. **Manipulate and describe:** motion controls make duration, easing, Fade, Slide, Spring, and Stagger observable rather than abstract.
3. **Recall and explain:** scenario-based quiz questions provide immediate explanations.
4. **Compare and transfer:** the Prompt Lab contrasts vague and precise instructions and lets the learner apply a five-part prompt structure.

The Prompt Lab is a deterministic local simulation. It scores the presence of components, layout, visual style, states, and motion language with browser-side keyword checks, then updates a simulated UI preview. It does not call the OpenAI API or claim to represent model output.

## Product decisions and collaboration

| Contributor | Contribution |
| --- | --- |
| PeterShanxin | Defined the learner problem and Education-track concept; chose UI terminology as the first learning layer; proposed visual examples, motion vocabulary, quizzes, and live prompt comparison; drew inspiration from NameThatUI; requested the multi-page structure; requested Simplified Chinese and English i18n; identified the Modal preview's stray gray line; chose Vercel, a public GitHub repository, MIT licensing, and the public maintainer identity. |
| GPT-5.6 and Codex | Turned the brief into the information architecture and visual system; implemented the Next.js application and interactions; separated the single page into six routes; created the curriculum, dictionary, motion workbench, quiz, and deterministic Prompt Lab; implemented local progress, i18n, responsive behavior, accessibility, tests, CI, dual deployment paths, open-source documentation, debugging, and release maintenance. |
| Dependabot | Automatically proposed npm dependency updates. It did not design or build the educational product. |
| PeterShanxin with Codex maintenance | Reviewed Dependabot proposals, merged compatible patches, rejected incompatible major versions, regenerated the lockfile, tuned update policy, reran the complete test suite, and redeployed the verified result. |

## Chronological development log

Times below use UTC. The Codex/Sites checkpoints preserve the original build sequence. The public GitHub repository was created after the core experience existed, so its import commit consolidates the earlier checkpoint history.

| Date and time | Milestone | Primary evidence | Category |
| --- | --- | --- | --- |
| 2026-07-15 19:32 | PeterShanxin proposed an educational site for better AI collaboration through UI names, motion names, quizzes, and real-time prompt comparison, with Vercel as the target. | Primary Codex session | Product design |
| 2026-07-16 06:28 | Built the first interactive learning homepage. | Codex/Sites checkpoint `66e5442` | Core functionality |
| 2026-07-16 06:41 | Expanded the homepage into a complete single-page UI-language learning experience. | Codex/Sites checkpoint `8dd0377` | Core functionality |
| 2026-07-16 06:46 | Added and verified the Vercel production build path. | Codex/Sites checkpoint `263fe43` | Infrastructure |
| 2026-07-16 07:38 | Responded to PeterShanxin's request to move beyond one long page by creating focused routes for the learning path, dictionary, motion, quiz, and Prompt Lab. | Codex/Sites checkpoint `e1ed64a` | Product design and core functionality |
| 2026-07-16 09:05 | Created the public GitHub repository. | [Initial public commit](https://github.com/PeterShanxin/prompt-ui-academy/commit/062d857986df5d83851e486af6aa39e990c59fde) | Infrastructure |
| 2026-07-16 09:16 | Imported the working multi-route application and its verified build configuration into the public repository. | [Public import commit](https://github.com/PeterShanxin/prompt-ui-academy/commit/0ac1c62f) | Core functionality and infrastructure |
| 2026-07-16 08:59 to 09:16 | Added professional open-source materials: README, MIT licence, architecture, contribution and security guidance, issue and PR templates, CODEOWNERS, CI, and Dependabot. | Codex/Sites checkpoint `1725e00`; public import commit `0ac1c62f` | Documentation and infrastructure |
| 2026-07-16 09:35 to 09:39 | Added persistent Simplified Chinese and English across every route; fixed the Modal preview so background placeholder lines remain behind the scrim and dialog; added regression tests. | Codex/Sites checkpoint `a64da43`; [public commit `37c80986`](https://github.com/PeterShanxin/prompt-ui-academy/commit/37c80986) | Core functionality and bug fix |
| 2026-07-16 09:48 | Merged compatible Next.js and React patch releases after CI passed. | [Dependabot PR #1](https://github.com/PeterShanxin/prompt-ui-academy/pull/1); [commit `df09fa99`](https://github.com/PeterShanxin/prompt-ui-academy/commit/df09fa99) | Maintenance |
| 2026-07-16 09:49 to 09:58 | Rejected incompatible Node type, TypeScript, and ESLint major upgrades; manually applied and tested the compatible development updates from a stale grouped PR; configured Dependabot to avoid unsupported major-version PRs. | [PR #2](https://github.com/PeterShanxin/prompt-ui-academy/pull/2), [#3](https://github.com/PeterShanxin/prompt-ui-academy/pull/3), [#4](https://github.com/PeterShanxin/prompt-ui-academy/pull/4), [#5](https://github.com/PeterShanxin/prompt-ui-academy/pull/5); [commit `ed85f8ea`](https://github.com/PeterShanxin/prompt-ui-academy/commit/ed85f8ea) | Maintenance |
| 2026-07-16 10:01 | Merged the final safe patch group after CI passed. | [PR #6](https://github.com/PeterShanxin/prompt-ui-academy/pull/6); [commit `e200f2bb`](https://github.com/PeterShanxin/prompt-ui-academy/commit/e200f2bb) | Maintenance |
| 2026-07-18 07:18 to 07:27 | Added an actively maintained contributor and agent guide, documented the standard worktree, review, human-validation, merge, and cleanup workflow, and protected `main` with required CI and review while retaining administrator bypass. | Supporting Codex session `019f7416-39cb-7d52-9406-f02a953bf00b`; `AGENTS.md`; GitHub branch protection settings | Documentation and repository governance |

## Evidence summary

| Contribution or milestone | Evidence | Classification | Confidence |
| --- | --- | --- | --- |
| Original learner problem and product concept | Primary Codex session and first user brief | Product design | High |
| Single-page prototype and complete early learning experience | Primary session plus checkpoints `66e5442` and `8dd0377` | Core functionality | High |
| Multi-page product architecture | Primary session, checkpoint `e1ed64a`, and public import commit | Product design and core functionality | High |
| UI dictionary, learning path, motion workbench, quiz, and Prompt Lab | Source under `app/components`, `app/lib/content.ts`, and six public routes | Core functionality | High |
| Chinese-English i18n and persisted language preference | Commit `37c80986` and `tests/i18n-regression.test.mjs` | Core functionality | High |
| Modal layering and gray-line regression fix | User-provided screenshot, commit `37c80986`, CSS layer rules, and regression test | Bug fix | High |
| Responsive and accessible experience | Responsive CSS, skip link, semantic controls, ARIA state, focus styles, and reduced-motion support | Product design and implementation | High |
| Public deployment and repository | Public Vercel deployment, MIT repository, build configuration, and README | Infrastructure | High |
| CI and dual build verification | `.github/workflows/ci.yml`, Vercel build, Vinext/Sites build, and regression tests | Infrastructure | High |
| Dependabot handling | PRs #1 through #6, compatibility review, and dependency commits | Maintenance | High |
| Contributor workflow and protected `main` | Supporting maintenance session, `AGENTS.md`, and live GitHub branch protection settings | Documentation and repository governance | High |

## Technical architecture

- Next.js 16 and React 19 with TypeScript
- Statically rendered route pages with focused client interaction components
- Shared bilingual content and curriculum in `app/lib/content.ts`
- Device-local locale and learning progress through `localStorage`
- Tailwind CSS 4 through PostCSS plus project-specific responsive CSS
- Native Next.js build for Vercel
- Vinext and Cloudflare Worker artifact for the ChatGPT Sites mirror
- GitHub Actions quality gate covering install, lint, Vercel build, Sites build, and tests

No account, backend, API key, or sample dataset is required for the learning experience.

## Judge testing path

### Public product

1. Open <https://prompt-ui-academy.vercel.app>.
2. Switch between English and Chinese and navigate to another route to confirm the choice persists.
3. Open `/learn` and inspect the three-chapter, nine-lesson sequence.
4. Open `/dictionary`, search for `Modal`, and mark the term as mastered.
5. Open `/motion`, select a motion, adjust duration and easing, and replay it.
6. Open `/quiz`, answer a question, and read the immediate explanation.
7. Open `/lab`, switch between vague and precise prompts, then edit the prompt and observe the local clarity score and simulated preview.

### Local verification

Requires Node.js `>=22.13.0`.

```bash
git clone https://github.com/PeterShanxin/prompt-ui-academy.git
cd prompt-ui-academy
npm ci
npm run lint
npm run build:vercel
npm test
```

## Build Week submission status

- Public repository: ready
- MIT licence: ready
- Public production deployment: ready
- Setup and testing instructions: ready
- Codex and GPT-5.6 collaboration record: ready
- Primary Codex session ID: recorded
- Supporting repository-maintenance session ID: recorded
- English Devpost copy: see [DEVPOST_SUBMISSION.md](DEVPOST_SUBMISSION.md)
- Demo storyboard and narration: see [DEMO_SCRIPT.md](DEMO_SCRIPT.md)
- Public YouTube upload: manual action required before submission
- Final Devpost submission: requires PeterShanxin's explicit approval
