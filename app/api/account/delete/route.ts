import { NextResponse } from "next/server";
import { AppwriteHttpError, requireAppwriteUser } from "../../../lib/appwrite/auth";
import {
  APPWRITE_DATABASE_ID,
  APPWRITE_PROFILES_TABLE_ID,
  APPWRITE_PROGRESS_TABLE_ID,
  createAppwriteAdminServices,
} from "../../../lib/appwrite/server";

export const dynamic = "force-dynamic";

export async function DELETE(request: Request) {
  let userId: string | null = null;
  let dataDeleted = false;
  const services = createAppwriteAdminServices();
  try {
    if (!services) throw new AppwriteHttpError(503, "Account deletion is unavailable.");
    userId = (await requireAppwriteUser(request)).userId;
    await services.users.updateStatus({ userId, status: false });

    const existingTables: string[] = [];
    for (const tableId of [APPWRITE_PROGRESS_TABLE_ID, APPWRITE_PROFILES_TABLE_ID]) {
      try {
        await services.tables.getRow({ databaseId: APPWRITE_DATABASE_ID, tableId, rowId: userId });
        existingTables.push(tableId);
      } catch (error) {
        if (!hasCode(error, 404)) throw error;
      }
    }
    if (existingTables.length) {
      const transaction = await services.tables.createTransaction({ ttl: 30 });
      for (const tableId of existingTables) {
        await services.tables.deleteRow({
          databaseId: APPWRITE_DATABASE_ID,
          tableId,
          rowId: userId,
          transactionId: transaction.$id,
        });
      }
      await services.tables.updateTransaction({ transactionId: transaction.$id, commit: true });
    }
    dataDeleted = true;
    await services.users.delete({ userId });
    return new NextResponse(null, {
      status: 204,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (services && userId && !dataDeleted) {
      try { await services.users.updateStatus({ userId, status: true }); } catch { /* best effort */ }
    }
    const status = error instanceof AppwriteHttpError ? error.status : 502;
    return NextResponse.json(
      { error: status === 401 ? "Authentication required." : "Account deletion failed." },
      { status, headers: { "Cache-Control": "no-store" } },
    );
  }
}

function hasCode(error: unknown, code: number): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === code;
}
