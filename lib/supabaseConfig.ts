export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://jujenvaofyrwbyunqtya.supabase.co";

export const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  "sb_publishable_StZX7ATqK5m-zCswk8vPDg_TOHzkHff";

export function supabaseHeaders(accessToken?: string) {
  return {
    apikey: SUPABASE_PUBLISHABLE_KEY,
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}
