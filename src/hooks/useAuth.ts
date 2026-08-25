/**
 * ============================================================================
 * REACT / NEXT.JS AUTHENTICATION HOOK (useAuth.ts)
 * ============================================================================
 * Manages user session state, AAL2 MFA transitions, profile caching, and sign-out.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { authService, UserProfile, AuthResponse } from '../lib/authService';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isMFAEnrolled: boolean;
  currentAAL: 'aal1' | 'aal2' | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
    isMFAEnrolled: false,
    currentAAL: null,
  });

  // Refresh profile & MFA factors
  const refreshUserData = useCallback(async (user: User | null) => {
    if (!user) {
      setAuthState({
        user: null,
        session: null,
        profile: null,
        loading: false,
        isMFAEnrolled: false,
        currentAAL: null,
      });
      return;
    }

    try {
      // 1. Fetch Profile
      const profileRes = await authService.getUserProfile(user.id);
      
      // 2. Fetch MFA Assurance Level & Factors
      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      const { data: factorData } = await supabase.auth.mfa.listFactors();
      const hasVerifiedMFA = factorData?.totp?.some(f => f.status === 'verified') || false;

      setAuthState(prev => ({
        ...prev,
        user,
        profile: profileRes.success ? profileRes.data || null : null,
        isMFAEnrolled: hasVerifiedMFA,
        currentAAL: (aalData?.currentLevel as 'aal1' | 'aal2') || 'aal1',
        loading: false,
      }));
    } catch (e) {
      console.warn('Error refreshing user telemetry:', e);
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState(prev => ({ ...prev, session }));
      refreshUserData(session?.user || null);
    });

    // 2. Listen to Auth State Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setAuthState(prev => ({ ...prev, session }));
        await refreshUserData(session?.user || null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [refreshUserData]);

  return {
    ...authState,
    login: authService.handleLogin.bind(authService),
    register: authService.handleRegister.bind(authService),
    enrollMFA: authService.handleMFAEnrollment.bind(authService),
    verifyMFA: authService.handleMFAVerification.bind(authService),
    unenrollMFA: authService.handleMFAUnenroll.bind(authService),
    forgotPassword: authService.handleForgotPassword.bind(authService),
    updatePassword: authService.handleUpdatePassword.bind(authService),
    signOut: authService.handleSignOut.bind(authService),
    refresh: () => refreshUserData(authState.user),
  };
}
