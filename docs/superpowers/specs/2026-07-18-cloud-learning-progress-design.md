# Cloud Learning Progress — Software Design Document

**Status:** Approved

**Provider amendment:** Appwrite Cloud approved on 2026-07-18 after Supabase free-project capacity blocked rollout.

**Date:** 2026-07-18

**Initial release surface:** Standalone web application

**Backend:** Appwrite Cloud Auth and TablesDB

## 1. Summary

Prompt UI Academy will remain fully usable without an account. Guest progress will continue to live in browser storage. Learners may optionally sign in with Google or a passwordless six-digit email code to save progress to Appwrite Cloud and resume it across devices.

The existing learning-path page will become the signed-in progress home. The feature will not add a separate dashboard or gate lessons behind authentication. It will also add truthful, threshold-based community proof near the homepage course call to action. Small totals will use founding-cohort language instead of exposing an unimpressive raw count.

## 2. Goals

- Preserve instant, anonymous access to every learning activity.
- Let a learner save and resume progress across standalone-web devices.
- Provide Google and passwordless email authentication without passwords.
- Migrate existing guest progress into the learner's account without data loss.
- Track nine lesson completions, mastered dictionary terms, best quiz score, and last activity.
- Keep account and progress UI visually consistent with the current product.
- Prevent one learner from accessing another learner's data.
- Provide honest, privacy-safe community milestones and private pioneer numbers.
- Keep both existing production builds green while cloud sync remains disabled on ChatGPT Sites.

## 3. Non-goals

- Requiring authentication to learn.
- Supporting cloud sync inside ChatGPT Sites in this release.
- Adding passwords, password resets, social providers beyond Google, or multi-factor authentication.
- Adding a separate learner dashboard, admin dashboard, leaderboards, streaks, certificates, or public profiles.
- Saving Prompt Lab drafts or a detailed activity history.
- Reporting active-user counts or claiming that registered learners are active learners.
- Linking accounts that use different email addresses.
- Collaborative or organization-level learning progress.

## 4. Product decisions

### 4.1 Guest-first access

All routes and learning interactions remain available while signed out. Guest progress is stored immediately in a versioned browser record. The browser record is durable product state, not merely a disposable UI cache.

The header shows the existing progress indicator and a compact **Save progress** action. After the first meaningful completion, a dismissible message says:

> Saved on this device. Sign in to continue anywhere.

The message stays within the viewport after a meaningful completion so it is visible even when the learner is deep in a lesson. It does not interrupt the activity. A dismissal lasts for the current visit and the message is not repeatedly shown after every progress change.

### 4.2 Authentication

The authentication modal uses the product's warm paper background, ink outlines, blue accent, compact bilingual typography, and existing focus treatment.

- Primary action: **Continue with Google**.
- Secondary action: email address followed by a one-time verification code.
- No password fields or password-reset flow.
- OAuth and email verification return the learner to the exact safe relative route that initiated sign-in.
- Appwrite reuses an existing verified account when email OTP is requested for its email. OAuth identities follow Appwrite's supported identity rules; the application never merges identities from an unverified or guessed email.

The standalone deployment uses Appwrite's browser session flow. The browser SDK handles Google and email OTP sessions and creates short-lived JWTs for application-owned progress requests. The Appwrite API key remains server-only and narrowly scoped to database and user operations. Progress tables grant no browser permissions.

### 4.3 Signed-in experience

After sign-in, the header replaces **Save progress** with a compact avatar or initials button. The existing `/learn` route remains the progress home and adds:

- overall course percentage;
- next recommended lesson;
- last activity;
- sync state;
- mastered-term count;
- best quiz score.

The closed account control exposes sync state with a compact status indicator. The account menu contains the learner's verified email, full sync copy, sign out, and a feedback/support link. Destructive deletion is nested one level deeper under **Account settings**, with its existing confirmation. The menu closes on outside interaction and Escape. No separate dashboard is introduced.

### 4.4 Completion behavior

The curriculum receives nine stable lesson identifiers:

1. `ui-components-patterns-structure`
2. `ui-navigation-inputs`
3. `ui-overlays-feedback`
4. `motion-enter-exit`
5. `motion-duration-easing`
6. `motion-spring-stagger`
7. `prompt-five-part`
8. `prompt-vague-to-precise`
9. `prompt-quiz-review`

