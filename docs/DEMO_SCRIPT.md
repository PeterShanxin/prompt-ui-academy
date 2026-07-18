# Prompt UI Academy Demo Script

Target length: **2 minutes 50 seconds**. Keep the finished public YouTube video below three minutes because judges are not required to watch beyond that point.

## Recording setup

- Record at 1080p with browser zoom around 90 to 100 percent.
- Start on <https://prompt-ui-academy.vercel.app> with a clean browser profile.
- Keep the cursor movements deliberate and avoid waiting for animations to finish unnecessarily.
- Record clear narration. Do not use copyrighted music.
- Show only the project, its public repository, and the relevant CI result.
- If a segment runs long, shorten pauses rather than speeding up the recording.

## Storyboard and full narration

### 0:00 to 0:16 - The learner problem

**Screen:** Open the home page. Briefly point to the vague request in the hero area and the major learning destinations.

**Narration:**

> Many people know what interface they want but cannot tell an AI coding agent whether they mean a modal, toast, toggle, or motion pattern. I built Prompt UI Academy to teach that shared language and turn "make it smoother" into an instruction an agent can execute.

### 0:16 to 0:34 - Learning path

**Screen:** Open `/learn` and scroll just enough to show the three chapters and lesson sequence.

**Narration:**

> The learning path has three stages: name interface components, describe motion, then combine goals, components, layout, states, and motion into an actionable prompt. Its three chapters and nine lessons store progress locally.

### 0:34 to 0:55 - UI visual dictionary

**Screen:** Open `/dictionary`, search for `Modal`, show its visual preview and prompt wording, then mark it as mastered.

**Narration:**

> The visual dictionary connects familiar shapes to standard names. Learners can search eight essential patterns, see each in context, read a bilingual explanation, reuse a precise example, and mark terms as mastered without an account.

### 0:55 to 1:15 - Motion playground

**Screen:** Open `/motion`. Switch from Slide to Spring, move the duration slider, change easing, and press Replay.

**Narration:**

> Motion becomes something learners manipulate instead of memorise. I can compare Fade, Slide, Spring, and Stagger, adjust duration and easing, replay the result, and leave with precise motion language.

### 1:15 to 1:30 - Quiz

**Screen:** Open `/quiz`, answer one question, and show the explanation.

**Narration:**

> Scenario-based questions test independent recognition. Each answer gives an immediate explanation, making mistakes part of the learning loop.

### 1:30 to 1:58 - Prompt Lab

**Screen:** Open `/lab`. Toggle between Vague and Precise. Point to the clarity score and preview. Add or remove a keyword to trigger a visible change.

**Narration:**

> The Prompt Lab makes specificity visible. The precise version names the modal, width, radius, button, states, scrim timing, and spring motion. This is a deterministic local teaching simulation, not a live OpenAI API call. Keyword checks update the score and preview so each constraint's effect is clear.

### 1:58 to 2:14 - i18n, responsive behavior, and accessibility

**Screen:** Switch to English, navigate once to show persistence, narrow the browser window briefly, then keyboard-tab to a visible focus state.

**Narration:**

> The product supports persistent Chinese and English, responsive navigation, keyboard focus, semantic controls, a skip link, and reduced-motion preferences. It is public and needs no login or API key.

### 2:14 to 2:39 - GPT-5.6, Codex, and entrant decisions

**Screen:** Show `docs/OPENAI_BUILD_WEEK.md`, then briefly show the primary and supporting session IDs and chronological development log.

**Narration:**

> I made the key product decisions: start with visual UI vocabulary, add motion experiments and quizzes, compare vague and precise prompts, expand the first single page into focused routes, and add bilingual support. GPT-5.6 and Codex turned that direction into the architecture, implementation, content, interactions, tests, debugging, documentation, and deployments. The primary session preserves that build history; a separately labeled supporting session records later repository governance and housekeeping.

### 2:39 to 2:54 - Repository, tests, and deployment

**Screen:** Show the public GitHub repository, MIT licence badge, CI badge or latest successful Actions run, then return to the production home page.

**Narration:**

> The public MIT repository includes setup instructions and CI for installation, ESLint, both production builds, and regression tests. The working application is live on Vercel for judges now.

### 2:54 to 2:58 - Close

**Screen:** End on the Prompt UI Academy title and learning-path button.

**Narration:**

> Prompt UI Academy teaches the language people need to collaborate with AI, making it a natural Education project.

## Required claims checklist

Before uploading, confirm that the spoken narration explicitly includes:

- what was built;
- why it was built;
- the Education-track learning objective;
- how GPT-5.6 and Codex were used;
- which product and design decisions came from PeterShanxin;
- that Prompt Lab is a deterministic local simulation;
- the public repository, tests, and working deployment.

## YouTube and Devpost checklist

- Export a final video shorter than `03:00`.
- Confirm narration is audible on phone and laptop speakers.
- Remove copyrighted music and unrelated personal information.
- Upload to YouTube with visibility set to **Public**.
- Open the YouTube link in a signed-out window.
- Add the public URL to the Devpost submission draft and form.
- Do not submit the final Devpost entry until PeterShanxin gives explicit approval.
