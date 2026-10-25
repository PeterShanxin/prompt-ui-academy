# Appwrite account sync setup

Account sync is optional. The course remains fully usable without Appwrite, and guest progress stays in the browser. Keep `NEXT_PUBLIC_CLOUD_PROGRESS_ENABLED=false` until every step below is complete.

## 1. Create the project and web platforms

Create a dedicated Appwrite Cloud project for Prompt UI Academy in the region closest to the primary audience. Add Web platforms for:

- `localhost` during development;
- `*.vercel.app` so every pull-request preview deployment can sign in (see below);
- `prompt-ui-academy.vercel.app` for production.

The free plan allows three platforms per project, which is exactly this list.

Use the regional API endpoint shown by the Appwrite console, including `/v1`.

Platforms can only be added through the console UI. Appwrite Cloud API keys are
project-scoped and cannot carry the `projects.write` scope, so there is no
scripted equivalent of this step.

### Why pull-request previews need a wildcard

Appwrite rejects any OAuth `success` or `failure` URL whose hostname is not a
registered Web platform, answering with `Invalid` `success` `param: Invalid URI.
Register your new client ... as a new Web platform`. Vercel mints a fresh
hostname for every branch, shaped like
`prompt-ui-academy-git-BRANCH-TEAM.vercel.app`, and rewrites it whenever a branch
is renamed. Listing preview hostnames one at a time therefore means every new
pull request opens with sign-in broken, and the free plan's three-platform limit
leaves no room to keep adding them.

Register `*.vercel.app`. It is the only pattern that covers preview hostnames,
for two reasons that pull in opposite directions. The server matches a platform
by exact string, or — when the pattern begins with `*` — by stripping the `*` and
testing the request hostname as a suffix; a `*` in any other position is matched
literally. That alone would permit a tightly scoped
`*-peters-projects-9950e3ae.vercel.app`. The console's own form validation is
stricter and rejects it, because it requires the wildcard to occupy a whole
domain label. Since a Vercel preview hostname is a single label directly under
`vercel.app`, no narrower wildcard survives both checks.

Accept the consequence deliberately: `*.vercel.app` trusts every site hosted on
`vercel.app`, not only ours, and the platform list is the *only* control guarding
two things.

First, credentialed cross-origin access. Appwrite Cloud sets the session cookie
with `SameSite=None`, and its CORS layer reflects any origin whose host matches a
platform together with `Access-Control-Allow-Credentials: true`. A hostile page
on any `vercel.app` subdomain can therefore call this project with the visitor's
session attached and read or overwrite their email, name, and progress.

Second, session theft. The OAuth2 token flow appends `userId` and a `secret` to
the `success` URL, and `success` is validated against the platform hostnames and
nothing else. An attacker who deploys any site to `vercel.app` can send a learner
a link whose `success` points at that site, receive the returned credentials, and
exchange them for a session — full account takeover, not just data disclosure.

Both require the learner to visit or click, and the attacker only needs one free
Vercel deployment to obtain a qualifying hostname.

That trade is acceptable while cloud progress is preview-gated and the only
people signing in are maintainers testing their own pull requests. It stops being
acceptable the moment real learners sign in, because the same wildcard also
matches `prompt-ui-academy.vercel.app`. Before enabling cloud progress in
production, split the environments:

- a preview Appwrite project that keeps `*.vercel.app`, wired to Vercel's Preview
  environment variables;
- a production Appwrite project whose only platforms are
  `prompt-ui-academy.vercel.app` and `localhost`.

Track that split as a release blocker rather than leaving one project wildcarded
for production traffic.

If preview sign-in is ever shared with people outside the maintainer team before
that split happens, drop the wildcard and pin the third platform slot to a single
stable QA preview alias instead, confirming it with
`npm run appwrite:verify-platforms`. That alias is what section 6 keeps pointed
at the pull request under test, so the platform list stops changing per branch.
Owning a domain removes the dilemma entirely: alias previews to it and register
`*.preview.<your-domain>`, a wildcard bounded by DNS you control.

After changing platforms, confirm the result without opening a browser:

