import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Let Supabase use its default flow (PKCE in v2.x) — do NOT override flowType.
    // The server decides the flow; the client must match.
    // detectSessionInUrl handles both implicit (#access_token) and PKCE (?code=) callbacks.
    detectSessionInUrl: true,
    // Persist session in localStorage so users stay logged in across page refreshes
    persistSession: true,
    // Automatically refresh token before it expires
    autoRefreshToken: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});
