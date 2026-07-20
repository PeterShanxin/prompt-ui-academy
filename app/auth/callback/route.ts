import { NextResponse } from "next/server";
import { safeReturnPath } from "../../lib/auth-return";

export function GET(request: Request) {
  const url = new URL(request.url);
  const destination = new URL(safeReturnPath(url.searchParams.get("next")), url.origin);
  const status = url.searchParams.get("status");
  destination.searchParams.set("auth", status === "success" ? "success" : "failed");
  return NextResponse.redirect(destination);
}
