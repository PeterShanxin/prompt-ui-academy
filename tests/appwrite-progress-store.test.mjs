import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";

import {
  assertValidProgressPayload,
  communityBandForCount,
  ensureLearnerProfile,
  loadProgressRecord,
  saveProgressRecord,
} from "../app/lib/appwrite/progress-store.ts";

const moduleUrl = new URL("../app/lib/appwrite/progress-store.ts", import.meta.url);

test("provides a server-side Appwrite progress store", () => {
  assert.equal(existsSync(moduleUrl), true);
});

test("maps cumulative verified accounts to privacy-safe community bands", () => {
  assert.equal(communityBandForCount(0), "founding");
  assert.equal(communityBandForCount(24), "founding");
  assert.equal(communityBandForCount(25), "early");
  assert.equal(communityBandForCount(100), "hundred");
  assert.equal(communityBandForCount(1_000), "thousand");
  assert.equal(communityBandForCount(10_000), "ten_thousand");
  assert.equal(communityBandForCount(100_000), "hundred_thousand");
});

test("accepts only bounded versioned learning progress", () => {
  const timestamp = "2026-07-18T08:00:00.000Z";
  const record = {
    schemaVersion: 2,
    items: [{
      kind: "lesson",
      itemId: "ui-components-patterns-structure",
      completed: true,
      updatedAt: timestamp,
    }],
    lastRoute: "/learn",
    lastActivityAt: timestamp,
  };

  assert.deepEqual(
    assertValidProgressPayload(record, Date.parse("2026-07-18T08:01:00.000Z")),
    record,
  );

  assert.throws(
    () => assertValidProgressPayload({ ...record, schemaVersion: 1 }),
    /Invalid progress payload/,
  );
  assert.throws(
    () => assertValidProgressPayload({
      ...record,
      items: [{ ...record.items[0], itemId: "unknown-lesson" }],
    }),
    /Invalid progress payload/,
  );
  assert.throws(
    () => assertValidProgressPayload({ ...record, items: Array(65).fill(record.items[0]) }),
    /Invalid progress payload/,
  );
  assert.throws(
    () => assertValidProgressPayload(
      { ...record, lastActivityAt: "2026-07-18T08:10:01.000Z" },
      Date.parse("2026-07-18T08:00:00.000Z"),
    ),
    /Invalid progress payload/,
  );
});

test("allocates a pioneer number and milestone atomically once per learner", async () => {
  const rows = new Map([
    ["community_metrics:learner_milestone", {
      $id: "learner_milestone",
      cumulative_verified_accounts: 24,
      band_key: "founding",
      updated_at: "2026-07-18T08:00:00.000Z",
    }],
  ]);
  let committed = 0;
  let transactionTtl = 0;
  const tables = {
    async getRow({ tableId, rowId }) {
      const row = rows.get(`${tableId}:${rowId}`);
      if (!row) throw Object.assign(new Error("missing"), { code: 404 });
      return row;
    },
    async createTransaction({ ttl }) {
      transactionTtl = ttl;
      return { $id: "tx-1" };
    },
    async incrementRowColumn({ tableId, rowId }) {
      const key = `${tableId}:${rowId}`;
      const current = rows.get(key);
      const next = {
        ...current,
        cumulative_verified_accounts: current.cumulative_verified_accounts + 1,
      };
      rows.set(key, next);
      return next;
    },
    async createRow({ tableId, rowId, data }) {
      const row = { $id: rowId, ...data };
      rows.set(`${tableId}:${rowId}`, row);
      return row;
    },
    async updateRow({ tableId, rowId, data }) {
      const key = `${tableId}:${rowId}`;
      rows.set(key, { ...rows.get(key), ...data });
      return rows.get(key);
    },
    async updateTransaction({ commit }) { if (commit) committed += 1; },
  };

  const first = await ensureLearnerProfile(tables, "user-1");
  const second = await ensureLearnerProfile(tables, "user-1");

  assert.equal(first.pioneerNumber, 25);
  assert.deepEqual(second, first);
  assert.equal(committed, 1);
  assert.ok(transactionTtl >= 60);
  assert.equal(
    rows.get("community_metrics:learner_milestone").band_key,
    "early",
  );
});

test("stores one validated private progress record per authenticated user", async () => {
  const rows = new Map();
  const tables = {
    async getRow({ tableId, rowId }) {
      const row = rows.get(`${tableId}:${rowId}`);
      if (!row) throw Object.assign(new Error("missing"), { code: 404 });
      return row;
    },
    async upsertRow({ tableId, rowId, data }) {
      const row = { $id: rowId, ...data };
      rows.set(`${tableId}:${rowId}`, row);
      return row;
    },
  };
  const record = {
    schemaVersion: 2,
    items: [],
    lastRoute: "/learn",
    lastActivityAt: "2026-07-18T08:00:00.000Z",
  };

  assert.deepEqual(await loadProgressRecord(tables, "user-1"), {
    schemaVersion: 2,
    items: [],
    lastRoute: null,
    lastActivityAt: null,
  });
  await saveProgressRecord(tables, "user-1", record);
  assert.deepEqual(await loadProgressRecord(tables, "user-1"), record);
});
