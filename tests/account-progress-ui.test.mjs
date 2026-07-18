import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("makes early community proof an honest sign-in action", async () => {
  const source = await readFile(
    new URL("app/components/CommunityProof.tsx", root),
    "utf8",
  );

  assert.match(source, /useAuth/);
  assert.match(source, /<button[\s\S]+openAuth/);
  assert.match(source, /成为创始学员/);
  assert.match(source, /Become a founding learner/);
});

test("keeps cloud-progress prompts and dialogs visible in the viewport", async () => {
  const css = await readFile(new URL("app/globals.css", root), "utf8");

  assert.match(css, /\.auth-dialog\s*\{[^}]*position:fixed[^}]*inset:0[^}]*margin:auto/s);
  assert.match(css, /\.save-progress-notice\s*\{[^}]*position:fixed[^}]*bottom:/s);
});

test("exposes sync state while closing and simplifying the account menu", async () => {
  const source = await readFile(
    new URL("app/components/AccountControls.tsx", root),
    "utf8",
  );

  assert.match(source, /sync-indicator/);
  assert.match(source, /pointerdown/);
  assert.match(source, /account-settings-button/);
  assert.match(source, /account-danger-zone/);
  assert.match(source, /issues\/new/);
});
