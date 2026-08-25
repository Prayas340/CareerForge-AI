/**
 * ============================================================================
 * AUTHENTICATION UI & MODAL CONTROLLER
 * ============================================================================
 * Handles Sign In, Register, MFA Challenge, MFA Setup, Password Reset,
 * and Top Navbar UI synchronization with Supabase.
 */

let activeAuthTab = 'login';
let currentMfaFactorId = null;

document.addEventListener('DOMContentLoaded', () => {
  initAuthUI();
});

function initAuthUI() {
  // 1. Listen for Supabase session changes
  if (window.supabaseClient) {
    window.supabaseClient.auth.getSession().then(({ data: { session } }) => {
      updateNavbarAuthState(session?.user || null);
    });

    window.supabaseClient.auth.onAuthStateChange((event, session) => {
      updateNavbarAuthState(session?.user || null);
    });
  }

  // 2. Close dropdown on outside click
  document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('user-dropdown-menu');
    const profileBtn = document.getElementById('user-profile-btn');
    if (dropdown && !dropdown.classList.contains('hidden')) {
      if (!profileBtn.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add('hidden');
      }
    }
  });
}

function updateNavbarAuthState(user) {
  const loggedOutArea = document.getElementById('auth-logged-out');
  const loggedInArea = document.getElementById('auth-logged-in');

  if (!loggedOutArea || !loggedInArea) return;

  if (user) {
    loggedOutArea.classList.add('hidden');
    loggedInArea.classList.remove('hidden');

    const fullName = user.user_metadata?.full_name || user.email.split('@')[0];
    const initial = fullName.charAt(0).toUpperCase();

    const avatarElem = document.getElementById('nav-user-avatar');
    const nameElem = document.getElementById('nav-user-name');
    const dropdownNameElem = document.getElementById('dropdown-user-name');
    const dropdownEmailElem = document.getElementById('dropdown-user-email');

    if (avatarElem) avatarElem.innerText = initial;
    if (nameElem) nameElem.innerText = fullName;
    if (dropdownNameElem) dropdownNameElem.innerText = fullName;
    if (dropdownEmailElem) dropdownEmailElem.innerText = user.email;

    // Check MFA status
    if (window.supabaseClient) {
      window.supabaseClient.auth.mfa.getAuthenticatorAssuranceLevel().then(({ data }) => {
        const mfaBadge = document.getElementById('dropdown-mfa-badge');
        if (mfaBadge && data) {
          if (data.currentLevel === 'aal2') {
            mfaBadge.innerText = '🛡️ MFA Active (AAL2)';
            mfaBadge.className = 'px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold';
          } else if (data.nextLevel === 'aal2') {
            mfaBadge.innerText = '⚠️ MFA Enrolled (AAL1)';
            mfaBadge.className = 'px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold';
          } else {
            mfaBadge.innerText = 'MFA: Disabled';
            mfaBadge.className = 'px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-[10px] font-bold';
          }
        }
      });
    }
  } else {
    loggedOutArea.classList.remove('hidden');
    loggedInArea.classList.add('hidden');
  }
}

function toggleUserDropdown() {
  const dropdown = document.getElementById('user-dropdown-menu');
  if (dropdown) {
    dropdown.classList.toggle('hidden');
  }
}

function openAuthModal(tab = 'login') {
  const modal = document.getElementById('auth-modal');
  if (!modal) return;

  modal.classList.remove('hidden');
  switchAuthTab(tab);
}

function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

function switchAuthTab(tabName) {
  activeAuthTab = tabName;

  const tabContents = document.querySelectorAll('.auth-tab-content');
  tabContents.forEach(el => el.classList.add('hidden'));

  const activeContent = document.getElementById(`auth-tab-${tabName}`);
  if (activeContent) {
    activeContent.classList.remove('hidden');
  }

  // Highlight tab buttons if applicable
  const tabBtns = document.querySelectorAll('.auth-nav-tab');
  tabBtns.forEach(btn => {
    if (btn.getAttribute('data-tab') === tabName) {
      btn.classList.add('border-b-2', 'border-primary', 'text-primary', 'font-bold');
      btn.classList.remove('text-on-surface-variant');
    } else {
      btn.classList.remove('border-b-2', 'border-primary', 'text-primary', 'font-bold');
      btn.classList.add('text-on-surface-variant');
    }
  });

  // If opening MFA setup tab, auto-generate QR code
  if (tabName === 'mfa-setup') {
    startMfaEnrollmentUI();
  }
}

