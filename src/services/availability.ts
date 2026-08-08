import { apiClient } from "./apiClient";
import { ApiResponse } from "../data/auth";
import {
  AvailabilityCalendarResponse,
  AvailabilitySelectionResponse,
  DateStatusRequest,
  RatesRequest,
  SharedInventoryRequest,
} from "../data/availability";

export async function fetchAvailabilityCalendar(
  boatId: number,
  month: string
): Promise<ApiResponse<AvailabilityCalendarResponse>> {
  return apiClient.get<AvailabilityCalendarResponse>(
    `/availability/boats/${boatId}/calendar?month=${encodeURIComponent(month)}`
  );
}

export async function fetchAvailabilitySelection(
  boatId: number,
  fromDate: string,
  toDate: string
): Promise<ApiResponse<AvailabilitySelectionResponse>> {
  return apiClient.get<AvailabilitySelectionResponse>(
    `/availability/boats/${boatId}/selection?from=${encodeURIComponent(
      fromDate
    )}&to=${encodeURIComponent(toDate)}`
  );
}

export async function updateAvailabilityDateStatus(
  boatId: number,
  data: DateStatusRequest
): Promise<ApiResponse<AvailabilitySelectionResponse>> {
  return apiClient.put<AvailabilitySelectionResponse>(
    `/availability/boats/${boatId}/date-status`,
    data
  );
}

export async function updateAvailabilityRates(
  boatId: number,
  data: RatesRequest
): Promise<ApiResponse<AvailabilitySelectionResponse>> {
  return apiClient.put<AvailabilitySelectionResponse>(
    `/availability/boats/${boatId}/rates`,
    data
  );
}

export async function updateAvailabilitySharedInventory(
  boatId: number,
  data: SharedInventoryRequest
): Promise<ApiResponse<AvailabilitySelectionResponse>> {
  return apiClient.put<AvailabilitySelectionResponse>(
    `/availability/boats/${boatId}/shared-inventory`,
    data
  );
}