```bash
export NEXT_PUBLIC_APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1
export NEXT_PUBLIC_APPWRITE_PROJECT_ID=prompt-ui-academy
npm run appwrite:verify-platforms
npm run appwrite:verify-platforms -- some-preview-host.vercel.app
```

The script reports each hostname as `allowed` or `REJECTED` and exits non-zero if
any hostname is unregistered.

## 2. Configure authentication

In **Auth > Settings**:

1. Enable Email OTP. Appwrite sends the six-digit verification code used by the existing modal.
2. Enable Google OAuth.
3. Create a Google OAuth client and copy Appwrite's provider callback URL into Google Cloud exactly.

Google only ever redirects back to Appwrite's own callback URL, so that single
authorized redirect URI is the whole Google-side configuration. Application
origins do not belong in the Google client — they are governed by the Appwrite
Web platforms in step 1, which is what rejects unregistered preview hostnames.

The application supplies only validated same-origin success and failure URLs. Learning routes are never gated by authentication.

## 3. Create the server API keys

Create a temporary provisioning key with only these scopes:

- `databases.read`
- `databases.write`
- `tables.read`
- `tables.write`
- `columns.read`
- `columns.write`
- `rows.read`
- `rows.write`

Use it only for `npm run appwrite:setup`, then delete it.

Create a separate runtime key for the standalone Vercel deployment with only these scopes:

- `databases.read`
- `databases.write`
- `rows.read`
- `rows.write`
- `users.read`
- `users.write`

The runtime key owns all progress rows, allocates pioneer numbers, returns community bands, and performs account deletion. Authenticated JWTs are validated separately against Appwrite Auth. Never expose either key through a `NEXT_PUBLIC_` variable or a client bundle.

## 4. Provision the private database

Set the endpoint, project ID, and temporary provisioning key in the current shell, then run:

```bash
export NEXT_PUBLIC_APPWRITE_ENDPOINT=<regional endpoint>/v1
export NEXT_PUBLIC_APPWRITE_PROJECT_ID=<project ID>
export APPWRITE_SETUP_API_KEY=<temporary provisioning key>
```

Then provision the schema:

```bash
npm run appwrite:setup
```

The idempotent script creates the `academy` database and three server-only tables:

- `learner_profiles` for private pioneer numbers;
- `progress_records` for bounded versioned progress payloads;
- `community_metrics` for the cumulative verified-account milestone.

All table permissions are empty. Browser clients never access these tables directly; Next.js routes derive the user ID from a short-lived Appwrite JWT and use the server key after validation. Profile creation increments the metric and assigns a pioneer number in one database transaction.

## 5. Configure Vercel

Set these variables on the **Preview** environment first, without restricting
them to a single branch, so every pull-request deployment inherits them:

- `NEXT_PUBLIC_CLOUD_PROGRESS_ENABLED=true`
- `NEXT_PUBLIC_APPWRITE_ENDPOINT=<regional endpoint>/v1`
- `NEXT_PUBLIC_APPWRITE_PROJECT_ID=<project ID>`
- `APPWRITE_API_KEY=<server API key>`

Leave cloud progress disabled for the ChatGPT Sites/Cloudflare build in this release.

## 6. Automate the QA preview alias

Section 1 explains why per-branch preview hostnames cannot each be registered as
Appwrite Web platforms. The narrower alternative to `*.vercel.app` is one stable
QA hostname, registered once and reused by every pull request. A manually
assigned Vercel alias does not follow new commits, so
`.github/workflows/qa-preview-alias.yml` repoints it automatically and publishes
the resulting link where reviewers look.

The live platform list is still the one in section 1, wildcard included, so
branch preview URLs do sign in today. The QA alias is the hostname that keeps
signing in *after* the wildcard is dropped, and it is the only preview hostname
whose registration never changes. The sticky comment therefore steers reviewers
to the alias as the guaranteed link rather than claiming the branch URL is
already broken. Keep the two sections consistent: if the third platform slot is
ever repointed from `*.vercel.app` to this alias, say so in section 1.

### How the workflow runs

Vercel deploys through its own Git integration, so a `pull_request` run cannot
know the preview URL. The workflow listens for `deployment_status` instead:
GitHub emits one when Vercel finishes, carrying the deployment that just went
live in `environment_url`. On a successful, non-production status it

