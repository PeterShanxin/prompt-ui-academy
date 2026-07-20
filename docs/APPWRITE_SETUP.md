# Appwrite account sync setup

Account sync is optional. The course remains fully usable without Appwrite, and guest progress stays in the browser. Keep `NEXT_PUBLIC_CLOUD_PROGRESS_ENABLED=false` until every step below is complete.

## 1. Create the project and web platforms

Create a dedicated Appwrite Cloud project for Prompt UI Academy in the region closest to the primary audience. Add Web platforms for:

- `localhost` during development;
- `*-peters-projects-9950e3ae.vercel.app` so every pull-request preview deployment
  can sign in (see below);
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

Appwrite matches a platform hostname by exact string, or — only when the pattern
begins with `*` — by stripping that `*` and testing whether the request hostname
ends with the remainder. The remainder does not have to start with a dot, and a
`*` anywhere other than the first character is matched literally.

That makes `*-peters-projects-9950e3ae.vercel.app` the right entry: it covers
every current and future branch preview because they all end in the team suffix,
while trusting nothing outside this Vercel team. Prefer it over the broader
`*.vercel.app`, which would trust every site hosted on `vercel.app`. Appwrite
sessions live in a cross-site cookie on the Appwrite domain, so any trusted
origin can make credentialed calls against this project and read or overwrite a
signed-in learner's progress and email address.

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

## 6. Validate before production

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
