import api from "@/utils/api";

// ─── AI CHAT ──────────────────────────────────────────────────────────────────

/**
 * POST /api/support/chat  (authenticated)
 * Body: { messages: [{ role: 'user'|'assistant', content: string }] }
 * Response: { success, data: { reply: string } }
 */
export async function sendChatMessage(messages) {
  const res = await api.post("/support/chat", { messages });
  return res.data; // { success, data: { reply } }
}

// ─── TICKETS ──────────────────────────────────────────────────────────────────

/**
 * GET /api/support/tickets  (authenticated)
 * Response: { success, data: { data: [...tickets], ...pagination } }
 */
export async function getTickets() {
  const res = await api.get("/support/tickets");
  return res.data;
}

/**
 * POST /api/support/tickets  (authenticated)
 * Body: { subject, category, message, priority?, attachment? }
 * category: 'account'|'payment'|'kyc'|'investment'|'withdrawal'|'other'
 * Response: { success, message, data: ticket }
 */
export async function createTicket(formData) {
  const res = await api.post("/support/tickets", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

/**
 * GET /api/support/tickets/{id}  (authenticated)
 * Response: { success, data: ticket with messages }
 */
export async function getTicket(id) {
  const res = await api.get(`/support/tickets/${id}`);
  return res.data;
}

/**
 * POST /api/support/tickets/{id}/reply  (authenticated)
 * Body: { message, attachment? }
 * Response: { success, message, data: message }
 */
export async function replyToTicket(id, formData) {
  const res = await api.post(`/support/tickets/${id}/reply`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

/**
 * POST /api/support/tickets/guest  (no auth)
 * Body: { name, email, subject, category, message, attachment? }
 * Response: { success, message, reference }
 */
export async function createGuestTicket(formData) {
  const res = await api.post("/support/tickets/guest", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

/**
 * GET /api/support/faqs  (public)
 * Response: { success, data: { category: [...faqs] } }
 */
export async function getFaqs() {
  const res = await api.get("/support/faqs");
  return res.data;
}