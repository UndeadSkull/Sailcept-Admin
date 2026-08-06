import { ApiResponse, PageResponse } from "../data/auth";
import { Review } from "../data/reviews";
import { ENDPOINTS } from "../config/api";
import { apiClient } from "./apiClient";

export type ReviewResponse = {
  reviewId: number;
  bookingId: number;
  boatId: number;
  bookingCode: string;
  boatName: string;
  guestName: string;
  reviewDate: string;
  cruiseTypeCode: string;
  cruiseTypeLabel: string;
  reviewText: string;
};

export async function fetchReviewsApi(params?: {
  boatId?: number;
  year?: number;
  month?: number;
  page?: number;
  size?: number;
}): Promise<ApiResponse<PageResponse<ReviewResponse>>> {
  const queryParts: string[] = [];
  if (params?.boatId && params.boatId > 0) queryParts.push(`boatId=${params.boatId}`);
  if (params?.year) queryParts.push(`year=${params.year}`);
  if (params?.month) queryParts.push(`month=${params.month}`);
  if (params?.page !== undefined) queryParts.push(`page=${params.page}`);
  if (params?.size !== undefined) queryParts.push(`size=${params.size}`);

  const queryString = queryParts.length ? `?${queryParts.join("&")}` : "";
  return apiClient.get<PageResponse<ReviewResponse>>(`${ENDPOINTS.REVIEWS}${queryString}`);
}

export async function fetchReviews(boatId?: number): Promise<ApiResponse<Review[]>> {
  const apiRes = await fetchReviewsApi({ boatId });
  if (apiRes.data?.content) {
    const list: Review[] = apiRes.data.content.map((r) => ({
      id: String(r.reviewId),
      boat: r.boatName,
      guest: r.guestName,
      rating: 5,
      cruiseType: r.cruiseTypeLabel || r.cruiseTypeCode,
      date: r.reviewDate,
      text: r.reviewText,
    }));
    return { data: list, error: null };
  }
  return { data: apiRes.data ? [] : null, error: apiRes.error };
}
