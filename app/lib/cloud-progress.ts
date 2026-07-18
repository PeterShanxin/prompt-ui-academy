import type { SupabaseClient } from "@supabase/supabase-js";
import {
  PROGRESS_SCHEMA_VERSION,
  createEmptyProgress,
  type LearningProgressRecord,
  type ProgressItem,
} from "./learning-progress";

export type LearnerProfile = {
  userId: string;
  pioneerNumber: number;
  createdAt: string;
};

export type CommunityBand =
  | "founding"
  | "early"
  | "hundred"
  | "thousand"
  | "ten_thousand"
  | "hundred_thousand";

type ProgressRow = {
  kind: ProgressItem["kind"];
  item_id: string;
  completed: boolean;
  best_score: number | null;
  updated_at: string;
};

type StateRow = {
  last_route: string | null;
  last_activity_at: string | null;
};

type ProfileRow = {
  user_id: string;
  pioneer_number: number;
  created_at: string;
};

export async function ensureLearnerProfile(
  client: SupabaseClient,
): Promise<LearnerProfile> {
  const { data, error } = await client.rpc("ensure_learner_profile");
  if (error) throw error;
  const row = data as ProfileRow;
  return {
    userId: row.user_id,
    pioneerNumber: row.pioneer_number,
    createdAt: row.created_at,
  };
}

export async function loadCloudProgress(
  client: SupabaseClient,
  userId: string,
): Promise<LearningProgressRecord> {
  const [itemsResult, stateResult] = await Promise.all([
    client
      .from("progress_items")
      .select("kind,item_id,completed,best_score,updated_at")
      .eq("user_id", userId),
    client
      .from("learner_state")
      .select("last_route,last_activity_at")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);
  if (itemsResult.error) throw itemsResult.error;
  if (stateResult.error) throw stateResult.error;

  const rows = (itemsResult.data ?? []) as ProgressRow[];
  const state = stateResult.data as StateRow | null;
  return {
    ...createEmptyProgress(),
    items: rows.map((row) => ({
      kind: row.kind,
      itemId: row.item_id,
      completed: row.completed,
      ...(row.best_score === null ? {} : { bestScore: row.best_score }),
      updatedAt: row.updated_at,
    })),
    lastRoute: state?.last_route ?? null,
    lastActivityAt: state?.last_activity_at ?? null,
  };
}

export async function mergeGuestProgress(
  client: SupabaseClient,
  record: LearningProgressRecord,
): Promise<void> {
  const { error } = await client.rpc("merge_guest_progress", {
    payload: {
      schemaVersion: PROGRESS_SCHEMA_VERSION,
      items: record.items,
      lastRoute: record.lastRoute,
      lastActivityAt: record.lastActivityAt,
    },
  });
  if (error) throw error;
}

export async function saveCloudItem(
  client: SupabaseClient,
  userId: string,
  item: ProgressItem,
): Promise<ProgressItem> {
  const { data, error } = await client
    .from("progress_items")
    .upsert(
      {
        user_id: userId,
        kind: item.kind,
        item_id: item.itemId,
        completed: item.completed,
        best_score: item.kind === "quiz" ? (item.bestScore ?? 0) : null,
      },
      { onConflict: "user_id,kind,item_id" },
    )
    .select("kind,item_id,completed,best_score,updated_at")
    .single();
  if (error) throw error;

  const row = data as ProgressRow;
  return {
    kind: row.kind,
    itemId: row.item_id,
    completed: row.completed,
    ...(row.best_score === null ? {} : { bestScore: row.best_score }),
    updatedAt: row.updated_at,
  };
}

export async function saveCloudState(
  client: SupabaseClient,
  userId: string,
  record: LearningProgressRecord,
): Promise<void> {
  if (!record.lastRoute || !record.lastActivityAt) return;
  const { error } = await client.from("learner_state").upsert(
    {
      user_id: userId,
      last_route: record.lastRoute,
      last_activity_at: record.lastActivityAt,
      schema_version: PROGRESS_SCHEMA_VERSION,
    },
    { onConflict: "user_id" },
  );
  if (error) throw error;
}

export async function saveCloudProgress(
  client: SupabaseClient,
  userId: string,
  record: LearningProgressRecord,
): Promise<LearningProgressRecord> {
  for (const item of record.items) {
    await saveCloudItem(client, userId, item);
  }
  await saveCloudState(client, userId, record);
  return loadCloudProgress(client, userId);
}

export async function loadCommunityBand(
  client: SupabaseClient,
): Promise<CommunityBand> {
  const { data, error } = await client.rpc("get_community_band");
  if (error) throw error;
  return isCommunityBand(data) ? data : "founding";
}

function isCommunityBand(value: unknown): value is CommunityBand {
  return (
    value === "founding" ||
    value === "early" ||
    value === "hundred" ||
    value === "thousand" ||
    value === "ten_thousand" ||
    value === "hundred_thousand"
  );
}