Each lesson contributes equal weight to the overall percentage. Percentage is `completed lesson count / 9`, rounded to the nearest whole number. Empty progress is 0%; the current artificial 8% floor is removed.

Lessons that are primarily read or explored have an explicit **Mark complete** control at their natural endpoint. The learner may undo completion. Completing the vocabulary quiz records the quiz result and automatically completes `prompt-quiz-review`. The `prompt-five-part` lesson uses an explicit completion control. The Prompt Lab adds an **Evaluate prompt** action; evaluating a learner-edited prompt records the lab activity and automatically completes `prompt-vague-to-precise`. Loading a default or example prompt alone does not complete anything.

Dictionary term mastery remains independently toggleable and visible, but does not distort the nine-lesson course percentage. Quiz attempts retain only the highest score for this MVP.

## 5. Community proof

The homepage fetches a safe community band near the primary course call to action. It never receives a list of users or a small exact count.

| Cumulative verified accounts | Signed-out action copy | Signed-in status copy |
| --- | --- | --- |
| 0–24 | Become one of the founding learners. | You’re among the founding learners! |
| 25–99 | Join a growing group of early learners. | You’re part of our growing early community. |
| 100–999 | Join 100+ learners. | Learning with 100+ learners. |
| 1,000–9,999 | Join 1,000+ learners. | Learning with 1,000+ learners. |
| 10,000–99,999 | Join 10,000+ learners. | Learning with 10,000+ learners. |
| 100,000+ | Join 100,000+ learners. | Learning with 100,000+ learners. |

For a signed-out learner, the band is a real button that opens the same optional save-progress authentication modal. For a signed-in learner, it becomes non-interactive status copy. When cloud progress is unavailable, no community claim is shown.

The metric means cumulative verified learner accounts created, not active users and not current undeleted accounts. This definition makes a non-decreasing milestone truthful. Test accounts and confirmed abuse should be excluded operationally before a milestone is promoted.

Each account receives a monotonic private pioneer number. Learners numbered 1–100 see **Founding learner #N** after first sync and in the account menu. Later accounts see **Learner #N**. Deleting an account does not reuse its number.

## 6. Architecture

### 6.1 Boundaries

The feature is divided into focused units:

- `AuthProvider`: exposes session, learner identity, authentication actions, and auth readiness.
- `ProgressProvider`: exposes canonical progress, derived percentage, mutations, and sync state.
- `ProgressRepository`: stable interface for loading, mutating, and merging progress.
- `LocalProgressRepository`: owns versioned guest and account-scoped browser records.
- `AppwriteProgressRepository`: owns short-lived JWT creation and authenticated application API calls.
- Appwrite server store: derives identity from the JWT, validates bounded payloads, and owns database transactions.
- Account UI: auth modal, account menu, save-progress prompt, and sync-status indicator.
- Progress UI: learning overview, completion controls, next-lesson recommendation, and quiz integration.
- Community metric client: reads only the public band key and maps it to localized copy.

`AppShell.tsx` should compose these units rather than absorbing their implementation. This keeps the existing client boundary explicit and prevents auth, navigation, and progress synchronization from becoming one inseparable component.

### 6.2 Deployment boundary

Cloud progress is controlled by a build-time public feature flag. It is enabled for standalone Vercel deployments after validation and disabled for the ChatGPT Sites/Cloudflare artifact in this release.

When disabled:

- local guest progress works normally;
- account actions are absent;
- no Appwrite network call is made;
- both build and test targets still compile the cloud adapter.

An early implementation spike must prove both Appwrite SDKs compile under `next build` and `vinext build`. Server SDK usage stays inside standalone-only route modules; ChatGPT Sites retains the local-only client path.

## 7. Data model

### 7.1 `learner_profiles`

| Column | Type | Rule |
| --- | --- | --- |
| Row ID | Appwrite user ID | One server-created row per initialized learner |
| `pioneer_number` | Integer | Unique, monotonic cumulative allocation; never reused |
| `created_at` | Datetime | Server timestamp |

