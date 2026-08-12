import api from "../utils/api";

export interface ChatMessage {
  role: "user" | "assistant" | string;
  content: string;
  [key: string]: unknown;
}

export interface SupportTicket {
  id: string | number;
  subject: string;
  category: string;
  priority: string;
  status?: string;
  [key: string]: unknown;
}

export type TicketPriority = "low" | "normal" | "high" | string;

export interface CreateTicketInput {
  subject: string;
  category: string;
  message: string;
  priority?: TicketPriority;
  attachment?: File | null;
}

export interface ReplyToTicketInput {
  message: string;
  attachment?: File | null;
}

export interface CreateGuestTicketInput {
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
  attachment?: File | null;
}

export interface CreateGuestTicketResponse {
  success: boolean;
  message?: string;
  reference: string;
}

export interface FaqGroups {
  account?: unknown[];
  payment?: unknown[];
  [category: string]: unknown[] | undefined;
}

// ── AI Chat (auth required) ───────────────────────────────────────────────────
export async function sendChatMessage(messages: ChatMessage[]): Promise<string> {
  const res = await api.post("/support/chat", { messages });
  return res.data.data.reply;
}

// ── Tickets (auth required) ───────────────────────────────────────────────────
export async function fetchTickets(page = 1): Promise<SupportTicket[]> {
  const res = await api.get(`/support/tickets?page=${page}`);
  return res.data.data;
}

export async function fetchTicket(id: string | number): Promise<SupportTicket> {
  const res = await api.get(`/support/tickets/${id}`);
  return res.data.data;
}

export async function createTicket({
  subject,
  category,
  message,
  priority = "normal",
  attachment,
}: CreateTicketInput): Promise<SupportTicket> {
  const form = new FormData();
  form.append("subject", subject);
  form.append("category", category);
  form.append("message", message);
  form.append("priority", priority);
  if (attachment) form.append("attachment", attachment);

  const res = await api.post("/support/tickets", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
}

export async function replyToTicket(
  id: string | number,
  { message, attachment }: ReplyToTicketInput
): Promise<SupportTicket> {
  const form = new FormData();
  form.append("message", message);
  if (attachment) form.append("attachment", attachment);

  const res = await api.post(`/support/tickets/${id}/reply`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
}

// ── Guest ticket (no auth) ────────────────────────────────────────────────────
// Returns { reference } so the guest can quote it in follow-ups
export async function createGuestTicket({
  name,
  email,
  subject,
  category,
  message,
  attachment,
}: CreateGuestTicketInput): Promise<CreateGuestTicketResponse> {
  const form = new FormData();
  form.append("name", name);
  form.append("email", email);
  form.append("subject", subject);
  form.append("category", category);
  form.append("message", message);
  if (attachment) form.append("attachment", attachment);

  const res = await api.post("/support/tickets/guest", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  // { success, message, reference }
  return res.data;
}

// ── FAQs (public) ─────────────────────────────────────────────────────────────
export async function fetchFaqs(): Promise<FaqGroups> {
  const res = await api.get("/support/faqs");
  return res.data.data; // { account: [...], payment: [...], ... }
}