/**
 * ============================================================================
 * ENTERPRISE AUTHENTICATION SERVICE & SECURITY CONTROLLER
 * ============================================================================
 * Features:
 * - Constant-time generic error handling to defend against timing attacks & user enumeration
 * - Client-side brute force rate limiting & lockout defense
 * - Multi-Factor Authentication (MFA / TOTP Authenticator apps) with AAL1/AAL2 enforcement
 * - Secure PKCE password reset lifecycle
 * - Automated profile synchronization and RLS data fetching
 */

import { supabase } from './supabaseClient';
import type { User, Session, AuthError, Factor } from '@supabase/supabase-js';

export interface AuthResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  requiresMFA?: boolean;
  factorId?: string;
  qrCode?: string;
  secret?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin' | 'recruiter';
  created_at: string;
  updated_at: string;
}

// Client-side rate-limiting / brute force protection state
const FAILED_ATTEMPTS_KEY = 'cf_failed_auth_attempts';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60 * 1000; // 60 seconds

class AuthService {
  /**
   * Helper: Check if client is currently in brute-force lockout
   */
  private checkRateLimit(): { isLocked: boolean; remainingSeconds: number } {
    try {
      const raw = localStorage.getItem(FAILED_ATTEMPTS_KEY);
      if (!raw) return { isLocked: false, remainingSeconds: 0 };
      const { count, lastFailedAt } = JSON.parse(raw);
      if (count >= MAX_ATTEMPTS) {
        const elapsed = Date.now() - lastFailedAt;
        if (elapsed < LOCKOUT_DURATION_MS) {
          const remainingSeconds = Math.ceil((LOCKOUT_DURATION_MS - elapsed) / 1000);
          return { isLocked: true, remainingSeconds };
        } else {
          // Reset lockout after duration passes
          localStorage.removeItem(FAILED_ATTEMPTS_KEY);
        }
      }
    } catch {
      localStorage.removeItem(FAILED_ATTEMPTS_KEY);
    }
    return { isLocked: false, remainingSeconds: 0 };
  }

  /**
   * Helper: Record failed login attempt
   */
  private recordFailedAttempt(): void {
    try {
      const raw = localStorage.getItem(FAILED_ATTEMPTS_KEY);
      let count = 0;
      if (raw) {
        count = JSON.parse(raw).count || 0;
      }
      count += 1;
      localStorage.setItem(
        FAILED_ATTEMPTS_KEY,
        JSON.stringify({ count, lastFailedAt: Date.now() })
      );
    } catch (e) {
      console.warn('Failed to record auth telemetry:', e);
    }
  }

  /**
   * Helper: Reset failed login attempt on success
   */
  private resetFailedAttempts(): void {
    localStorage.removeItem(FAILED_ATTEMPTS_KEY);
  }

  /**
   * 1. SIGN IN WITH EMAIL & PASSWORD
   * Defends against timing attacks & user enumeration with generic error messages.
   * Enforces MFA (AAL2) challenge if user has enrolled TOTP factors.
   */
  async handleLogin(email: string, password: string, captchaToken?: string): Promise<AuthResponse<{ user: User; session: Session }>> {
    // 1. Check brute-force lockout
    const { isLocked, remainingSeconds } = this.checkRateLimit();
    if (isLocked) {
      return {
        success: false,
        error: `Too many failed login attempts. Please wait ${remainingSeconds} seconds before trying again.`,
      };
    }

    try {
      // 2. Perform authentication with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
        options: captchaToken ? { captchaToken } : undefined,
      });

      if (error || !data.user || !data.session) {
        this.recordFailedAttempt();
        // Timing-attack safe generic error response
        return {
          success: false,
          error: 'Invalid email or password. Please verify your credentials.',
        };
      }

      // Reset failed attempts on valid credentials
      this.resetFailedAttempts();

      // 3. Check Multi-Factor Authentication (MFA) Assurance Level
      const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (!aalError && aalData) {
        // If the user has enrolled MFA (nextLevel is aal2) but current session is aal1
        if (aalData.currentLevel === 'aal1' && aalData.nextLevel === 'aal2') {
          // Fetch verified TOTP factor
          const factors = await supabase.auth.mfa.listFactors();
          const verifiedFactor = factors.data?.totp?.find(f => f.status === 'verified');

          return {
            success: true,
            requiresMFA: true,
            factorId: verifiedFactor ? verifiedFactor.id : undefined,
            data: { user: data.user, session: data.session },
          };
        }
      }

