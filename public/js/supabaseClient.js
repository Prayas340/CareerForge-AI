/**
 * ============================================================================
 * SUPABASE CLIENT CONFIGURATION (Browser / Vanilla JS)
 * ============================================================================
 * Loaded via CDN (@supabase/supabase-js) or local bundle.
 * Configured with PKCE flow, persistent session, and auto token refresh.
 */

const SUPABASE_CONFIG = {
  url: 'https://kgvnmsnnxjdhmzfhtcoj.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtndm5tc25ueGpkaG16Zmh0Y29qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2NzE5MzMsImV4cCI6MjEwMzI0NzkzM30.mgc8QB3XaVzm7HOpsj8CEshA9PBhM7QHFLidinqltMI',
};

// Initialize Supabase Client
let supabaseClient = null;

if (typeof supabase !== 'undefined' && supabase.createClient) {
  supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
    auth: {
      flowType: 'pkce',
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storageKey: 'cf_auth_token_v1',
    },
  });
}

// Global export
window.supabaseClient = supabaseClient;
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
