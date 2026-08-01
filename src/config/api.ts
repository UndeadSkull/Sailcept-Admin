export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || "https://tranquilintelligence.in/api/v1/operator";

export const ENDPOINTS = {
  AUTH_LOGIN: "/auth/login",
  PROFILE: "/profile",
  OVERVIEW_STATS: "/overview/stats",
  BOATS: "/boats",
  BOOKINGS: "/bookings",
  REQUESTS: "/requests",
  REVIEWS: "/reviews",
  NOTIFICATIONS: "/notifications",
  SEARCH: "/search",
} as const;
