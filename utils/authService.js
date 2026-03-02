import api from "@/utils/api";

/**
 * POST /api/register
 * Body: { name, email, password, password_confirmation, referral_code? }
 * Response: { message, data: { user, token } }
 */
export async function register({ name, email, password, password_confirmation, referral_code }) {
  const payload = { name, email, password, password_confirmation };
  if (referral_code) payload.referral_code = referral_code;
  const res = await api.post("/register", payload);
  return res.data; // { message, data: { user, token } }
}

/**
 * POST /api/login
 * Body: { email, password }
 * Response: { message, data: { token } }
 */
export async function login({ email, password }) {
  const res = await api.post("/login", { email, password });
  return res.data; // { message, data: { token } }
}

/**
 * POST /api/logout
 */
export async function logout() {
  const res = await api.post("/logout");
  return res.data;
}

/**
 * GET /api/me
 * Response: { success, user: { ... full user object ... } }
 */
export async function getMe() {
  const res = await api.get("/me");
  return res.data; // { success, user }
}

/**
 * POST /api/email/verify/code
 * Body: { email, verification_code }
 */
export async function verifyEmail({ email, verification_code }) {
  const res = await api.post("/email/verify/code", { email, verification_code });
  return res.data;
}

/**
 * POST /api/email/resend-verification
 * Body: { email }
 */
export async function resendVerification({ email }) {
  const res = await api.post("/email/resend-verification", { email });
  return res.data;
}

/**
 * POST /api/password/reset/code
 * Body: { email }
 */
export async function sendPasswordResetCode({ email }) {
  const res = await api.post("/password/reset/code", { email });
  return res.data;
}

/**
 * POST /api/password/reset/verify
 * Body: { email, reset_code }
 */
export async function verifyPasswordResetCode({ email, reset_code }) {
  const res = await api.post("/password/reset/verify", { email, reset_code });
  return res.data;
}

/**
 * POST /api/password/reset
 * Body: { email, reset_code, password, password_confirmation }
 */
export async function resetPassword({ email, reset_code, password, password_confirmation }) {
  const res = await api.post("/password/reset", {
    email,
    reset_code,
    password,
    password_confirmation,
  });
  return res.data;
}

/**
 * POST /api/user/change-password  (authenticated)
 * Body: { current_password, new_password, new_password_confirmation }
 */
export async function changePassword({ current_password, new_password, new_password_confirmation }) {
  const res = await api.post("/user/change-password", {
    current_password,
    new_password,
    new_password_confirmation,
  });
  return res.data;
}