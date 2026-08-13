import api from "../utils/api";

export interface ReferralsDashboard {
  referrals?: unknown[];
  rewards?: unknown[];
  total_referrals?: number;
  [key: string]: unknown;
}

/* GET /referrals/dashboard */
export async function getReferralsDashboard(): Promise<ReferralsDashboard> {
  const res = await api.get("/referrals/dashboard");
  return res.data.data;
}

/* POST /referrals/rewards/:id/claim */
export async function claimReferralReward(rewardId: string | number): Promise<void> {
  await api.post(`/referrals/rewards/${rewardId}/claim`);
}
