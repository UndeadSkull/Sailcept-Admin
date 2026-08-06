import { ApiResponse } from "../data/auth";
import { Boat, BoatListItem } from "../data/boats";
import { ENDPOINTS } from "../config/api";
import { apiClient } from "./apiClient";
import {
  BoatListItemResponse,
  BoatDetailResponse,
  BoatDocumentDetailsResponse,
  CancellationPolicyResponse,
} from "../data/boats";

export async function fetchBoats(): Promise<ApiResponse<BoatListItem[]>> {
  const res = await apiClient.get<BoatListItemResponse[] | BoatListItem[]>(ENDPOINTS.BOATS);
  if (res.data && Array.isArray(res.data)) {
    const list: BoatListItem[] = res.data.map((item: any) => ({
      id: item.boatId !== undefined ? item.boatId : item.id,
      name: item.boatName !== undefined ? item.boatName : item.name,
    }));
    return { data: list, error: null };
  }
  return { data: res.data ? [] : null, error: res.error };
}

export async function fetchBoatDetails(boatId: number): Promise<ApiResponse<Boat>> {
  const res = await apiClient.get<BoatDetailResponse>(`${ENDPOINTS.BOATS}/${boatId}`);
  if (res.data) {
    return { data: res.data, error: null };
  }
  return { data: null, error: res.error };
}

export async function fetchBoatDocumentDetails(boatId: number): Promise<ApiResponse<BoatDocumentDetailsResponse>> {
  return apiClient.get<BoatDocumentDetailsResponse>(`${ENDPOINTS.BOATS}/${boatId}/document`);
}

export async function fetchCancellationPolicies(
  boatId: number,
  activeOnly = true
): Promise<ApiResponse<CancellationPolicyResponse[]>> {
  return apiClient.get<CancellationPolicyResponse[]>(
    `${ENDPOINTS.BOATS}/${boatId}/cancellation-policies?activeOnly=${activeOnly}`
  );
}
