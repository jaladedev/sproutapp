import api from "@/utils/api";

/**
 * GET /api/referrals/dashboard
 * Response: { success, data: {
 *   referral_code, referral_link,
 *   total_referrals, completed_referrals, pending_referrals,
 *   total_rewards_kobo, unclaimed_rewards_kobo,
 *   referrals: [...], rewards: [...]
 * }}
 */
export async function getReferralDashboard() {
  const res = await api.get("/referrals/dashboard");
  return res.data;
}

/**
 * GET /api/referrals/validate?code=XXX
 * Response: { success, data: { code, referrer_name } }
 */
export async function validateReferralCode(code) {
  const res = await api.get("/referrals/validate", { params: { code } });
  return res.data;
}

/**
 * POST /api/referrals/rewards/{id}/claim
 * Response: { success, message, data: reward }
 */
export async function claimReward(rewardId) {
  const res = await api.post(`/referrals/rewards/${rewardId}/claim`);
  return res.data;
}

/**
 * GET /api/referrals/rewards/available
 * Response: { success, data: [...unclaimed rewards] }
 */
export async function getAvailableRewards() {
  const res = await api.get("/referrals/rewards/available");
  return res.data;
}