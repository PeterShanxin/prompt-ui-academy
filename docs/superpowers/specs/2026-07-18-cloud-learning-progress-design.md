# Cloud Learning Progress — Software Design Document

**Status:** Proposed for review

**Date:** 2026-07-18

**Initial release surface:** Standalone web application

**Backend:** Supabase Auth and Postgres

## 1. Summary

Prompt UI Academy will remain fully usable without an account. Guest progress will continue to live in browser storage. Learners may optionally sign in with Google or a passwordless email code to save progress to Supabase and resume it across devices.

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

The message does not interrupt the activity. A dismissal lasts for the current visit and the message is not repeatedly shown after every progress change.

### 4.2 Authentication

The authentication modal uses the product's warm paper background, ink outlines, blue accent, compact bilingual typography, and existing focus treatment.

- Primary action: **Continue with Google**.
- Secondary action: email address followed by a one-time verification code.
- No password fields or password-reset flow.
- OAuth and email verification return the learner to the exact safe relative route that initiated sign-in.
- Verified identities with the same email may use Supabase's supported identity-linking behavior. Identities are never merged from an unverified or guessed email.

The standalone deployment uses Supabase's supported PKCE/SSR session pattern. Authentication secrets and the Supabase service-role key remain server-only. The public client key may be used in the browser with row-level security enabled.

### 4.3 Signed-in experience

After sign-in, the header replaces **Save progress** with a compact avatar or initials button. The existing `/learn` route remains the progress home and adds:

- overall course percentage;
- next recommended lesson;
- last activity;
- sync state;
- mastered-term count;
- best quiz score.

The account menu contains the learner's verified email, sync state, sign out, and delete-account actions. No separate dashboard is introduced.

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

| Cumulative verified accounts | Public copy |
| --- | --- |
| 0–24 | Join the founding learners. |
| 25–99 | Join a growing group of early learners. |
| 100–999 | Join 100+ learners. |
| 1,000–9,999 | Join 1,000+ learners. |
| 10,000–99,999 | Join 10,000+ learners. |
| 100,000+ | Join 100,000+ learners. |

The metric means cumulative verified learner accounts created, not active users and not current undeleted accounts. This definition makes a non-decreasing milestone truthful. Test accounts and confirmed abuse should be excluded operationally before a milestone is promoted.

Each account receives a monotonic private pioneer number. Learners numbered 1–100 see **Founding learner #N** after first sync and in the account menu. Later accounts see **Learner #N**. Deleting an account does not reuse its number.

## 6. Architecture

### 6.1 Boundaries

The feature is divided into focused units:

- `AuthProvider`: exposes session, learner identity, authentication actions, and auth readiness.
- `ProgressProvider`: exposes canonical progress, derived percentage, mutations, and sync state.
- `ProgressRepository`: stable interface for loading, mutating, and merging progress.
- `LocalProgressRepository`: owns versioned guest and account-scoped browser records.
- `SupabaseProgressRepository`: owns authenticated database reads, writes, and merge calls.
- Account UI: auth modal, account menu, save-progress prompt, and sync-status indicator.
- Progress UI: learning overview, completion controls, next-lesson recommendation, and quiz integration.
- Community metric client: reads only the public band key and maps it to localized copy.

`AppShell.tsx` should compose these units rather than absorbing their implementation. This keeps the existing client boundary explicit and prevents auth, navigation, and progress synchronization from becoming one inseparable component.

### 6.2 Deployment boundary

Cloud progress is controlled by a build-time public feature flag. It is enabled for standalone Vercel deployments after validation and disabled for the ChatGPT Sites/Cloudflare artifact in this release.

When disabled:

- local guest progress works normally;
- account actions are absent;
- no Supabase network call is made;
- both build and test targets still compile the cloud adapter.

An early implementation spike must prove the chosen Supabase session helpers compile under both `next build` and `vinext build`. If an SSR helper is incompatible with Vinext, the adapter boundary must isolate it behind standalone-only route modules without weakening the standalone session model.

## 7. Data model

### 7.1 `learner_profiles`