An idempotent server store creates this row during the first authenticated cloud-progress initialization. This avoids numbering unverified or abandoned email signups. The route derives identity from the verified Appwrite JWT, then increments the cumulative metric, assigns that number, updates the band, and creates the profile in one TablesDB transaction. Email and provider profile data remain in Appwrite Auth and are not duplicated here.

### 7.2 `progress_records`

| Column | Type | Rule |
| --- | --- | --- |
| Row ID | Appwrite user ID | One private record per learner |
| `payload` | String, max 32 KiB | Versioned progress items, last route, and last activity |
| `schema_version` | Integer | Current supported version only |
| `updated_at` | Datetime | Server write timestamp |

The application API rejects malformed versions, unknown item IDs, more than 64 items, impossible quiz scores, unsafe routes, oversized JSON, and timestamps more than five minutes in the future. The server preserves the maximum quiz score. False completion states remain in the payload so undo actions synchronize across devices.

### 7.3 `community_metrics`

| Column | Type | Rule |
| --- | --- | --- |
| Row ID | String | `learner_milestone` |
| `cumulative_verified_accounts` | Integer | Private monotonic count, incremented during first profile creation |
| `band_key` | String | One of the defined public bands |
| `updated_at` | Datetime | Server timestamp |

All three tables have empty client permissions. Raw account counts and pioneer numbers are available only to the server key. A narrow cached application route returns only `band_key`. Milestone promotion is monotonic.

## 8. Local storage model

Existing `ui-language-progress` data is migrated into a new versioned guest record on first load. Migration is idempotent and preserves all valid learned-term IDs while discarding malformed or unknown values.

Logical storage namespaces:

- guest record;
- authenticated cache keyed by Appwrite user ID;
- first-login merge marker keyed by Appwrite user ID;
- bounded offline mutation queue keyed by Appwrite user ID.

Only the active namespace is rendered. Signing out removes the signed-in namespace from active memory, clears its local account cache and queue, and restores the separate guest record. A second learner on the same device never sees the previous learner's progress.

The payload contains a schema version, progress items, last safe route, and local mutation metadata. Parsers treat all browser data as untrusted input and enforce shape, identifier, and size limits.

## 9. Data flows and conflict rules

### 9.1 Guest mutation

1. Learner completes or undoes an item.
2. `ProgressProvider` updates the guest record immediately.
3. UI re-renders from local canonical guest state.
4. No network request occurs.

### 9.2 First authenticated merge

1. Authentication completes and returns to a validated relative route.
2. Client sends a short-lived Appwrite JWT to the progress merge route; the route derives the user ID and idempotently ensures the learner profile.
3. Client loads the guest record and the current cloud record.
4. Client sends one authenticated merge request with the bounded guest payload.
5. The server validates identity, payload limits, stable content IDs, routes, and timestamps before writing.
6. Existing cloud and guest completion states merge additively for first import; a guest completion never erases a cloud completion.
7. Best quiz score becomes the maximum valid score.
8. Last activity becomes the newest valid activity.
9. Server returns canonical progress and pioneer number.
10. Client replaces the account-scoped cache and records the completed merge marker.

The guest record remains separate so it can be restored after logout, but it is not repeatedly imported into the same account.

### 9.3 Signed-in mutation

1. UI applies the mutation optimistically to the account-scoped cache.
2. Repository sends the bounded versioned record with a short-lived JWT.
3. Server derives ownership and reconciles each item by its validated `updatedAt` timestamp. Missing items in a stale payload cannot erase cloud items; a newer explicit `completed: false` still performs an intentional undo. Quiz best score remains the maximum.
4. Read, reconciliation, and write commit in an Appwrite transaction. Commit conflicts retry with a bounded attempt count so overlapping page or device saves cannot silently overwrite one another.
5. Client replaces the optimistic row and shows **Synced**.

For ordinary signed-in edits, the newest valid per-item timestamp wins. Quiz score is the exception: the server stores the maximum score. The same transactional boundary also protects the first authenticated guest merge.

### 9.4 Offline mutation

1. UI writes locally and labels state **Waiting to sync**.
2. A bounded, deduplicated queue stores the latest mutation per item.
3. Retry occurs on the browser `online` event and with capped exponential backoff during the visit.
4. Successful server responses replace optimistic rows.
5. Persistent failure leaves progress usable locally and exposes a manual **Retry sync** action.

