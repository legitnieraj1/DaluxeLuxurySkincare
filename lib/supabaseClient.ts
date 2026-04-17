import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Use implicit flow for hash-based OAuth redirects (#access_token=...)
    flowType: 'implicit',
    // Automatically read #access_token / ?code= from the URL after OAuth redirect
    detectSessionInUrl: true,
    // Persist session in localStorage so users stay logged in across page refreshes
    persistSession: true,
    // Automatically refresh token before it expires
    autoRefreshToken: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});