| Column | Type | Rule |
| --- | --- | --- |
| `user_id` | UUID | Primary key; references `auth.users(id)` with cascade delete |
| `pioneer_number` | BIGINT | Unique, monotonic sequence; never reused |
| `created_at` | TIMESTAMPTZ | Server default |

An idempotent `ensure_learner_profile` database function creates this row during the first authenticated cloud-progress initialization. This avoids numbering unverified or abandoned email signups. The function derives identity from `auth.uid()`, allocates the pioneer number, and updates the cumulative community metric in one transaction. Email and provider profile data remain in Supabase Auth and are not duplicated here.

### 7.2 `progress_items`

| Column | Type | Rule |
| --- | --- | --- |
| `user_id` | UUID | References `learner_profiles(user_id)` with cascade delete |
| `kind` | TEXT | `lesson`, `term`, `quiz`, or `lab` |
| `item_id` | TEXT | Stable content identifier, maximum 80 characters |
| `completed` | BOOLEAN | Current completion/mastery state |
| `best_score` | INTEGER | Nullable; quiz-only and constrained to the quiz maximum |
| `completed_at` | TIMESTAMPTZ | Nullable; server timestamp for latest completion |
| `updated_at` | TIMESTAMPTZ | Server timestamp for conflict ordering |

Primary key: `(user_id, kind, item_id)`.

Rows are retained when a completion is undone so the false state can synchronize across devices. Check constraints reject unknown kinds, invalid identifier lengths, and impossible scores.

### 7.3 `learner_state`

| Column | Type | Rule |
| --- | --- | --- |
| `user_id` | UUID | Primary key with cascade delete |
| `last_route` | TEXT | Allowed learning route only |
| `last_activity_at` | TIMESTAMPTZ | Server timestamp |
| `schema_version` | INTEGER | Current progress payload version |
| `updated_at` | TIMESTAMPTZ | Server timestamp |

### 7.4 `public_metrics`

| Column | Type | Rule |
| --- | --- | --- |
| `key` | TEXT | Primary key; initially `learner_milestone` |
| `cumulative_verified_accounts` | BIGINT | Private monotonic count, incremented during first profile creation |
| `band_key` | TEXT | One of the defined public bands |
| `updated_at` | TIMESTAMPTZ | Server timestamp |

Raw account counts and pioneer numbers are not publicly selectable. A narrow database function returns only `band_key`. Milestone promotion is monotonic.

## 8. Local storage model

Existing `ui-language-progress` data is migrated into a new versioned guest record on first load. Migration is idempotent and preserves all valid learned-term IDs while discarding malformed or unknown values.

Logical storage namespaces:

- guest record;
- authenticated cache keyed by Supabase user ID;
- first-login merge marker keyed by Supabase user ID;
- bounded offline mutation queue keyed by Supabase user ID.

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
2. Client invokes `ensure_learner_profile`; repeat calls return the existing profile without changing counters.
3. Client loads the guest record and the current cloud record.
4. Client calls one authenticated `merge_guest_progress` database function with the bounded guest payload.
5. The function validates ownership and payload limits, then runs one transaction.
6. Existing cloud and guest completion states merge additively for first import; a guest completion never erases a cloud completion.
7. Best quiz score becomes the maximum valid score.
8. Last activity becomes the newest valid activity.
9. Server returns canonical progress and pioneer number.
10. Client replaces the account-scoped cache and records the completed merge marker.

The guest record remains separate so it can be restored after logout, but it is not repeatedly imported into the same account.

### 9.3 Signed-in mutation

1. UI applies the mutation optimistically to the account-scoped cache.
2. Repository upserts the item under the authenticated session.
3. Server assigns `updated_at` and returns the canonical row.
4. Client replaces the optimistic row and shows **Synced**.

For ordinary signed-in edits, the last server-accepted action wins. Quiz score is the exception: the server stores the maximum score. Concurrent edits to the same completion on two devices are rare and deterministic under server acceptance order.

### 9.4 Offline mutation

