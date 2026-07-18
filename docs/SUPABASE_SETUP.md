# Supabase account sync setup

Account sync is an optional enhancement. The entire course remains usable without Supabase, and guest progress stays in the browser. Keep `NEXT_PUBLIC_CLOUD_PROGRESS_ENABLED=false` until every step below is complete.

## 1. Create and link a project

Create a dedicated Supabase project for Prompt UI Academy. From this repository, link it and apply the checked-in migration:

```bash
npx supabase link --project-ref <project-ref>
npx supabase db push
```

The migration creates per-user progress tables, row-level security policies, a one-time guest-progress merge function, and a privacy-preserving community milestone function. It exposes milestone bands, never the raw account total.

## 2. Configure authentication

In Supabase Auth:

1. Set the Site URL to the production site.
2. Add exact redirect URLs for production, previews, and local development, each ending in `/auth/callback`.
3. Enable Google and register Supabase's provider callback URL in Google Cloud.
4. Keep email sign-in enabled. Change the email template to show the six-digit `{{ .Token }}` value so the in-app verification-code form works.
5. Configure production SMTP before launch; the built-in sender is suitable only for limited testing.
6. Keep anonymous sign-in disabled. Guests use browser storage and do not create auth users.

Recommended redirect entries include:

```text
https://prompt-ui-academy.vercel.app/auth/callback
https://<sites-domain>/auth/callback
http://localhost:3000/auth/callback
```

Add preview domains deliberately rather than using an unrestricted wildcard.

## 3. Configure deployment secrets

Copy the names from `.env.example` into each deployment environment:

- `NEXT_PUBLIC_SUPABASE_URL`: project URL.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: publishable client key.
- `SUPABASE_SECRET_KEY`: server-only secret key used solely for account deletion.
- `NEXT_PUBLIC_CLOUD_PROGRESS_ENABLED`: set to `true` only after migration, providers, redirect URLs, and secrets are verified.

Never expose `SUPABASE_SECRET_KEY` through a `NEXT_PUBLIC_` variable. A legacy service-role key is accepted by the code for migration compatibility, but the scoped secret key is preferred.

## 4. Launch verification

Verify against the intended Supabase project before enabling the flag:

1. A guest can complete a lesson, refresh, and keep progress without signing in.
2. Google and email-code sign-in both return to the original route.
3. First sign-in offers and performs an additive local-to-cloud merge.
4. A second browser/device sees the merged progress.
5. Signing out leaves the anonymous course usable and does not expose the prior account cache.
6. One user cannot read or write another user's rows.
7. Account deletion removes the auth user and cascades their profile/progress.
8. The home page shows only a qualitative community band.

If any check fails, leave the public feature flag off; local learning remains fully functional.
