import api from "@/utils/api";

/**
 * GET /api/portfolio/summary
 * Response: { success, data: {
 *   total_units, total_invested_kobo, total_invested_naira,
 *   current_portfolio_value_kobo, current_portfolio_value_naira,
 *   total_profit_loss_kobo, total_profit_loss_naira, profit_loss_percent,
 *   lands: [{ land_id, land_name, units, price_per_unit_kobo,
 *             price_per_unit_naira, total_portfolio_value_kobo,
 *             total_portfolio_value_naira }]
 * }}
 */
export async function getPortfolioSummary() {
  const res = await api.get("/portfolio/summary");
  return res.data; // { success, data: {...} }
}

/**
 * GET /api/portfolio/chart?days=30
 * Response: { success, data: { days, snapshots: [{ date, value_kobo, value_naira,
 *   invested_kobo, invested_naira, profit_loss_kobo, profit_loss_naira }] } }
 */
export async function getPortfolioChart(days = 30) {
  const res = await api.get("/portfolio/chart", { params: { days } });
  return res.data;
}

/**
 * GET /api/portfolio/performance
 * Response: { success, data: { total_return_kobo, total_return_naira,
 *   total_return_percent, days_invested, annualized_return } }
 */
export async function getPortfolioPerformance() {
  const res = await api.get("/portfolio/performance");
  return res.data;
}

/**
 * GET /api/portfolio/allocation
 * Response: { success, data: { total_portfolio_value_kobo, total_value_naira,
 *   lands: [...with allocation_percent] } }
 */
export async function getPortfolioAllocation() {
  const res = await api.get("/portfolio/allocation");
  return res.data;
}