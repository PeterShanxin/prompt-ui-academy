import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const migrationUrl = new URL(
  "../supabase/migrations/20260718081455_create_learning_progress.sql",
  import.meta.url,
);

test("enables RLS and owner policies on every exposed learner table", async () => {
  const sql = await readFile(migrationUrl, "utf8");

  for (const table of ["learner_profiles", "progress_items", "learner_state"]) {
    assert.match(sql, new RegExp(`alter table public\\.${table} enable row level security`, "i"));
  }
  assert.match(sql, /to authenticated\s+using \(\(select auth\.uid\(\)\) = user_id\)/i);
  assert.match(sql, /with check \(\(select auth\.uid\(\)\) = user_id\)/i);
});

test("locks privileged functions to explicit roles and fixed search paths", async () => {
  const sql = await readFile(migrationUrl, "utf8");

  assert.match(sql, /security definer\s+set search_path = ''/gi);
  assert.match(sql, /revoke execute on function public\.ensure_learner_profile\(\) from public, anon, authenticated/i);
  assert.match(sql, /revoke execute on function public\.merge_guest_progress\(jsonb\) from public, anon, authenticated/i);
  assert.match(sql, /grant execute on function public\.get_community_band\(\) to anon, authenticated/i);
});

test("keeps raw community counts private and exposes a band only", async () => {
  const sql = await readFile(migrationUrl, "utf8");

  assert.match(sql, /create table private\.community_metrics/i);
  assert.match(sql, /create or replace function public\.get_community_band\(\)\s+returns text/i);
  assert.doesNotMatch(sql, /grant select on table private\.community_metrics/i);
});

test("bounds guest merge payloads and derives identity from auth", async () => {
  const sql = await readFile(migrationUrl, "utf8");

  assert.match(sql, /pg_column_size\(payload\) > 32768/i);
  assert.match(sql, /jsonb_array_length\(payload -> 'items'\) > 64/i);
  assert.match(sql, /\(payload ->> 'schemaVersion'\)::integer <> 2/i);
  assert.match(sql, /current_user_id uuid := \(select auth\.uid\(\)\)/i);
  assert.doesNotMatch(sql, /user_id uuid := .*payload/i);
  assert.match(sql, /excluded\.last_activity_at >= public\.learner_state\.last_activity_at/i);
  assert.match(sql, /activity_at > now\(\) \+ interval '5 minutes'/i);
});

test("returns a stable profile object and keeps quiz best scores monotonic", async () => {
  const sql = await readFile(migrationUrl, "utf8");

  assert.match(sql, /function public\.ensure_learner_profile\(\)\s+returns jsonb/i);
  assert.match(sql, /new\.best_score := greatest\(old\.best_score, new\.best_score\)/i);
  assert.match(sql, /kind = 'quiz' and best_score is not null and best_score between 0 and 4/i);
});
