import api from "../utils/api";

export interface LandTransactionResponse {
  success: boolean;
  message?: string;
  [key: string]: unknown;
}

export interface UserLandUnitsResponse {
  units: number;
  [key: string]: unknown;
}

/* PURCHASE LAND */
export async function purchaseLand(
  id: string | number,
  units: number,
  pin: string
): Promise<LandTransactionResponse> {
  const res = await api.post(`/lands/${id}/purchase`, {
    units,
    transaction_pin: pin,
  });

  return res.data;
}

/* SELL LAND */
export async function sellLand(
  id: string | number,
  units: number,
  pin: string
): Promise<LandTransactionResponse> {
  const res = await api.post(`/lands/${id}/sell`, {
    units,
    transaction_pin: pin,
  });

  return res.data;
}

/* GET USER UNITS FOR LAND */
export async function getUserUnitsForLand(
  id: string | number
): Promise<UserLandUnitsResponse> {
  const res = await api.get(`/lands/${id}/units`);
  return res.data;
}
