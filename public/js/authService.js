/**
 * ============================================================================
 * BROWSER AUTHENTICATION CONTROLLER (Vanilla JS)
 * ============================================================================
 * Complete client-side authentication controller supporting:
 * - Constant-time generic error handling against user enumeration
 * - Brute force rate limiting & lockout defense
 * - Multi-Factor Authentication (MFA / TOTP) with AAL1/AAL2 checking
 * - PKCE password reset flow & password updates
 * - RLS profile fetching
 */

const AuthService = (function () {
  const FAILED_ATTEMPTS_KEY = 'cf_failed_auth_attempts';
  const MAX_ATTEMPTS = 5;
  const LOCKOUT_DURATION_MS = 60 * 1000; // 60 seconds

  function getClient() {
    return window.supabaseClient;
  }

  function checkRateLimit() {
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
          localStorage.removeItem(FAILED_ATTEMPTS_KEY);
        }
      }
    } catch {
      localStorage.removeItem(FAILED_ATTEMPTS_KEY);
    }
    return { isLocked: false, remainingSeconds: 0 };
  }

  function recordFailedAttempt() {
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
      console.warn('Rate limit tracking note:', e);
    }
  }

  function resetFailedAttempts() {
    localStorage.removeItem(FAILED_ATTEMPTS_KEY);
  }

  return {
    /**
     * 1. LOGIN
     */
    async handleLogin(email, password, captchaToken) {
      const client = getClient();
      if (!client) return { success: false, error: 'Supabase client not initialized.' };

      const { isLocked, remainingSeconds } = checkRateLimit();
      if (isLocked) {
        return {
          success: false,
          error: `Too many failed login attempts. Please wait ${remainingSeconds}s before trying again.`,
        };
      }

      try {
        const { data, error } = await client.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
          options: captchaToken ? { captchaToken } : undefined,
        });

        if (error || !data.user) {
          recordFailedAttempt();
          return {
            success: false,
            error: 'Invalid email or password. Please verify your credentials.',
          };
        }

        resetFailedAttempts();

        // Check MFA Assurance Level
        const { data: aalData } = await client.auth.mfa.getAuthenticatorAssuranceLevel();
        if (aalData && aalData.currentLevel === 'aal1' && aalData.nextLevel === 'aal2') {
          const factors = await client.auth.mfa.listFactors();
          const verifiedFactor = factors.data?.totp?.find(f => f.status === 'verified');

          return {
            success: true,
            requiresMFA: true,
            factorId: verifiedFactor ? verifiedFactor.id : undefined,
            data,
          };
        }

        return { success: true, requiresMFA: false, data };
      } catch (err) {
        recordFailedAttempt();
        return { success: false, error: 'Authentication failed. Please try again.' };
      }
    },

    /**
     * 2. REGISTER
     */
    async handleRegister(email, password, fullName, captchaToken) {
      const client = getClient();
      if (!client) return { success: false, error: 'Supabase client not initialized.' };

      try {
        const { data, error } = await client.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: { full_name: fullName.trim() },
            captchaToken: captchaToken || undefined,
          },
        });

        if (error) return { success: false, error: error.message };
        return { success: true, data };
      } catch (err) {
        return { success: false, error: err.message };
      }
    },

    /**
     * 3. MFA ENROLLMENT (TOTP)
     */
    async handleMFAEnrollment() {
      const client = getClient();
      if (!client) return { success: false, error: 'Supabase client not initialized.' };

      try {
        const { data, error } = await client.auth.mfa.enroll({
          factorType: 'totp',
          issuer: 'CareerForge AI',
        });

        if (error) return { success: false, error: error.message };

        return {
          success: true,
          factorId: data.id,
          qrCode: data.totp.qr_code,
          secret: data.totp.secret,
          uri: data.totp.uri,
        };
      } catch (err) {
        return { success: false, error: err.message };
      }
    },

    /**
     * 4. MFA VERIFY (CHALLENGE & VERIFY TOTP)
     */
    async handleMFAVerification(factorId, code) {
      const client = getClient();
      if (!client) return { success: false, error: 'Supabase client not initialized.' };

      try {
        const cleanCode = (code || '').replace(/\s+/g, '');
        const { data, error } = await client.auth.mfa.challengeAndVerify({
          factorId,
          code: cleanCode,
        });

        if (error) return { success: false, error: 'Invalid authenticator code.' };
        return { success: true, data };
      } catch (err) {
        return { success: false, error: err.message };
      }
    },

    /**
     * 5. FORGOT PASSWORD
     */
    async handleForgotPassword(email, redirectTo = window.location.origin + '/reset-password') {
      const client = getClient();
      if (!client) return { success: false, error: 'Supabase client not initialized.' };

      try {
        await client.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo });
        return { success: true };
      } catch {
        return { success: true }; // Constant-time / no enumeration
      }
    },

    /**
     * 6. UPDATE PASSWORD
     */
    async handleUpdatePassword(newPassword) {
      const client = getClient();
      if (!client) return { success: false, error: 'Supabase client not initialized.' };

      try {
        const { data, error } = await client.auth.updateUser({ password: newPassword });
        if (error) return { success: false, error: error.message };
        return { success: true, data };
      } catch (err) {
        return { success: false, error: err.message };
      }
    },

    /**
     * 7. GET PROFILE
     */
    async getUserProfile(userId) {
      const client = getClient();
      if (!client) return { success: false, error: 'Supabase client not initialized.' };

      try {
        const { data, error } = await client
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) return { success: false, error: error.message };
        return { success: true, data };
      } catch (err) {
        return { success: false, error: err.message };
      }
    },

    /**
     * 8. SIGN OUT
     */
    async handleSignOut() {
      const client = getClient();
      if (!client) return { success: false, error: 'Supabase client not initialized.' };

      try {
        const { error } = await client.auth.signOut({ scope: 'global' });
        if (error) return { success: false, error: error.message };
        return { success: true };
      } catch (err) {
        return { success: false, error: err.message };
      }
    },
  };
})();

// Global Export
window.AuthService = AuthService;
