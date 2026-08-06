import { ApiResponse } from "../data/auth";
import { Booking } from "../data/bookings";
import { ENDPOINTS } from "../config/api";
import { apiClient } from "./apiClient";
import { mapBookingSummaryToBooking } from "./bookings";

export async function searchBookingsApi(query: string): Promise<ApiResponse<Booking[]>> {
  const cleanQuery = query ? query.trim() : "";

  if (cleanQuery.length < 2) {
    return { data: [], error: null };
  }

  const endpoint = `${ENDPOINTS.SEARCH}?q=${encodeURIComponent(cleanQuery)}&limit=20`;
  const res = await apiClient.get<any>(endpoint);

  if (res.data) {
    let rawList: any[] = [];
    if (Array.isArray(res.data)) {
      rawList = res.data;
    } else if (Array.isArray(res.data.content)) {
      rawList = res.data.content;
    } else if (Array.isArray(res.data.results)) {
      rawList = res.data.results;
    }

    const bookings: Booking[] = rawList.map(mapBookingSummaryToBooking);
    return { data: bookings, error: null };
  }

  return { data: [], error: res.error };
}
