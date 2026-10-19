import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { test } from "node:test";

const yaml = readFileSync(new URL("../.github/workflows/dependabot-review-routing.yml", import.meta.url), "utf8").replaceAll("\r\n", "\n");
const marker = "        run: |\n";
const start = yaml.indexOf(marker);
assert.notEqual(start, -1);
const script = yaml.slice(start + marker.length).split("\n").map((line) => line.slice(10)).join("\n");
const quote = (value) => `'${value.replaceAll("'", "'\\''")}'`;

function route(overrides) {
  const values = {
    GH_TOKEN: "fixture-token",
    REPOSITORY: "example/project",
    PR_NUMBER: "1",
    PR_AUTHOR: "another-contributor",
    PR_TITLE: "docs: clarify writing",
    PR_HEAD: "docs/writing",
    EVENT_NAME: "pull_request_target",
    EVENT_ACTION: "opened",
    REVIEW_AUTHOR: "",
    REVIEW_BODY: "",
    ...overrides,
  };
  // FD 3 captures attempted requests even when the workflow redirects curl output.
  const wrapped = `exec 3>&1\ncurl() { printf '__REQUEST__ %s\\n' "$*" >&3; }\n${Object.entries(values).map(([key, value]) => `export ${key}=${quote(value)}`).join("\n")}\n${script}`;
  const result = spawnSync("bash", ["--noprofile", "--norc"], { input: wrapped, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr || String(result.error));
  return result.stdout.split("\n").filter((line) => line.startsWith("__REQUEST__ "));
}

test("does not request an impossible self-review on opening, ready or review events", () => {
  for (const [event, action] of [["pull_request_target", "opened"], ["pull_request_target", "ready_for_review"], ["pull_request_review", "submitted"]]) {
    assert.deepEqual(route({ PR_AUTHOR: "PeterShanxin", EVENT_NAME: event, EVENT_ACTION: action }), []);
  }
});

test("still requests the designated reviewer for another human author", () => {
  const calls = route({ EVENT_ACTION: "ready_for_review" });
  assert.equal(calls.length, 1);
  assert.match(calls[0], /-X POST/);
  assert.match(calls[0], /PeterShanxin/);
});

test("does not repeat human review requests on synchronize", () => {
  assert.deepEqual(route({ EVENT_ACTION: "synchronize" }), []);
});

test("keeps low-risk dependency removal and high-risk dependency review", () => {
  const low = route({ PR_AUTHOR: "dependabot[bot]", PR_TITLE: "chore(deps): minor-patch updates" });
  const high = route({ PR_AUTHOR: "dependabot[bot]", PR_TITLE: "chore(deps): major update" });
  assert.equal(low.length, 1);
  assert.match(low[0], /-X DELETE/);
  assert.equal(high.length, 1);
  assert.match(high[0], /-X POST/);
});

test("preserves review requests when an existing dependency review reports findings", () => {
  const calls = route({ PR_AUTHOR: "dependabot[bot]", PR_TITLE: "chore(deps): minor-patch updates", EVENT_NAME: "pull_request_review", EVENT_ACTION: "submitted", REVIEW_AUTHOR: "cursor", REVIEW_BODY: "security finding: needs a fix" });
  assert.equal(calls.length, 1);
  assert.match(calls[0], /-X POST/);
});