Closing a tab before retry may leave account progress only on that device. The UI must not claim **Synced** until the server confirms it.

If the learner requests sign-out while mutations remain unsynced, the account menu first offers **Retry sync** or **Sign out and discard unsynced changes**. This prevents silent loss while still allowing a learner to clear a shared device.

## 10. Security and privacy

- Learner-data tables grant no browser permissions; only the narrowly scoped server API key can access them.
- Every private route validates an Appwrite JWT and derives the Appwrite user ID rather than accepting a client-supplied owner ID.
- Clients cannot assign or modify pioneer numbers.
- The guest-merge route validates the full bounded payload and ignores any client-supplied user ID.
- Pioneer allocation and milestone promotion commit in one Appwrite transaction.
- The public community route returns a band key only.
- OAuth return paths accept only safe application-relative routes and reject reserved auth paths.
- The Appwrite API key exists only in protected server environment variables and has database/user scopes only.
- Auth endpoints use Appwrite rate limits; the UI gives neutral responses that do not reveal whether an email is registered.
- Logs and analytics must not contain access tokens, one-time codes, email addresses, or complete progress payloads.
- Data collection is limited to verified account identity and learning progress required by the feature.

Account deletion requires an authenticated confirmation step. A server-only endpoint verifies a fresh JWT, disables the Appwrite user, deletes the identity, and then removes private progress/profile rows in a database transaction. If identity deletion fails, the route re-enables the user before any private rows are removed. In-flight progress requests recheck the identity after any row-creating action and self-clean if deletion won the race. The browser clears the account-scoped cache and restores guest state. The consumed pioneer number and already-achieved public milestone remain as cumulative, non-identifying counters.

## 11. UI states and copy

Every cloud surface supports these states:

- **Guest:** Saved on this device.
- **Signing in:** Completing sign-in…
- **Merging:** Combining progress…
- **Syncing:** Saving…
- **Synced:** Synced just now.
- **Offline:** Saved on this device. Waiting to sync.
- **Error:** Progress is safe on this device. Retry sync.

Authentication failure returns the learner to the initiating route with the modal open and a focused, actionable error. OAuth cancellation is not treated as a destructive error. Email-code expiry offers resend after a cooldown.

The interface never blocks lesson access because authentication or sync is unavailable.

## 12. Accessibility and localization

- All new learner-facing copy is provided in Chinese and English.
- The auth modal traps focus, labels its title and description, closes with Escape or a backdrop click, and restores focus to its trigger.
- Authentication and sync messages use an appropriate `aria-live` region without announcing every optimistic update.
- Provider controls have accessible names independent of provider logos.
- Completion controls expose pressed/completed state programmatically.
- Color never carries sync or completion meaning alone.
- Reduced-motion preferences apply to the modal and sync feedback.
- Mobile header behavior prioritizes current progress and account access without crowding navigation.

## 13. Operational visibility

MVP operations need aggregate, non-identifying signals:

- successful account creations by provider;
- auth callback failures by reason category;
- guest-merge success/failure counts;
- progress-write failure counts;
- offline queue age and retry exhaustion;
- current public milestone band.

Provider logs and structured server errors are sufficient initially. A new analytics vendor is not required. Operational data must not include learner emails or item-level histories.

## 14. Rollout

1. Create separate Appwrite development and production projects when paid project capacity permits; an isolated preview project is preferred.
2. Provision the three server-only tables with the checked-in idempotent setup script and a least-privilege API key.
3. Add the repository boundary and migrate existing browser progress with cloud sync disabled.
4. Prove both production build targets compile.
5. Enable cloud sync only in a Vercel preview connected to the development Appwrite project.
6. Validate Google, email-code, callback, logout, deletion, offline recovery, and two-device synchronization.
7. Run route-isolation tests using two distinct users, invalid JWTs, and unauthenticated access.
8. Enable production Appwrite configuration in Vercel while leaving ChatGPT Sites disabled.
9. Observe auth, merge, and write failures before promoting community copy beyond the founding band.

