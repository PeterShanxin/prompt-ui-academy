import assert from "node:assert/strict";
import test from "node:test";

import { safeReturnPath } from "../app/lib/auth-return.ts";

test("accepts learning routes with query strings and hashes", () => {
  assert.equal(safeReturnPath("/lab?mode=precise#editor"), "/lab?mode=precise#editor");
});

test("rejects absolute, protocol-relative, and reserved auth routes", () => {
  for (const value of [
    "https://evil.example/",
    "//evil.example/",
    "/auth/callback?next=https://evil.example",
    "/signin-with-chatgpt",
  ]) {
    assert.equal(safeReturnPath(value), "/learn");
  }
});