// 1. Submit Sign In
async function submitSignIn(e) {
  if (e) e.preventDefault();
  const email = document.getElementById('login-email')?.value;
  const password = document.getElementById('login-password')?.value;
  const errElem = document.getElementById('login-error');
  const btn = document.getElementById('login-btn');

  if (errElem) errElem.innerText = '';
  if (btn) btn.disabled = true;

  try {
    const res = await window.AuthService.handleLogin(email, password);
    if (!res.success) {
      if (errElem) errElem.innerText = res.error || 'Invalid credentials.';
      return;
    }

    // Check if MFA is required
    if (res.requiresMFA) {
      currentMfaFactorId = res.factorId;
      switchAuthTab('mfa-challenge');
      showNotification('Multi-factor challenge required. Enter your 6-digit code.', 'info');
      return;
    }

    closeAuthModal();
    showNotification('Signed in successfully!', 'success');
  } catch (err) {
    if (errElem) errElem.innerText = err.message || 'Login error.';
  } finally {
    if (btn) btn.disabled = false;
  }
}

// 2. Submit Register
async function submitRegister(e) {
  if (e) e.preventDefault();
  const name = document.getElementById('register-name')?.value;
  const email = document.getElementById('register-email')?.value;
  const password = document.getElementById('register-password')?.value;
  const errElem = document.getElementById('register-error');
  const btn = document.getElementById('register-btn');

  if (errElem) errElem.innerText = '';
  if (btn) btn.disabled = true;

  try {
    const res = await window.AuthService.handleRegister(email, password, name);
    if (!res.success) {
      if (errElem) errElem.innerText = res.error || 'Registration failed.';
      return;
    }

    closeAuthModal();
    showNotification('Account created successfully! Welcome to CareerForge AI.', 'success');
  } catch (err) {
    if (errElem) errElem.innerText = err.message || 'Registration error.';
  } finally {
    if (btn) btn.disabled = false;
  }
}

// 3. Submit MFA Verification Challenge
async function submitMfaChallenge(e) {
  if (e) e.preventDefault();
  const code = document.getElementById('mfa-challenge-code')?.value;
  const errElem = document.getElementById('mfa-challenge-error');
  const btn = document.getElementById('mfa-challenge-btn');

  if (errElem) errElem.innerText = '';
  if (btn) btn.disabled = true;

  try {
    const res = await window.AuthService.handleMFAVerification(currentMfaFactorId, code);
    if (!res.success) {
      if (errElem) errElem.innerText = res.error || 'Invalid authenticator code.';
      return;
    }

    closeAuthModal();
    showNotification('MFA verified successfully! High security session granted (AAL2).', 'success');
  } catch (err) {
    if (errElem) errElem.innerText = err.message;
  } finally {
    if (btn) btn.disabled = false;
  }
}

// 4. Start MFA Setup (Enrollment)
async function startMfaEnrollmentUI() {
  const qrContainer = document.getElementById('mfa-qr-container');
  const secretElem = document.getElementById('mfa-secret-key');
  const loadingElem = document.getElementById('mfa-setup-loading');

  if (loadingElem) loadingElem.classList.remove('hidden');
  if (qrContainer) qrContainer.innerHTML = '';

  try {
    const res = await window.AuthService.handleMFAEnrollment();
    if (res.success) {
      currentMfaFactorId = res.factorId;
      if (qrContainer && res.qrCode) {
        qrContainer.innerHTML = `<img src="${res.qrCode}" class="w-44 h-44 border border-outline-variant/30 rounded-xl p-2 bg-white" alt="MFA QR Code" />`;
      }
      if (secretElem) {
        secretElem.innerText = res.secret || '';
      }
    }
  } catch (err) {
    showNotification(`MFA setup error: ${err.message}`, 'error');
  } finally {
    if (loadingElem) loadingElem.classList.add('hidden');
  }
}

// 5. Confirm MFA Setup
async function submitMfaSetupConfirm(e) {
  if (e) e.preventDefault();
  const code = document.getElementById('mfa-setup-code')?.value;
  const errElem = document.getElementById('mfa-setup-error');

  try {
    const res = await window.AuthService.handleMFAVerification(currentMfaFactorId, code);
    if (!res.success) {
      if (errElem) errElem.innerText = res.error || 'Invalid code.';
      return;
    }

    closeAuthModal();
    showNotification('MFA Authenticator enrolled and verified! Your account is now secured with AAL2.', 'success');
  } catch (err) {
    if (errElem) errElem.innerText = err.message;
  }
}

// 6. Submit Forgot Password
async function submitForgotPassword(e) {
  if (e) e.preventDefault();
  const email = document.getElementById('forgot-email')?.value;
  const msgElem = document.getElementById('forgot-msg');

  try {
    await window.AuthService.handleForgotPassword(email);
    if (msgElem) {
      msgElem.innerText = 'If an account exists, a secure reset link has been dispatched to your inbox.';
      msgElem.className = 'text-xs text-primary font-semibold';
    }
  } catch (err) {
    if (msgElem) msgElem.innerText = 'Request processed.';
  }
}

// 7. Handle Sign Out Click
async function handleSignOutClick() {
  toggleUserDropdown();
  await window.AuthService.handleSignOut();
  showNotification('Signed out safely.', 'info');
}
