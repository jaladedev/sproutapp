import api from "../utils/api";

/* ── Referrals ───────────────────────────────────────────────────────── */

export interface AdminReferralStats {
  [key: string]: unknown;
}

export async function getAdminReferralStats(): Promise<AdminReferralStats> {
  const res = await api.get("/admin/referrals/stats");
  return res.data.data;
}

export async function getAdminReferrals(status = "all"): Promise<unknown[]> {
  const res = await api.get(
    `/admin/referrals${status !== "all" ? `?status=${status}` : ""}`
  );
  return res.data.data?.data ?? res.data.data ?? [];
}

/* ── Users ───────────────────────────────────────────────────────────── */

export interface AdminUsersPage {
  [key: string]: unknown;
}

export async function getAdminUsers(params: string): Promise<AdminUsersPage> {
  const res = await api.get(`/admin/users?${params}`);
  return res.data;
}

export async function getAdminUser(userId: string | number): Promise<unknown> {
  const res = await api.get(`/admin/users/${userId}`);
  return res.data;
}

export type UserActionType =
  | "suspend"
  | "unsuspend"
  | "makeAdmin"
  | "removeAdmin"
  | "delete";

export interface UserActionResponse {
  message?: string;
  [key: string]: unknown;
}

/* Dispatches the moderation action for a user (suspend/unsuspend/
   make-admin/remove-admin/delete). */
export async function performUserAction(
  userId: string | number,
  action: UserActionType
): Promise<UserActionResponse> {
  const map: Record<UserActionType, ["patch" | "delete", string]> = {
    suspend: ["patch", `/admin/users/${userId}/suspend`],
    unsuspend: ["patch", `/admin/users/${userId}/unsuspend`],
    makeAdmin: ["patch", `/admin/users/${userId}/make-admin`],
    removeAdmin: ["patch", `/admin/users/${userId}/remove-admin`],
    delete: ["delete", `/admin/users/${userId}`],
  };
  const [method, url] = map[action];
  const res = await api[method](url);
  return res.data;
}

/* ── Waitlist ────────────────────────────────────────────────────────── */

export async function getWaitlistStats(): Promise<unknown> {
  const res = await api.get("/admin/waitlist/stats");
  return res.data;
}

export async function getWaitlist(params: string): Promise<unknown> {
  const res = await api.get(`/admin/waitlist?${params}`);
  return res.data;
}

export async function inviteWaitlistEntry(id: string | number): Promise<void> {
  await api.post(`/admin/waitlist/${id}/invite`);
}

export async function deleteWaitlistEntry(id: string | number): Promise<void> {
  await api.delete(`/admin/waitlist/${id}`);
}

/* ── Withdrawals ─────────────────────────────────────────────────────── */

export async function getAdminWithdrawals(params: string): Promise<unknown> {
  const res = await api.get(`/admin/withdrawals?${params}`);
  return res.data;
}

export async function approveWithdrawal(id: string | number): Promise<void> {
  await api.post(`/admin/withdrawals/${id}/approve`);
}

export async function rejectWithdrawal(
  id: string | number,
  reason: string
): Promise<void> {
  await api.post(`/admin/withdrawals/${id}/reject`, { reason });
}

export async function approveAllWithdrawals(): Promise<unknown> {
  const res = await api.post("/admin/withdrawals/approve-all");
  return res.data;
}
