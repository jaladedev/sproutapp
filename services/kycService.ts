import api from "../utils/api";

export interface KycStatusResponse {
  status: string;
  [key: string]: unknown;
}

/* GET /kyc/status */
export async function getKycStatus(): Promise<KycStatusResponse> {
  const res = await api.get("/kyc/status");
  return res.data.data;
}

/* POST /kyc/submit — multipart form data (personal info + ID uploads) */
export async function submitKyc(fd: FormData): Promise<void> {
  await api.post("/kyc/submit", fd);
}
