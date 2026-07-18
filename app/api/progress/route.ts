import { NextResponse } from "next/server";
import { AppwriteHttpError, requireAppwriteUser } from "../../lib/appwrite/auth";
import {
  assertValidProgressPayload,
  ensureLearnerProfile,
  loadProgressRecord,
  saveProgressRecord,
} from "../../lib/appwrite/progress-store";
import { createAppwriteAdminServices } from "../../lib/appwrite/server";
import { getBestQuizScore, setProgressItem } from "../../lib/learning-progress";

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
    const existing = await loadProgressRecord(services.tables, userId);
    const existingBest = getBestQuizScore(existing);
    const submittedBest = getBestQuizScore(submitted);
    const canonical = existingBest !== null && (submittedBest ?? -1) < existingBest
      ? setProgressItem(submitted, {
          kind: "quiz",
          itemId: "ui-vocabulary-v1",
          completed: true,
          bestScore: Math.max(existingBest, submittedBest ?? 0),
          updatedAt: new Date().toISOString(),
        })
      : submitted;
    const profile = await ensureLearnerProfile(services.tables, userId);
    const record = await saveProgressRecord(services.tables, userId, canonical);
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
