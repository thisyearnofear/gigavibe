import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use environment variables with fallbacks to hardcoded values for development
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://raeateoobiztkzpppvas.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhZWF0ZW9vYml6dGt6cHBwdmFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMjI2MDksImV4cCI6MjA2NTU5ODYwOX0.6X2-4MY0RqH9qV8dGbdij2Mx1u1MUwP2E29rjXZbc-w";

// For server-side operations, prefer service role key if available
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Use service role key on server-side when available, otherwise use anon key
const supabaseKey = (typeof window === 'undefined' && SUPABASE_SERVICE_KEY) 
  ? SUPABASE_SERVICE_KEY 
  : SUPABASE_ANON_KEY;

if (!SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseKey) {
  throw new Error('Missing Supabase key - set either NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY');
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, supabaseKey, {
  auth: {
    // Persist session only on client-side
    persistSession: typeof window !== 'undefined',
    // Auto refresh tokens
    autoRefreshToken: typeof window !== 'undefined',
  },
});