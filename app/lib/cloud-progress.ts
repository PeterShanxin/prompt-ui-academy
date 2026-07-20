import type { Account } from "appwrite";
import type { LearningProgressRecord } from "./learning-progress";

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

export type CloudProgressSnapshot = {
  record: LearningProgressRecord;
  profile: LearnerProfile;
};

export async function loadCloudProgress(account: Account): Promise<CloudProgressSnapshot> {
  return authenticatedRequest(account, "/api/progress", { method: "GET" });
}

export async function mergeGuestProgress(
  account: Account,
  record: LearningProgressRecord,
): Promise<CloudProgressSnapshot> {
  return authenticatedRequest(account, "/api/progress/merge", {
    method: "POST",
    body: JSON.stringify({ record }),
  });
}

export async function saveCloudProgress(
  account: Account,
  record: LearningProgressRecord,
): Promise<LearningProgressRecord> {
  const snapshot = await authenticatedRequest<CloudProgressSnapshot>(
    account,
    "/api/progress",
    { method: "PUT", body: JSON.stringify({ record }) },
  );
  return snapshot.record;
}

export async function loadCommunityBand(): Promise<CommunityBand> {
  const response = await fetch("/api/community", { cache: "no-store" });
  if (!response.ok) throw new Error("Community milestone is unavailable.");
  const value: unknown = await response.json();
  if (!isObject(value) || !isCommunityBand(value.band)) return "founding";
  return value.band;
}

async function authenticatedRequest<T>(
  account: Account,
  path: string,
  init: RequestInit,
): Promise<T> {
  const { jwt } = await account.createJWT();
  const response = await fetch(path, {
    ...init,
    headers: {
      Authorization: `Bearer ${jwt}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Cloud progress request failed.");
  return response.json() as Promise<T>;
}

function isCommunityBand(value: unknown): value is CommunityBand {
  return value === "founding" || value === "early" || value === "hundred" ||
    value === "thousand" || value === "ten_thousand" || value === "hundred_thousand";
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