Any visible-behavior patch after final review resets the repository's manual-validation gate.

## 15. Testing strategy

### Unit tests

- legacy local-storage migration;
- malformed and oversized payload rejection;
- nine-lesson percentage calculation;
- next-lesson recommendation;
- guest/account namespace isolation;
- merge serialization and quiz maximum behavior;
- safe return-route validation;
- community band copy mapping;
- offline queue deduplication.

### Database and route tests

- tables expose no browser permissions;
- user A's JWT cannot access user B rows;
- private routes derive identity from the verified JWT;
- first profile allocation is atomic and idempotent;
- payload, score, timestamp, size, and identifier constraints reject invalid input;
- pioneer numbers are unique and never reused;
- public function exposes only a valid band key;
- account deletion disables and deletes the identity before removing private rows, while in-flight progress requests recheck identity and self-clean;

### Component and integration tests

- guest learning remains functional with cloud feature disabled;
- save-progress prompt timing and dismissal;
- modal keyboard and screen-reader behavior;
- successful and failed Google/email auth states;
- exact-route return after authentication;
- first-login merge and confirmation;
- optimistic update, confirmed sync, offline state, retry, and persistent failure;
- logout restores guest progress and hides account progress;
- signed-in `/learn` summary and account menu;
- bilingual rendering and mobile header behavior.

### End-to-end and manual validation

- start as guest on device/browser A, complete items, sign in, then confirm them on B;
- create cloud progress on B, return to A, and confirm reconciliation;
- sign out on a shared browser and verify no account data leaks to guest or another user;
- delete an account and verify login, private rows, local account cache, and public milestone behavior;
- verify both `npm run build` and `npm run build:vercel`, then run the repository's full check suite;
- manually validate visible behavior in both languages, keyboard-only use, reduced motion, and narrow mobile layouts.

Google OAuth itself is validated against a real preview callback URL. Automated tests mock provider redirects and cover the application-owned callback behavior.

## 16. Acceptance criteria

- A new visitor can complete learning activities without seeing a login wall.
- Guest progress survives reload on the same browser.
- A learner can authenticate with Google or a passwordless email code.
- First login preserves both existing cloud progress and guest achievements.
- Signed-in progress confirmed on one device appears on another device.
- The UI distinguishes local-only, syncing, synced, offline, and failed states truthfully.
- Signing out or switching users does not expose the previous account's progress.
- Overall percentage is derived only from nine stable lesson IDs and begins at 0%.
- Best quiz score, term mastery, last activity, and next lesson appear correctly.
- Homepage community copy follows the approved thresholds without exposing a small exact count.
- Pioneer number is private, monotonic, and never reused.
- Account deletion removes private account and progress data.
- JWT route isolation and server-only table permission tests pass.
- Standalone Vercel cloud sync works while ChatGPT Sites retains local-only behavior.
- Lint, both production builds, automated tests, and final human validation pass before release.

## 17. Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Appwrite server SDK fails under Vinext compilation | Prove both builds first; keep server SDK imports inside standalone route and store boundaries. |
| Guest data overwrites newer cloud data | First import is additive; quiz uses maximum; server returns canonical state. |
| Offline UI falsely promises cloud safety | Never show **Synced** before server confirmation; retain retryable local queue. |
| Shared-device data leak | Separate namespaces; clear account cache on logout/deletion; test account switching. |
| Public learner count looks weak or misleading | Return approved bands only and describe cumulative verified accounts accurately. |
| Server route or API key exposes data | Empty client permissions, JWT-derived ownership, least-privilege key scopes, bounded responses, and two-user security tests. |
| Curriculum changes break percentages | Stable lesson IDs and versioned migration rules; removed lessons require an explicit mapping. |
| Auth complexity crowds the learning product | Optional modal, one quiet prompt, integrated progress page, no dashboard. |

## 18. Reference documentation

- [Appwrite Auth overview](https://appwrite.io/docs/products/auth)
- [Appwrite email OTP](https://appwrite.io/docs/products/auth/email-otp)
- [Appwrite OAuth 2 login](https://appwrite.io/docs/products/auth/oauth2)
- [Appwrite database transactions](https://appwrite.io/docs/products/databases/transactions)
