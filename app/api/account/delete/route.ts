import { NextResponse } from "next/server";
import { AppwriteHttpError, requireAppwriteUser } from "../../../lib/appwrite/auth";
import {
  deleteLearnerPrivateRows,
  ensureLearnerProfile,
  restoreLearnerPrivateRows,
  type LearnerPrivateRowsSnapshot,
} from "../../../lib/appwrite/progress-store";
import { createAppwriteAdminServices } from "../../../lib/appwrite/server";

export const dynamic = "force-dynamic";

export async function DELETE(request: Request) {
  let userId: string | null = null;
  let userDisabled = false;
  let userDeleted = false;
  let privateRowsDeleted = false;
  let privateRows: LearnerPrivateRowsSnapshot | null = null;
  const services = createAppwriteAdminServices();
  try {
    if (!services) throw new AppwriteHttpError(503, "Account deletion is unavailable.");
    userId = (await requireAppwriteUser(request)).userId;
    await ensureLearnerProfile(services.tables, userId);
    await services.users.updateStatus({ userId, status: false });
    userDisabled = true;
    privateRows = await deleteLearnerPrivateRows(services.tables, userId);
    privateRowsDeleted = true;
    try {
      await services.users.delete({ userId });
      userDeleted = true;
    } catch (error) {
      await restoreLearnerPrivateRows(services.tables, userId, privateRows);
      privateRowsDeleted = false;
      await services.users.updateStatus({ userId, status: true });
      userDisabled = false;
      throw error;
    }
    return new NextResponse(null, {
      status: 204,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (services && userId && userDisabled && !userDeleted) {
      if (privateRowsDeleted && privateRows) {
        try {
          await restoreLearnerPrivateRows(services.tables, userId, privateRows);
          privateRowsDeleted = false;
        } catch {
          // Keep the account disabled rather than re-enable it without its private data.
        }
      }
      if (!privateRowsDeleted) {
        try { await services.users.updateStatus({ userId, status: true }); } catch { /* best effort */ }
      }
    }
    const status = error instanceof AppwriteHttpError ? error.status : 502;
    return NextResponse.json(
      { error: status === 401 ? "Authentication required." : "Account deletion failed." },
      { status, headers: { "Cache-Control": "no-store" } },
    );
  }
}
