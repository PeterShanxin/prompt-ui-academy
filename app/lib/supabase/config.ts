export type PublicSupabaseConfig = {
  url: string;
  publishableKey: string;
};

export function getPublicSupabaseConfig(): PublicSupabaseConfig | null {
  if (process.env.NEXT_PUBLIC_CLOUD_PROGRESS_ENABLED !== "true") return null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) return null;

  return { url, publishableKey };
}

export function isCloudProgressEnabled(): boolean {
  return getPublicSupabaseConfig() !== null;
}
