// Checks whether Appwrite accepts a hostname as an OAuth redirect target.
// A hostname is accepted only when it matches a registered Web platform, so this
// doubles as a read-only audit of the project's platform list.
//
// Usage:
//   node scripts/verify-appwrite-platforms.mjs [hostname ...]
//
// Reads NEXT_PUBLIC_APPWRITE_ENDPOINT and NEXT_PUBLIC_APPWRITE_PROJECT_ID.

const DEFAULT_HOSTS = [
  "localhost",
  "prompt-ui-academy.vercel.app",
  "prompt-ui-academy-git-example-branch-peters-projects-9950e3ae.vercel.app",
];

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT?.replace(/\/$/, "");
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

if (!endpoint || !projectId) {
  throw new Error(
    "NEXT_PUBLIC_APPWRITE_ENDPOINT and NEXT_PUBLIC_APPWRITE_PROJECT_ID are required.",
  );
}

const hosts = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_HOSTS;
const results = [];
for (const host of hosts) results.push(await probe(host));

for (const result of results) {
  console.log(`${result.accepted ? "allowed " : "REJECTED"}  ${result.host}${result.detail ? ` — ${result.detail}` : ""}`);
}

const rejected = results.filter((result) => !result.accepted);
if (rejected.length) {
  console.error(
    `\n${rejected.length} hostname(s) are not registered. Add them as Web platforms in the Appwrite console ` +
      `(Overview > Platforms > Add platform > Web). See docs/APPWRITE_SETUP.md.`,
  );
  process.exitCode = 1;
}

async function probe(host) {
  const target = encodeURIComponent(`https://${host}/auth/callback`);
  const url =
    `${endpoint}/account/sessions/oauth2/google` +
    `?project=${encodeURIComponent(projectId)}&success=${target}&failure=${target}`;

  let response;
  try {
    response = await fetch(url, { redirect: "manual" });
  } catch (error) {
    return { host, accepted: false, detail: `request failed: ${error.message}` };
  }

  // Appwrite redirects to the provider once the redirect host is trusted, and
  // renders a 400 error page naming the unregistered client otherwise.
  if (response.status >= 300 && response.status < 400) return { host, accepted: true, detail: "" };

  const body = await response.text().catch(() => "");
  const message = body.match(/Invalid `success` param[^<]*/)?.[0];
  return { host, accepted: false, detail: message ?? `HTTP ${response.status}` };
}
