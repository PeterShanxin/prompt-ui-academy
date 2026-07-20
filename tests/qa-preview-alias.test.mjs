import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const workflowUrl = new URL(".github/workflows/qa-preview-alias.yml", root);

// The repository has no YAML dependency and this change must not add one, so the
// workflow is sliced by its own indentation instead. That is enough to assert on
// which step owns a condition or a script, which plain substring matching cannot.
function readSteps(workflow) {
  const steps = [];
  let current = null;
  for (const line of workflow.split("\n")) {
    if (/^ {6}- name: /.test(line)) {
      current = { name: line.slice("      - name: ".length).trim(), lines: [] };
      steps.push(current);
      continue;
    }
    if (!current) {
      continue;
    }
    if (line.trim() !== "" && !line.startsWith("        ")) {
      current = null;
      continue;
    }
    current.lines.push(line);
  }
  return steps.map((step) => ({ name: step.name, body: step.lines.join("\n") }));
}

function stepNamed(steps, name) {
  const step = steps.find((candidate) => candidate.name === name);
  assert.ok(step, `the workflow has no step named "${name}"`);
  return step;
}

function conditionOf(step) {
  const match = step.body.match(/^ {8}if: (.+)$/m);
  return match ? match[1].trim() : null;
}

function scriptOf(step) {
  const match = step.body.match(/^ {8}run: \|\n([\s\S]*)$/m);
  return match ? match[1] : "";
}

function branchOf(script, opening, closing) {
  const start = script.indexOf(opening);
  assert.notEqual(start, -1, `the script has no "${opening}" branch`);
  const end = script.indexOf(closing, start + opening.length);
  assert.notEqual(end, -1, `the "${opening}" branch is never closed by "${closing}"`);
  return script.slice(start, end);
}

async function readWorkflow() {
  const workflow = await readFile(workflowUrl, "utf8");
  return { workflow, steps: readSteps(workflow) };
}

test("repoints the QA alias from the deployment that just finished", async () => {
  const { workflow, steps } = await readWorkflow();
  assert.match(workflow, /^on:\n {2}deployment_status:$/m);
  assert.match(workflow, /github\.event\.deployment_status\.state == 'success'/);
  assert.match(workflow, /!startsWith\(github\.event\.deployment_status\.environment, 'Production'\)/);
  assert.match(workflow, /ENVIRONMENT_URL: \$\{\{ github\.event\.deployment_status\.environment_url \}\}/);

  const resolve = stepNamed(steps, "Resolve the Vercel deployment");
  assert.match(scriptOf(resolve), /api\.vercel\.com\/v13\/deployments\/\$\{host\}/);

  const alias = stepNamed(steps, "Assign the QA alias");
  assert.equal(conditionOf(alias), "steps.deployment.outputs.skip == 'false'");
  assert.match(scriptOf(alias), /--request POST/);
  assert.match(scriptOf(alias), /api\.vercel\.com\/v2\/deployments\/\$\{DEPLOYMENT_ID\}\/aliases/);
});

test("keeps the QA alias and Vercel identifiers out of the repository", async () => {
  const { workflow } = await readWorkflow();
  assert.match(workflow, /QA_PREVIEW_ALIAS: \$\{\{ vars\.QA_PREVIEW_ALIAS \}\}/);
  assert.match(workflow, /VERCEL_PROJECT_ID: \$\{\{ secrets\.VERCEL_PROJECT_ID \}\}/);
  assert.match(workflow, /VERCEL_TOKEN: \$\{\{ secrets\.VERCEL_TOKEN \}\}/);
  assert.doesNotMatch(workflow, /[a-z0-9-]+\.vercel\.app/);
});

test("never points the Appwrite-registered alias at fork code", async () => {
  const { steps } = await readWorkflow();
  const script = scriptOf(stepNamed(steps, "Resolve the pull request"));
  const fork = branchOf(script, 'if [ "${head_repository}" != "${GITHUB_REPOSITORY}" ]; then', "fi");
  assert.match(fork, /is a fork/);
  assert.match(fork, /skip=true/);
  assert.doesNotMatch(fork, /skip=false/);
});

