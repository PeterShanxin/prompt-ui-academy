import type { TablesDB } from "node-appwrite";
import type { CommunityBand, LearnerProfile } from "../cloud-progress";
import {
  PROGRESS_SCHEMA_VERSION,
  createEmptyProgress,
  firstLoginMerge,
  parseProgressRecord,
  reconcileProgressRecords,
  type LearningProgressRecord,
} from "../learning-progress.ts";
import {
  APPWRITE_DATABASE_ID,
  APPWRITE_METRIC_ROW_ID,
  APPWRITE_METRICS_TABLE_ID,
  APPWRITE_PROFILES_TABLE_ID,
  APPWRITE_PROGRESS_TABLE_ID,
} from "./server.ts";

export function communityBandForCount(count: number): CommunityBand {
  if (count >= 100_000) return "hundred_thousand";
  if (count >= 10_000) return "ten_thousand";
  if (count >= 1_000) return "thousand";
  if (count >= 100) return "hundred";
  if (count >= 25) return "early";
  return "founding";
}

export function assertValidProgressPayload(
  value: unknown,
  now = Date.now(),
): LearningProgressRecord {
  const invalid = (): never => { throw new Error("Invalid progress payload."); };
  const candidate = isObject(value) ? value : invalid();
  if (candidate.schemaVersion !== PROGRESS_SCHEMA_VERSION) invalid();
  const items = Array.isArray(candidate.items) ? candidate.items : invalid();
  if (items.length > 64) invalid();
  if (new TextEncoder().encode(JSON.stringify(candidate)).byteLength > 32_768) invalid();

  const parsed = parseProgressRecord(JSON.stringify(candidate));
  if (parsed.items.length !== items.length) invalid();
  for (let index = 0; index < items.length; index += 1) {
    const raw = items[index];
    const item = parsed.items[index];
    if (!isObject(raw) || !item) invalid();
    if (
      raw.kind !== item.kind ||
      raw.itemId !== item.itemId ||
      raw.completed !== item.completed ||
      raw.updatedAt !== item.updatedAt ||
      Date.parse(item.updatedAt) > now + 5 * 60_000
    ) invalid();
    if (item.kind === "quiz") {
      if (!Number.isInteger(raw.bestScore) || raw.bestScore !== item.bestScore) invalid();
    } else if (raw.bestScore !== undefined) invalid();
  }

  if ((parsed.lastRoute === null) !== (parsed.lastActivityAt === null)) invalid();
  if (candidate.lastRoute !== parsed.lastRoute || candidate.lastActivityAt !== parsed.lastActivityAt) invalid();
  if (parsed.lastActivityAt && Date.parse(parsed.lastActivityAt) > now + 5 * 60_000) invalid();
  return parsed;
}

export async function ensureLearnerProfile(
  tables: TablesDB,
  userId: string,
): Promise<LearnerProfile> {
  try {
    return profileFromRow(await tables.getRow({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: APPWRITE_PROFILES_TABLE_ID,
      rowId: userId,
    }));
  } catch (error) {
    if (!hasCode(error, 404)) throw error;
  }

  const transaction = await tables.createTransaction({ ttl: 60 });
  try {
    const updatedAt = new Date().toISOString();
    const metric = await tables.incrementRowColumn({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: APPWRITE_METRICS_TABLE_ID,
      rowId: APPWRITE_METRIC_ROW_ID,
      column: "cumulative_verified_accounts",
      value: 1,
      transactionId: transaction.$id,
    });
    const pioneerNumber = Number(metric.cumulative_verified_accounts);
    const profile = await tables.createRow({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: APPWRITE_PROFILES_TABLE_ID,
      rowId: userId,
      data: { pioneer_number: pioneerNumber, created_at: updatedAt },
      permissions: [],
      transactionId: transaction.$id,
    });
    await tables.updateRow({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: APPWRITE_METRICS_TABLE_ID,
      rowId: APPWRITE_METRIC_ROW_ID,
      data: {
        band_key: communityBandForCount(pioneerNumber),
        updated_at: updatedAt,
      },
      transactionId: transaction.$id,
    });
    await tables.updateTransaction({ transactionId: transaction.$id, commit: true });
    return profileFromRow(profile);
  } catch (error) {
    try {
      await tables.updateTransaction({ transactionId: transaction.$id, rollback: true });
    } catch {
      // Appwrite may already have rolled back a conflicting transaction.
    }
    if (hasCode(error, 409)) {
      return profileFromRow(await tables.getRow({
        databaseId: APPWRITE_DATABASE_ID,
        tableId: APPWRITE_PROFILES_TABLE_ID,
        rowId: userId,
      }));
    }
    throw error;
  }
}

