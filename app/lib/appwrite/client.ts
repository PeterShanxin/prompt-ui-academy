"use client";

import { Account, Client } from "appwrite";
import { getPublicAppwriteConfig } from "./config";

let browserAccount: Account | null | undefined;

export function getBrowserAppwriteAccount(): Account | null {
  if (browserAccount !== undefined) return browserAccount;

  const config = getPublicAppwriteConfig();
  if (!config) {
    browserAccount = null;
    return browserAccount;
  }

  const client = new Client()
    .setEndpoint(config.endpoint)
    .setProject(config.projectId);
  browserAccount = new Account(client);
  return browserAccount;
}
