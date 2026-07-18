import { NextResponse } from "next/server";
import { AppwriteHttpError, requireAppwriteUser } from "../../../lib/appwrite/auth";
import {
  assertValidProgressPayload,
  ensureLearnerProfile,
  mergeGuestAndSaveProgressRecord,
} from "../../../lib/appwrite/progress-store";
import { createAppwriteAdminServices } from "../../../lib/appwrite/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { userId } = await requireAppwriteUser(request);
    const services = createAppwriteAdminServices();
    if (!services) throw new AppwriteHttpError(503, "Cloud progress is unavailable.");
    const body: unknown = await request.json();
    const guest = assertValidProgressPayload(
      isObject(body) ? body.record : undefined,
    );
    const profile = await ensureLearnerProfile(services.tables, userId);
    const record = await mergeGuestAndSaveProgressRecord(services.tables, userId, guest);
    return NextResponse.json({ profile, record }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    const status = error instanceof AppwriteHttpError ? error.status : 400;
    return NextResponse.json(
      { error: status === 401 ? "Authentication required." : "Progress merge failed." },
      { status, headers: { "Cache-Control": "no-store" } },
    );
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
