# Appwrite account sync setup

Account sync is optional. The course remains fully usable without Appwrite, and guest progress stays in the browser. Keep `NEXT_PUBLIC_CLOUD_PROGRESS_ENABLED=false` until every step below is complete.

## 1. Create the project and web platforms

Create a dedicated Appwrite Cloud project for Prompt UI Academy in the region closest to the primary audience. Add Web platforms for:

- `localhost` during development;
- the Vercel preview hostname used for validation;
- `prompt-ui-academy.vercel.app` for production.

Use the regional API endpoint shown by the Appwrite console, including `/v1`.

## 2. Configure authentication

In **Auth > Settings**:

1. Enable Email OTP. Appwrite sends the six-digit verification code used by the existing modal.
2. Enable Google OAuth.
3. Create a Google OAuth client and copy Appwrite's provider callback URL into Google Cloud exactly.
4. Add the development, preview, and production origins to the OAuth configuration.

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

Set these variables for the intended Vercel preview first:

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
9. Account deletion disables and deletes the identity before removing private rows. In-flight progress requests recheck the identity and remove any rows they wrote after deletion.

Only after this preview gate should the same variables be enabled for production.
