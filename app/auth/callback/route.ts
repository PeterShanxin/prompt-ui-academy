import { NextResponse } from "next/server";
import { safeReturnPath } from "../../lib/auth-return";
import { createServerSupabaseClient } from "../../lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const returnTo = safeReturnPath(url.searchParams.get("next"));
  const code = url.searchParams.get("code");
  const client = await createServerSupabaseClient();

  const redirectWithStatus = (
    status: "unavailable" | "failed" | "success" | "canceled",
  ) => {
    const destination = new URL(returnTo, url.origin);
    destination.searchParams.set("auth", status);
    return NextResponse.redirect(destination);
  };

  if (url.searchParams.get("error") === "access_denied") {
    return redirectWithStatus("canceled");
  }
  if (!client) {
    return redirectWithStatus("unavailable");
  }
  if (!code) return redirectWithStatus("failed");

  const { error } = await client.auth.exchangeCodeForSession(code);
  return redirectWithStatus(error ? "failed" : "success");
}
