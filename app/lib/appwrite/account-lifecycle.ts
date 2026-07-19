import type { TablesDB, Users } from "node-appwrite";
import { deleteLearnerPrivateRows } from "./progress-store.ts";

export async function learnerIdentityExists(
  users: Users,
  tables: TablesDB,
  userId: string,
): Promise<boolean> {
  try {
    await users.get({ userId });
    return true;
  } catch (error) {
    if (!hasCode(error, 404)) throw error;
  }

  try {
    await deleteLearnerPrivateRows(tables, userId);
  } catch (error) {
    if (!hasCode(error, 404)) throw error;
  }
  return false;
}

function hasCode(error: unknown, code: number): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === code;
}
