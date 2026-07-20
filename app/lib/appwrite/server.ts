import { Account, Client, TablesDB, Users } from "node-appwrite";
import { getPublicAppwriteConfig } from "./config.ts";

export const APPWRITE_DATABASE_ID = "academy";
export const APPWRITE_PROFILES_TABLE_ID = "learner_profiles";
export const APPWRITE_PROGRESS_TABLE_ID = "progress_records";
export const APPWRITE_METRICS_TABLE_ID = "community_metrics";
export const APPWRITE_METRIC_ROW_ID = "learner_milestone";

export function createAppwriteAdminServices() {
  const config = getPublicAppwriteConfig();
  const apiKey = process.env.APPWRITE_API_KEY;
  if (!config || !apiKey) return null;

  const client = new Client()
    .setEndpoint(config.endpoint)
    .setProject(config.projectId)
    .setKey(apiKey);
  return {
    tables: new TablesDB(client),
    users: new Users(client),
  };
}

export function createAppwriteJwtAccount(jwt: string): Account | null {
  const config = getPublicAppwriteConfig();
  if (!config) return null;

  const client = new Client()
    .setEndpoint(config.endpoint)
    .setProject(config.projectId)
    .setJWT(jwt);
  return new Account(client);
}
