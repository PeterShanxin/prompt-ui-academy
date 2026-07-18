import { createAppwriteJwtAccount } from "./server";

export class AppwriteHttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function requireAppwriteUser(request: Request) {
  const token = request.headers.get("authorization")?.match(/^Bearer (.+)$/i)?.[1];
  if (!token) throw new AppwriteHttpError(401, "Authentication required.");

  const account = createAppwriteJwtAccount(token);
  if (!account) throw new AppwriteHttpError(503, "Cloud progress is unavailable.");
  try {
    const user = await account.get();
    return { userId: user.$id };
  } catch {
    throw new AppwriteHttpError(401, "Authentication required.");
  }
}
