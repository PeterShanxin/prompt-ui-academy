const reservedPaths = new Set([
  "/auth/callback",
  "/signin-with-chatgpt",
  "/signout-with-chatgpt",
  "/callback",
]);

export function safeReturnPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/learn";
  }

  try {
    const url = new URL(value, "https://app.local");
    if (
      url.origin !== "https://app.local" ||
      reservedPaths.has(url.pathname) ||
      url.pathname.startsWith("/auth/")
    ) {
      return "/learn";
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/learn";
  }
}
