import { NextResponse } from "next/server";
import { AppwriteHttpError, requireAppwriteUser } from "../../lib/appwrite/auth";
import {
  assertValidProgressPayload,
  ensureLearnerProfile,
  loadProgressRecord,
  reconcileAndSaveProgressRecord,
} from "../../lib/appwrite/progress-store";
import { createAppwriteAdminServices } from "../../lib/appwrite/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return handle(request, async (services, userId) => ({
    profile: await ensureLearnerProfile(services.tables, userId),
    record: await loadProgressRecord(services.tables, userId),
  }));
}

export async function PUT(request: Request) {
  return handle(request, async (services, userId) => {
    const body: unknown = await request.json();
    const submitted = assertValidProgressPayload(
      isObject(body) ? body.record : undefined,
    );
    const profile = await ensureLearnerProfile(services.tables, userId);
    const record = await reconcileAndSaveProgressRecord(services.tables, userId, submitted);
    return { profile, record };
  });
}

async function handle(
  request: Request,
  action: (
    services: NonNullable<ReturnType<typeof createAppwriteAdminServices>>,
    userId: string,
  ) => Promise<unknown>,
) {
  try {
    const { userId } = await requireAppwriteUser(request);
    const services = createAppwriteAdminServices();
    if (!services) throw new AppwriteHttpError(503, "Cloud progress is unavailable.");
    return NextResponse.json(await action(services, userId), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    const status = error instanceof AppwriteHttpError ? error.status : 400;
    return NextResponse.json(
      { error: status === 401 ? "Authentication required." : "Cloud progress request failed." },
      { status, headers: { "Cache-Control": "no-store" } },
    );
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
