export type PublicAppwriteConfig = {
  endpoint: string;
  projectId: string;
};

export function getPublicAppwriteConfig(): PublicAppwriteConfig | null {
  if (process.env.NEXT_PUBLIC_CLOUD_PROGRESS_ENABLED !== "true") return null;

  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT?.replace(/\/$/, "");
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  if (!endpoint || !projectId) return null;

  return { endpoint, projectId };
}

export function isCloudProgressEnabled(): boolean {
  return getPublicAppwriteConfig() !== null;
}