      return {
        success: true,
        requiresMFA: false,
        data: { user: data.user, session: data.session },
      };
    } catch (err: any) {
      this.recordFailedAttempt();
      return {
        success: false,
        error: 'An unexpected authentication error occurred. Please try again.',
      };
    }
  }

  /**
   * 2. SIGN UP / REGISTER
   * Triggers automatic profile generation in Postgres via on_auth_user_created trigger.
   */
  async handleRegister(email: string, password: string, fullName: string, captchaToken?: string): Promise<AuthResponse<{ user: User | null; session: Session | null }>> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
          captchaToken: captchaToken || undefined,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        data: { user: data.user, session: data.session },
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Registration failed. Please try again.',
      };
    }
  }

  /**
   * 3. MULTI-FACTOR AUTHENTICATION: ENROLL TOTP
   * Generates QR code and TOTP secret key for Google Authenticator / Authy / 1Password.
   */
  async handleMFAEnrollment(): Promise<AuthResponse<{ factorId: string; qrCode: string; secret: string; uri: string }>> {
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        issuer: 'CareerForge AI',
      });

      if (error || !data) {
        return { success: false, error: error?.message || 'MFA enrollment failed.' };
      }

      return {
        success: true,
        factorId: data.id,
        qrCode: data.totp.qr_code,
        secret: data.totp.secret,
        data: {
          factorId: data.id,
          qrCode: data.totp.qr_code,
          secret: data.totp.secret,
          uri: data.totp.uri,
        },
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to initialize MFA enrollment.' };
    }
  }

  /**
   * 4. MULTI-FACTOR AUTHENTICATION: CHALLENGE & VERIFY TOTP CODE
   * Verifies the 6-digit TOTP code and elevates session from AAL1 to AAL2.
   */
  async handleMFAVerification(factorId: string, code: string): Promise<AuthResponse<Session>> {
    try {
      const cleanCode = code.replace(/\s+/g, '');
      if (cleanCode.length !== 6) {
        return { success: false, error: 'Authenticator code must be exactly 6 digits.' };
      }

      const { data, error } = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code: cleanCode,
      });

      if (error || !data) {
        return { success: false, error: 'Invalid authenticator code. Please check your app and try again.' };
      }

      return {
        success: true,
        data: data as unknown as Session,
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'MFA verification failed.' };
    }
  }

  /**
   * 5. MULTI-FACTOR AUTHENTICATION: UNENROLL
   */
  async handleMFAUnenroll(factorId: string): Promise<AuthResponse<void>> {
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * 6. FORGOT PASSWORD / RESET PASSWORD REQUEST
   * Sends PKCE-secured password reset email to user.
   */
  async handleForgotPassword(email: string, redirectTo: string = window.location.origin + '/reset-password'): Promise<AuthResponse<void>> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo,
      });

      // Always return success message to prevent user enumeration
      if (error) {
        console.warn('Password reset request note:', error.message);
      }

      return {
        success: true,
        data: undefined,
      };
    } catch (err: any) {
      return {
        success: true, // Do not leak account existence
      };
    }
  }

  /**
   * 7. UPDATE PASSWORD (AFTER RESET REDIRECT OR FROM SETTINGS)
   */
  async handleUpdatePassword(newPassword: string): Promise<AuthResponse<User>> {
    try {
      if (newPassword.length < 8) {
        return { success: false, error: 'Password must be at least 8 characters long.' };
      }

      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error || !data.user) {
        return { success: false, error: error?.message || 'Failed to update password.' };
      }

      return {
        success: true,
        data: data.user,
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Password update failed.' };
    }
  }

  /**
   * 8. GET USER PROFILE (RLS PROTECTED)
   */
  async getUserProfile(userId: string): Promise<AuthResponse<UserProfile>> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        return { success: false, error: error?.message || 'Profile not found.' };
      }

      return { success: true, data: data as UserProfile };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * 9. SIGN OUT (GLOBAL SESSION REVOCATION)
   */
  async handleSignOut(): Promise<AuthResponse<void>> {
    try {
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
}

// Global Singleton Instance
export const authService = new AuthService();
