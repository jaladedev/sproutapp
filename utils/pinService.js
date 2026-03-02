import api from "@/utils/api";

/**
 * POST /api/pin/set  (authenticated)
 * Body: { pin, pin_confirmation }
 * Only call this when user has NO pin set yet.
 */
export async function setPin({ pin, pin_confirmation }) {
  const res = await api.post("/pin/set", { pin, pin_confirmation });
  return res.data;
}

/**
 * POST /api/pin/update  (authenticated)
 * Body: { old_pin, new_pin, new_pin_confirmation }
 */
export async function updatePin({ old_pin, new_pin, new_pin_confirmation }) {
  const res = await api.post("/pin/update", { old_pin, new_pin, new_pin_confirmation });
  return res.data;
}

/**
 * POST /api/pin/forgot
 * Body: { email }
 * Sends a 6-digit OTP reset code to user's email.
 */
export async function forgotPin({ email }) {
  const res = await api.post("/pin/forgot", { email });
  return res.data;
}

/**
 * POST /api/pin/verify-code
 * Body: { email, code }
 */
export async function verifyPinCode({ email, code }) {
  const res = await api.post("/pin/verify-code", { email, code });
  return res.data;
}

/**
 * POST /api/pin/reset
 * Body: { email, code, new_pin, new_pin_confirmation }
 */
export async function resetPin({ email, code, new_pin, new_pin_confirmation }) {
  const res = await api.post("/pin/reset", {
    email,
    code,
    new_pin,
    new_pin_confirmation,
  });
  return res.data;
}