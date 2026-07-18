import { NextResponse } from "next/server";
import { communityBandForCount } from "../../lib/appwrite/progress-store";
import {
  APPWRITE_DATABASE_ID,
  APPWRITE_METRIC_ROW_ID,
  APPWRITE_METRICS_TABLE_ID,
  createAppwriteAdminServices,
} from "../../lib/appwrite/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const services = createAppwriteAdminServices();
  if (!services) {
    return NextResponse.json({ band: "founding" }, {
      headers: { "Cache-Control": "public, max-age=60" },
    });
  }
  try {
    const metric = await services.tables.getRow({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: APPWRITE_METRICS_TABLE_ID,
      rowId: APPWRITE_METRIC_ROW_ID,
    });
    const expected = communityBandForCount(Number(metric.cumulative_verified_accounts));
    if (metric.band_key !== expected) metric.band_key = expected;
    return NextResponse.json({ band: metric.band_key }, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch {
    return NextResponse.json({ band: "founding" }, {
      headers: { "Cache-Control": "public, max-age=60" },
    });
  }
}
