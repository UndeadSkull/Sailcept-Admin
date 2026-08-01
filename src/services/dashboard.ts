import { ENDPOINTS } from "../config/api";
import { ApiResponse } from "../data/auth";
import { apiClient } from "./apiClient";

export type DashboardStat = {
  label: string;
  value: string;
  caption: string;
  tab?: "Availability" | "Requests" | "Bookings" | "More";
  isPending?: boolean;
};

export type UpcomingCruise = {
  name: string;
  dateLine: string;
  status: string;
  config: string;
  bookingId: string;
};

export type OverviewStatsResponse = {
  asOfDate: string;
  todaysTrips: number;
  pendingRequests: number;
  confirmedBookingsThisMonth: number;
  bookingConversionRateLast30Days: number;
};

export async function fetchOverviewStats(
  boatId?: number
): Promise<ApiResponse<OverviewStatsResponse>> {
  const query = boatId && boatId > 0 ? `?boatId=${boatId}` : "";
  return apiClient.get<OverviewStatsResponse>(`${ENDPOINTS.OVERVIEW_STATS}${query}`);
}

export async function fetchDashboardStats(boatId: number): Promise<ApiResponse<DashboardStat[]>> {
  const statsRes = await fetchOverviewStats(boatId > 0 ? boatId : undefined);
  if (statsRes.data) {
    const { todaysTrips, pendingRequests, confirmedBookingsThisMonth, bookingConversionRateLast30Days } = statsRes.data;
    return {
      data: [
        {
          label: "Today's trips",
          value: String(todaysTrips),
          caption: "Active & scheduled today",
          tab: "Bookings",
        },
        {
          label: "Pending requests",
          value: String(pendingRequests),
          caption: "Awaiting response",
          tab: "Requests",
          isPending: true,
        },
        {
          label: "Confirmed bookings",
          value: String(confirmedBookingsThisMonth),
          caption: "This month",
          tab: "Bookings",
        },
        {
          label: "Conversion rate",
          value: `${bookingConversionRateLast30Days}%`,
          caption: "Last 30 days",
        },
      ],
      error: null,
    };
  }

  // Fallback to empty default structure if stats call returns null/error
  return {
    data: [
      { label: "Today's trips", value: "0", caption: "Active & scheduled today", tab: "Bookings" },
      { label: "Pending requests", value: "0", caption: "Awaiting response", tab: "Requests", isPending: true },
      { label: "Confirmed bookings", value: "0", caption: "This month", tab: "Bookings" },
      { label: "Conversion rate", value: "0%", caption: "Last 30 days" },
    ],
    error: statsRes.error,
  };
}

export async function fetchUpcomingCruises(boatId: number): Promise<ApiResponse<UpcomingCruise[]>> {
  // Simple default mock structure for upcoming cruises preview
  const now = new Date();
  const currentYear = now.getFullYear();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonthStr = months[now.getMonth()];

  return {
    data: [
      {
        name: "Ethan Walker",
        dateLine: `Day cruise · 15 ${currentMonthStr} ${currentYear}`,
        status: "Confirmed",
        config: "Premium · Private · 2 adults",
        bookingId: "booking-1",
      },
    ],
    error: null,
  };
}
