import api from "@/utils/api";

/**
 * GET /api/kyc/status
 * Response: { success, data: { status, is_verified, submission_date?, verified_at?, rejection_reason? } }
 * status: 'not_submitted' | 'pending' | 'approved' | 'rejected' | 'resubmit'
 */
export async function getKycStatus() {
  const res = await api.get("/kyc/status");
  return res.data; // { success, data: {...} }
}

/**
 * POST /api/kyc/submit  (multipart/form-data)
 * Fields:
 *   full_name, date_of_birth (YYYY-MM-DD), phone_number,
 *   address, city, state, country (optional, defaults Nigeria),
 *   id_type: 'nin'|'drivers_license'|'voters_card'|'passport'|'bvn',
 *   id_number, id_front (File), id_back (File, optional), selfie (File)
 *
 * Response: { success, message, data: { status, submitted_at } }
 */
export async function submitKyc(formData) {
  const res = await api.post("/kyc/submit", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}