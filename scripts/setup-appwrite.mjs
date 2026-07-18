import { Client, TablesDB } from "node-appwrite";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;

if (!endpoint || !projectId || !apiKey) {
  throw new Error("Appwrite endpoint, project ID, and API key are required.");
}

const databaseId = "academy";
const definitions = [
  {
    tableId: "learner_profiles",
    name: "Learner profiles",
    permissions: [],
    rowSecurity: false,
    columns: [
      { key: "pioneer_number", type: "integer", required: true, min: 1 },
      { key: "created_at", type: "datetime", required: true },
    ],
  },
  {
    tableId: "progress_records",
    name: "Progress records",
    permissions: [],
    rowSecurity: false,
    columns: [
      { key: "payload", type: "string", size: 32768, required: true },
      { key: "schema_version", type: "integer", required: true, min: 2, max: 2 },
      { key: "updated_at", type: "datetime", required: true },
    ],
  },
  {
    tableId: "community_metrics",
    name: "Community metrics",
    permissions: [],
    rowSecurity: false,
    columns: [
      { key: "cumulative_verified_accounts", type: "integer", required: true, min: 0 },
      { key: "band_key", type: "string", size: 32, required: true },
      { key: "updated_at", type: "datetime", required: true },
    ],
  },
];

const client = new Client()
  .setEndpoint(endpoint.replace(/\/$/, ""))
  .setProject(projectId)
  .setKey(apiKey);
const tables = new TablesDB(client);

await ensureDatabase();
for (const definition of definitions) await ensureTable(definition);
await ensureMetricSeed();
console.log("Appwrite learning-progress schema is ready.");

async function ensureDatabase() {
  try {
    await tables.get({ databaseId });
  } catch (error) {
    if (!hasCode(error, 404)) throw error;
    await tables.create({
      databaseId,
      name: "Prompt UI Academy",
      enabled: true,
    });
  }
}

async function ensureTable(definition) {
  try {
    const existing = await tables.getTable({ databaseId, tableId: definition.tableId });
    const actual = new Set(existing.columns.map((column) => column.key));
    const missing = definition.columns.filter((column) => !actual.has(column.key));
    if (missing.length) {
      throw new Error(`${definition.tableId} is missing columns: ${missing.map((item) => item.key).join(", ")}`);
    }
    return;
  } catch (error) {
    if (!hasCode(error, 404)) throw error;
  }

  await tables.createTable({
    databaseId,
    tableId: definition.tableId,
    name: definition.name,
    permissions: definition.permissions,
    rowSecurity: definition.rowSecurity,
    enabled: true,
    columns: definition.columns,
  });
  await waitForColumns(definition);
}

async function waitForColumns(definition) {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    const table = await tables.getTable({ databaseId, tableId: definition.tableId });
    const ready = table.columns.length === definition.columns.length &&
      table.columns.every((column) => column.status === "available");
    if (ready) return;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Timed out while provisioning ${definition.tableId}.`);
}

async function ensureMetricSeed() {
  try {
    await tables.getRow({
      databaseId,
      tableId: "community_metrics",
      rowId: "learner_milestone",
    });
  } catch (error) {
    if (!hasCode(error, 404)) throw error;
    await tables.createRow({
      databaseId,
      tableId: "community_metrics",
      rowId: "learner_milestone",
      data: {
        cumulative_verified_accounts: 0,
        band_key: "founding",
        updated_at: new Date().toISOString(),
      },
      permissions: [],
    });
  }
}

function hasCode(error, code) {
  return typeof error === "object" && error !== null && error.code === code;
}
