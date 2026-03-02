import api from "@/utils/api";

/**
 * GET /api/notifications
 * Response: { notifications: [...] }
 */
export async function getNotifications() {
  const res = await api.get("/notifications");
  return res.data; // { notifications: [...] }
}

/**
 * GET /api/notifications/unread
 * Response: { unread_notifications: [...] }
 */
export async function getUnreadNotifications() {
  const res = await api.get("/notifications/unread");
  return res.data; // { unread_notifications: [...] }
}

/**
 * POST /api/notifications/read
 * Marks ALL notifications as read.
 */
export async function markAllNotificationsRead() {
  const res = await api.post("/notifications/read");
  return res.data;
}