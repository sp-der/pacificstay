export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

export function supabaseHeaders(accessToken?: string) {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    throw new Error("Supabase public environment variables are not configured.");
  }

  return {
    apikey: SUPABASE_PUBLISHABLE_KEY,
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}
