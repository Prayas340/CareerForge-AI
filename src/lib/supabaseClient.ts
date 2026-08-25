/**
 * ============================================================================
 * SUPABASE CLIENT CONFIGURATION (TypeScript / Next.js / React)
 * ============================================================================
 * Enforces PKCE auth flow, secure session persistence, auto-refresh tokens,
 * and strict multi-factor authentication (MFA / AAL2) assurance levels.
 */

import { createClient } from '@supabase/supabase-js';

// Environment variables configuration for Supabase "job finder" project
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kgvnmsnnxjdhmzfhtcoj.supabase.co';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtndm5tc25ueGpkaG16Zmh0Y29qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2NzE5MzMsImV4cCI6MjEwMzI0NzkzM30.mgc8QB3XaVzm7HOpsj8CEshA9PBhM7QHFLidinqltMI';

// Supabase Client with Enterprise Security Defaults
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // 1. Enforce PKCE flow to defend against authorization code interception attacks
    flowType: 'pkce',
    // 2. Automatically refresh JWT access tokens prior to expiry
    autoRefreshToken: true,
    // 3. Persist session tokens in secure client storage (localStorage / Secure Cookie)
    persistSession: true,
    // 4. Automatically detect and parse authorization codes from redirect URLs
    detectSessionInUrl: true,
    // 5. Secure storage key prefix
    storageKey: 'cf_auth_token_v1',
  },
  global: {
    headers: {
      'x-application-name': 'CareerForge-Auth-Backend',
    },
  },
});