1. resolves the open pull request that contains the deployed commit;
2. confirms through the Vercel REST API that the deployment is `READY`, belongs
   to this project, and is not a production target, skipping green when any of
   those does not hold — `environment_url` is a branch-scoped hostname, so it can
   already have moved to a newer deployment that this pull request cannot act on;
3. assigns the alias with `POST /v2/deployments/{id}/aliases`, the API behind
   `vercel alias set`. That endpoint answers `409` both when the alias is already
   on this deployment and when the domain is not allowed to be used, so a `409`
   passes only after `GET /v2/deployments/{id}/aliases` shows the alias really is
   on the deployment; otherwise the run fails rather than advertising a link that
   never moved;
4. creates or updates one sticky comment on the pull request carrying the QA
   link, the aliased deployment, and the commit it points at.

GitHub runs `deployment_status` workflows from the default branch, so the file
takes effect only after it reaches `main`. A pull request that changes the
workflow does not exercise the new version.

### One-time setup

1. In Vercel, assign the chosen hostname to any existing preview deployment once,
   so the alias exists before CI tries to move it.
2. Add that hostname as a Web platform in Appwrite (section 1), then confirm it
   without a browser:

   ```bash
   npm run appwrite:verify-platforms -- <qa alias hostname>
   ```

3. Add the entries below under **Settings > Secrets and variables > Actions** in
   the GitHub repository.

| Name | Kind | Value |
| --- | --- | --- |
| `QA_PREVIEW_ALIAS` | Variable | The QA alias hostname, without a scheme |
| `VERCEL_TOKEN` | Secret | A Vercel access token for the account or team that owns the project |
| `VERCEL_PROJECT_ID` | Secret | The project ID from the Vercel project settings |
| `VERCEL_ORG_ID` | Secret | The Vercel team ID; leave it unset for a personal account |

Nothing else needs the alias hostname, so it is never hardcoded in the
repository. When a required entry is missing, or when `VERCEL_PROJECT_ID` does
not match the project that produced the deployment, the workflow finishes green
rather than failing an unconfigured fork or clone — but it writes the reason to
the run summary, so a mis-typed value is visible on the run page instead of only
in the step log. If the alias never moves, open the newest **QA preview alias**
run and read the summary before assuming the workflow is not wired up.

### Accepted limits

**Last writer wins.** Every open pull request shares this one alias, so the most
recent preview deployment across all of them owns it. Alias-per-pull-request
would cost one Appwrite platform slot per alias, which the free plan cannot fund,
so a shared alias is the deliberate choice at current team size. Push a new
commit to take the alias back; the workflow has no manual trigger, and re-running
an old run replays the deployment status it was originally given.

Each pull request's sticky comment records only the last time *that* pull request
held the alias, and nothing updates it when another pull request takes over, so
it goes stale silently. Before trusting a comment, confirm who currently owns the
alias from the **QA preview alias** run list in the Actions tab, or from the
deployment the alias resolves to in the Vercel dashboard.

**Fork pull requests are skipped.** The alias is a registered Appwrite Web
platform, so anything served from it can read and write a signed-in learner's
session, as described in section 1. Pointing it at unreviewed fork code would
hand that code those credentials. Fork pull requests are recorded as a notice and
left on their branch URL, which signs in only while `*.vercel.app` is still
registered and stops working the moment that wildcard is dropped.

## 7. Validate before production

Use two real test accounts and complete all of the following on the preview:

1. Guest progress survives reload without any network account call.
2. Google and email-code sign-in return to the initiating learning route.
3. First sign-in adds guest achievements to existing cloud progress.
4. Progress saved in browser A appears after sign-in in browser B.
5. Signing out restores guest progress and does not expose account data.
6. Offline edits remain local, retry, and never claim to be synced early.
7. Each account can read only its own progress through the authenticated routes.
8. The homepage response contains a band key, never an exact learner count.
9. Account deletion disables the identity as a write barrier, transactionally removes private rows, and then deletes the identity. If identity deletion fails, the rows are restored before the account is re-enabled.

Only after this preview gate should the same variables be enabled for production.