1. UI writes locally and labels state **Waiting to sync**.
2. A bounded, deduplicated queue stores the latest mutation per item.
3. Retry occurs on the browser `online` event and with capped exponential backoff during the visit.
4. Successful server responses replace optimistic rows.
5. Persistent failure leaves progress usable locally and exposes a manual **Retry sync** action.

Closing a tab before retry may leave account progress only on that device. The UI must not claim **Synced** until the server confirms it.

If the learner requests sign-out while mutations remain unsynced, the account menu first offers **Retry sync** or **Sign out and discard unsynced changes**. This prevents silent loss while still allowing a learner to clear a shared device.

## 10. Security and privacy

- Row-level security is enabled on every learner-data table.
- Authenticated learners may select, insert, update, and delete only rows where `user_id = auth.uid()`.
- Clients cannot assign or modify pioneer numbers.
- The guest-merge function derives identity from `auth.uid()` and ignores any client-supplied user ID.
- Any `SECURITY DEFINER` function uses a fixed `search_path`, explicit grants, bounded inputs, and no dynamic SQL.
- The public community function returns a band key only.
- OAuth return paths accept only safe application-relative routes and reject reserved auth paths.
- Service-role credentials exist only in protected server environment variables.
- Auth endpoints use Supabase rate limits; the UI gives neutral responses that do not reveal whether an email is registered.
- Logs and analytics must not contain access tokens, one-time codes, email addresses, or complete progress payloads.
- Data collection is limited to verified account identity and learning progress required by the feature.

Account deletion requires an authenticated confirmation step. A server-only endpoint deletes the Supabase Auth user with service-role authority; database cascades remove private progress. The browser then clears the account-scoped cache, signs out, and restores guest state. The consumed pioneer number and already-achieved public milestone remain as cumulative, non-identifying counters.

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
- The auth modal traps focus, labels its title and description, closes with Escape, and restores focus to its trigger.
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

1. Create separate Supabase development and production projects.
2. Add schema, constraints, triggers, functions, and row-level-security policies through reviewed migrations.
3. Add the repository boundary and migrate existing browser progress with cloud sync disabled.
4. Prove both production build targets compile.
5. Enable cloud sync only in a Vercel preview connected to the development Supabase project.
6. Validate Google, email-code, callback, logout, deletion, offline recovery, and two-device synchronization.
7. Run security-policy tests using two distinct users and unauthenticated access.
8. Enable production Supabase configuration in Vercel while leaving ChatGPT Sites disabled.
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

### Database tests

- RLS denies unauthenticated private reads and writes;
- user A cannot access user B rows;
- merge function always uses `auth.uid()`;
- merge is atomic and idempotent;
- score and identifier constraints reject invalid input;
- pioneer numbers are unique and never reused;
- public function exposes only a valid band key;
- account deletion cascades through private rows.

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
- RLS isolation and merge-function ownership tests pass.
- Standalone Vercel cloud sync works while ChatGPT Sites retains local-only behavior.
- Lint, both production builds, automated tests, and final human validation pass before release.

## 17. Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Supabase session helpers fail under Vinext compilation | Prove both builds first; isolate standalone auth behind adapter and route boundaries. |
| Guest data overwrites newer cloud data | First import is additive; quiz uses maximum; server returns canonical state. |
| Offline UI falsely promises cloud safety | Never show **Synced** before server confirmation; retain retryable local queue. |
| Shared-device data leak | Separate namespaces; clear account cache on logout/deletion; test account switching. |
| Public learner count looks weak or misleading | Return approved bands only and describe cumulative verified accounts accurately. |
| RLS or privileged function exposes data | Default-deny policies, fixed-search-path functions, explicit grants, and two-user security tests. |
| Curriculum changes break percentages | Stable lesson IDs and versioned migration rules; removed lessons require an explicit mapping. |
| Auth complexity crowds the learning product | Optional modal, one quiet prompt, integrated progress page, no dashboard. |

## 18. Reference documentation

- [Supabase Auth overview](https://supabase.com/docs/guides/auth)
- [Supabase Google login](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Supabase identity linking](https://supabase.com/docs/guides/auth/auth-identity-linking)