test("passes a 409 only after confirming the alias actually moved", async () => {
  const { steps } = await readWorkflow();
  const script = scriptOf(stepNamed(steps, "Assign the QA alias"));

  // Vercel documents 409 both for "already assigned to the given deployment" and
  // for "the domain is not allowed to be used", so the status code alone must
  // never be treated as success.
  const conflict = branchOf(script, 'if [ "${status}" = "409" ]; then', "\n          fi");
  assert.match(
    conflict,
    /api\.vercel\.com\/v2\/deployments\/\$\{DEPLOYMENT_ID\}\/aliases/,
    "a 409 must be checked against the deployment's own alias list",
  );
  assert.match(conflict, /jq --exit-status[\s\S]+?\.aliases\[\]\?; \.alias == \$alias/);
  assert.match(conflict, /exit 1/, "an unconfirmed 409 must fail the job");

  // Order matters: no path may leave the branch successfully before the alias
  // list has confirmed the alias actually moved, so the confirmation must come
  // strictly before the first `exit 0`.
  const confirmation = conflict.indexOf("jq --exit-status");
  const firstSuccess = conflict.indexOf("exit 0");
  assert.notEqual(confirmation, -1);
  assert.notEqual(firstSuccess, -1);
  assert.ok(
    confirmation < firstSuccess,
    "a 409 must not exit 0 before the deployment's alias list confirms the alias",
  );
  assert.doesNotMatch(script, /^ *409\)$/m, "the old unconditional 409 case arm must be gone");
});

test("skips unactionable deployment states green instead of failing the pull request", async () => {
  const { steps } = await readWorkflow();
  const script = scriptOf(stepNamed(steps, "Resolve the Vercel deployment"));
  const notReady = branchOf(script, 'if [ "${ready_state}" != "READY" ]; then', "fi");
  assert.match(notReady, /skip=true/);
  assert.doesNotMatch(notReady, /::error::/);
  assert.doesNotMatch(notReady, /exit 1/);
});

test("records every skip on the run summary rather than only in the step log", async () => {
  const { workflow } = await readWorkflow();
  const skips = workflow.match(/echo "skip=true" >> "\$\{GITHUB_OUTPUT\}"/g) ?? [];
  const summaries = workflow.match(/QA preview alias: skipped\. %s\\n' "\$\{reason\}" >> "\$\{GITHUB_STEP_SUMMARY\}"/g) ?? [];
  assert.ok(skips.length >= 5, "the workflow should still have its no-op guards");
  assert.equal(
    summaries.length,
    skips.length,
    "every skip must explain itself on the run summary, so a mis-typed variable is visible",
  );
});

test("posts one sticky QA link comment per pull request", async () => {
  const { workflow, steps } = await readWorkflow();
  assert.match(workflow, /^ {2}pull-requests: write$/m);
  assert.match(workflow, /COMMENT_MARKER: "<!-- qa-preview-alias -->"/);

  const comment = stepNamed(steps, "Comment the QA link on the pull request");
  assert.equal(conditionOf(comment), "steps.alias.outcome == 'success'");

  const script = scriptOf(comment);
  assert.match(script, /printf '%s\\n\\n' "\$\{COMMENT_MARKER\}"/, "the marker must be written into the body");
  assert.match(script, /--arg marker "\$\{COMMENT_MARKER\}"[\s\S]+?contains\(\$marker\)/, "the lookup must filter on the same marker");

  const update = branchOf(script, 'if [ -n "${comment_id}" ]; then', "else");
  assert.match(update, /--method PATCH/, "an existing comment must be edited");
  assert.doesNotMatch(update, /--method POST/);

  const create = branchOf(script, "else\n", "\n          fi");
  assert.match(create, /--method POST/, "a first run must create the comment");
  assert.doesNotMatch(create, /--method PATCH/);
});

test("warns that a pull request's sticky comment goes stale when another takes the alias", async () => {
  const { steps } = await readWorkflow();
  const script = scriptOf(stepNamed(steps, "Comment the QA link on the pull request"));
  assert.match(script, /records only the last time \*this\* pull request took it/);
});

test("documents the QA alias setup and its shared-alias limit", async () => {
  const setup = await readFile(new URL("docs/APPWRITE_SETUP.md", root), "utf8");
  assert.match(setup, /## 6\. Automate the QA preview alias/);
  assert.match(setup, /`QA_PREVIEW_ALIAS`/);
  assert.match(setup, /`VERCEL_TOKEN`/);
  assert.match(setup, /Last writer wins/);
  assert.match(setup, /Fork pull requests are skipped/);
  assert.match(setup, /the workflow has no manual trigger/);
  assert.match(setup, /goes stale silently/);
});
