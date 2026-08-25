# Enterprise Supabase Authentication & PostgreSQL Security Architecture

## 1. Overview & Deployment Status
- **Project Name**: `job finder`
- **Project Ref**: `kgvnmsnnxjdhmzfhtcoj`
- **Status**: Live, Deployed & Verified on Supabase PostgreSQL Engine 17.6
- **Database Host**: `db.kgvnmsnnxjdhmzfhtcoj.supabase.co`
- **Region**: `ap-southeast-2`

---

## 2. Database Schema & Row-Level Security (RLS)

### `public.profiles` Table
| Column | Type | Nullable | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | PK | References `auth.users(id)` ON DELETE CASCADE |
| `email` | `TEXT` | No | - | User email address |
| `full_name` | `TEXT` | Yes | - | Display name extracted from metadata |
| `avatar_url` | `TEXT` | Yes | - | Profile picture URL |
| `role` | `TEXT` | No | `'user'` | `'user'`, `'admin'`, `'recruiter'` |
| `created_at` | `TIMESTAMPTZ`| No | `now()` | Account creation timestamp |
| `updated_at` | `TIMESTAMPTZ`| No | `now()` | Timestamp of last profile update |

### Active RLS Policies
1. **`Users can view own profile`** (`SELECT`): `auth.uid() = id`
2. **`Users can update own profile`** (`UPDATE`): `auth.uid() = id` with check `auth.uid() = id`
3. **`Users can insert own profile`** (`INSERT`): `auth.uid() = id`

### Automated Triggers & Functions
- **`on_auth_user_created`**: Executes `public.handle_new_user()` upon every new row inserted into `auth.users`, ensuring instant, non-blocking profile synchronization.
- **`on_profiles_updated`**: Executes `public.handle_updated_at()` to maintain accurate timestamps.
- **`public.is_mfa_verified()`**: SQL security definer checking if `(auth.jwt() ->> 'aal') = 'aal2'`.

---

## 3. Client Architecture & PKCE Flows

### Configuration (`src/lib/supabaseClient.ts` / `frontend/js/supabaseClient.js`)
- Enforces `flowType: 'pkce'` to protect against authorization code interception attacks.
- Configured with `autoRefreshToken: true` and `detectSessionInUrl: true` for password reset callbacks.

### Multi-Factor Authentication (MFA / TOTP)
- **Enrollment**: `supabase.auth.mfa.enroll({ factorType: 'totp', issuer: 'CareerForge AI' })`
- **Challenge & Verification**: `supabase.auth.mfa.challengeAndVerify({ factorId, code })`
- **AAL Guard**: Evaluates `supabase.auth.mfa.getAuthenticatorAssuranceLevel()`. If a user is at `aal1` but enrolled in `aal2`, requests the 6-digit TOTP code before granting full session access.

### Anti-Enumeration & Brute-Force Protections
- **Generic Error Responses**: Both client and server return `"Invalid email or password"` on any credential failure, mitigating timing attacks and user enumeration.
- **Client Rate Limiting**: Exponential cooldown and 60-second lockout after 5 consecutive failed attempts.

---

## 4. Production Security Checklist

- [x] **PostgreSQL RLS Active**: All tables in `public` have Row Level Security enabled.
- [x] **Cascading Foreign Keys**: `profiles.id` tied directly to `auth.users(id)` with `ON DELETE CASCADE`.
- [x] **Secure Trigger Functions**: `SECURITY DEFINER` functions specify `SET search_path = public` to prevent search path hijacking.
- [x] **PKCE Flow**: Client instances use PKCE authorization flow for all authentication requests.
- [x] **MFA AAL2 Enforcement**: Authenticator Assurance Levels (AAL) verified on high-security routes.
- [x] **Service Role Key Isolation**: `SUPABASE_SERVICE_ROLE_KEY` is kept server-only in `.env.supabase` and never bundled into client assets.
