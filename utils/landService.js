import api from "@/utils/api";

/**
 * GET /api/lands
 * Response: { success, data: [...lands] }
 * Each land: { id, title, location, size, is_available, price_per_unit_kobo,
 *   total_units, available_units, units_sold, sold_percentage, lat, lng,
 *   geometry_type, polygon, point, has_polygon, has_point,
 *   description, images: [{ id, url }] }
 */
export async function getLands(bounds = {}) {
  const params = {};
  if (bounds.north) params.north = bounds.north;
  if (bounds.south) params.south = bounds.south;
  if (bounds.east)  params.east  = bounds.east;
  if (bounds.west)  params.west  = bounds.west;
  const res = await api.get("/lands", { params });
  return res.data; // { success, data: [...] }
}

/**
 * GET /api/lands/{id}
 * Response: { success, data: land }
 */
export async function getLand(id) {
  const res = await api.get(`/lands/${id}`);
  return res.data; // { success, data: land }
}

/**
 * GET /api/lands/{id}/units
 * Response: { land_id, units_owned }
 */
export async function getUserUnitsForLand(landId) {
  const res = await api.get(`/lands/${landId}/units`);
  return res.data; // { land_id, units_owned }
}

/**
 * POST /api/lands/{id}/purchase
 * Body: { units, use_rewards?, transaction_pin }
 * Response: { message, reference, original_cost_kobo, discount_applied_kobo,
 *   discount_percent, paid_from_rewards_kobo, paid_from_wallet_kobo,
 *   total_paid_kobo, remaining_units }
 */
export async function purchaseLand({ landId, units, use_rewards = true, transaction_pin }) {
  const res = await api.post(`/lands/${landId}/purchase`, {
    units,
    use_rewards,
    transaction_pin,
  });
  return res.data;
}

/**
 * POST /api/lands/{id}/sell
 * Body: { units, transaction_pin }
 * Response: { message, reference, amount_received_kobo, amount_received_naira, available_units }
 */
export async function sellLand({ landId, units, transaction_pin }) {
  const res = await api.post(`/lands/${landId}/sell`, { units, transaction_pin });
  return res.data;
}

/**
 * GET /api/user/lands
 * Response: { owned_lands: [{ land_id, land_name, units_owned, price_per_unit_kobo, price_per_unit_naira, current_value }] }
 */
export async function getUserLands() {
  const res = await api.get("/user/lands");
  return res.data; // { owned_lands: [...] }
}