export async function loadProgressRecord(
  tables: TablesDB,
  userId: string,
  transactionId?: string,
): Promise<LearningProgressRecord> {
  try {
    const row = await tables.getRow({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: APPWRITE_PROGRESS_TABLE_ID,
      rowId: userId,
      ...(transactionId ? { transactionId } : {}),
    });
    if (typeof row.payload !== "string") throw new Error("Invalid stored progress.");
    return assertValidProgressPayload(JSON.parse(row.payload));
  } catch (error) {
    if (hasCode(error, 404)) return createEmptyProgress();
    throw error;
  }
}

export async function saveProgressRecord(
  tables: TablesDB,
  userId: string,
  record: LearningProgressRecord,
  transactionId?: string,
): Promise<LearningProgressRecord> {
  const canonical = assertValidProgressPayload(record);
  await tables.upsertRow({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: APPWRITE_PROGRESS_TABLE_ID,
    rowId: userId,
    data: {
      payload: JSON.stringify(canonical),
      schema_version: PROGRESS_SCHEMA_VERSION,
      updated_at: new Date().toISOString(),
    },
    permissions: [],
    ...(transactionId ? { transactionId } : {}),
  });
  return canonical;
}

export async function reconcileAndSaveProgressRecord(
  tables: TablesDB,
  userId: string,
  submitted: LearningProgressRecord,
): Promise<LearningProgressRecord> {
  return saveProgressTransaction(tables, userId, submitted, reconcileProgressRecords);
}

export async function mergeGuestAndSaveProgressRecord(
  tables: TablesDB,
  userId: string,
  guest: LearningProgressRecord,
): Promise<LearningProgressRecord> {
  return saveProgressTransaction(tables, userId, guest, firstLoginMerge);
}

async function saveProgressTransaction(
  tables: TablesDB,
  userId: string,
  submitted: LearningProgressRecord,
  merge: (
    existing: LearningProgressRecord,
    submitted: LearningProgressRecord,
  ) => LearningProgressRecord,
): Promise<LearningProgressRecord> {
  const validated = assertValidProgressPayload(submitted);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const transaction = await tables.createTransaction({ ttl: 60 });
    try {
      const existing = await loadProgressRecord(tables, userId, transaction.$id);
      const canonical = merge(existing, validated);
      await saveProgressRecord(tables, userId, canonical, transaction.$id);
      await tables.updateTransaction({ transactionId: transaction.$id, commit: true });
      return canonical;
    } catch (error) {
      try {
        await tables.updateTransaction({ transactionId: transaction.$id, rollback: true });
      } catch {
        // A conflicting transaction may already be closed by Appwrite.
      }
      if (hasCode(error, 409) && attempt < 2) continue;
      throw error;
    }
  }

  throw new Error("Progress transaction could not be committed.");
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function hasCode(error: unknown, code: number): boolean {
  return isObject(error) && error.code === code;
}

function profileFromRow(row: Record<string, unknown>): LearnerProfile {
  const pioneerNumber = Number(row.pioneer_number);
  if (
    typeof row.$id !== "string" ||
    !Number.isSafeInteger(pioneerNumber) ||
    pioneerNumber < 1 ||
    typeof row.created_at !== "string"
  ) {
    throw new Error("Invalid learner profile.");
  }
  return { userId: row.$id, pioneerNumber, createdAt: row.created_at };
}
