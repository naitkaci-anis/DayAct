// Central place to read Supabase env vars and know whether it's configured.
// When NOT configured, the app falls back to localStorage and skips auth —
// so the demo keeps working before any Supabase setup.

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
