export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || "https://tranquilintelligence.in/api/v1/operator";

export const ENDPOINTS = {
  AUTH_LOGIN: "/auth/login",
  PROFILE: "/profile",
  OVERVIEW_STATS: "/overview/stats",
  BOATS: "/boats",
  REQUESTS: "/requests",
  BOOKINGS: "/bookings",
  BOOKINGS_CALENDAR: "/bookings/calendar",
  BOOKINGS_ADDED_OPTIONS: "/bookings/added/options",
  BOOKINGS_ADDED: "/bookings/added",
  AVAILABILITY_CALENDAR: "/availability/boats",
  NOTIFICATIONS: "/notifications",
  NOTIFICATIONS_UNREAD_COUNT: "/notifications/unread-count",
  NOTIFICATIONS_MARK_ALL_READ: "/notifications/mark-all-read",
  SETTINGS_NOTIFICATIONS: "/settings/notifications",
  SETTINGS_DND: "/settings/dnd",
  REVIEWS: "/reviews",
  SEARCH: "/search",
} as const;

