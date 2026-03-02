import api from "@/utils/api";

// ─── DEPOSITS ─────────────────────────────────────────────────────────────────

/**
 * POST /api/deposit
 * Body: { amount (kobo), gateway: 'paystack'|'monnify' }
 * Response: { payment_url, reference, gateway, transaction_fee, total_amount }
 *
 * NOTE: amount must be sent in KOBO (e.g. ₦1000 = 100000)
 */
export async function initiateDeposit({ amount_kobo, gateway = "paystack" }) {
  const res = await api.post("/deposit", {
    amount: amount_kobo,
    gateway,
  });
  return res.data;
}

/**
 * GET /api/deposit/verify/{reference}
 * Response: { reference, gateway, status, amount }
 */
export async function verifyDeposit(reference) {
  const res = await api.get(`/deposit/verify/${reference}`);
  return res.data;
}

// ─── WITHDRAWALS ──────────────────────────────────────────────────────────────

/**
 * POST /api/withdraw
 * Body: { amount (kobo), transaction_pin }
 * Minimum: 500000 kobo (₦5,000)
 * Response: { message, reference }
 */
export async function requestWithdrawal({ amount_kobo, transaction_pin }) {
  const res = await api.post("/withdraw", {
    amount: amount_kobo,
    transaction_pin,
  });
  return res.data;
}

/**
 * GET /api/withdrawals/{reference}
 * Response: { status, amount_kobo, requested_at, updated_at }
 */
export async function getWithdrawalStatus(reference) {
  const res = await api.get(`/withdrawals/${reference}`);
  return res.data;
}

// ─── USER STATS & TRANSACTIONS ────────────────────────────────────────────────

/**
 * GET /api/user/stats
 * Response: { success, data: { lands_owned, units_owned, total_invested,
 *   total_invested_kobo, total_withdrawn, total_withdrawn_kobo,
 *   pending_withdrawals, balance, balance_kobo, rewards_balance,
 *   rewards_balance_kobo, total_spendable, total_spendable_kobo,
 *   total_rewards_claimed, withdrawal_daily_limit,
 *   withdrawal_daily_used_kobo, withdrawal_daily_remaining_kobo } }
 */
export async function getUserStats() {
  const res = await api.get("/user/stats");
  return res.data; // { success, data: {...} }
}

/**
 * GET /api/transactions/user
 * Response: { success, data: [...transactions] }
 * Each transaction has: type, amount, status, date, and optionally land/units
 */
export async function getUserTransactions() {
  const res = await api.get("/transactions/user");
  return res.data; // { success, data: [...] }
}

// ─── BANK DETAILS ─────────────────────────────────────────────────────────────

/**
 * GET /api/paystack/banks
 * Response: { data: [{ name, code }] }
 */
export async function getBanks() {
  const res = await api.get("/paystack/banks");
  return res.data; // { data: [...banks] }
}

/**
 * POST /api/paystack/resolve-account
 * Body: { account_number, bank_code }
 * Response: Paystack resolve response with account_name
 */
export async function resolveAccount({ account_number, bank_code }) {
  const res = await api.post("/paystack/resolve-account", {
    account_number,
    bank_code,
  });
  return res.data;
}

/**
 * PUT /api/user/bank-details
 * Body: { account_number, bank_name }
 * NOTE: Backend looks up bank_code from bank_name via Paystack, then verifies account
 * Response: { message, data: { bank_name, bank_code, account_number, account_name } }
 */
export async function updateBankDetails({ account_number, bank_name }) {
  const res = await api.put("/user/bank-details", {
    account_number,
    bank_name,
  });
  return res.data;
}